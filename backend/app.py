from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask import render_template
from werkzeug.security import generate_password_hash, check_password_hash
from flask_admin import Admin, BaseView, expose
# Optional import for future SQLAlchemy usage - not currently used
try:
    from flask_admin.contrib.sqla import ModelView
except ImportError:
    ModelView = None  # Placeholder if SQLAlchemy not installed
from denodo_adapter import get_validated_ideas
import json
import re
import sqlite3
import traceback, sys
from datetime import datetime, timedelta
import random
import requests
import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask_httpauth import HTTPBasicAuth
import warnings
import zipfile
import tempfile
import shutil
from urllib.parse import urljoin
import uuid
import subprocess
import time
import threading
from functools import wraps
from bs4 import BeautifulSoup
from pytrends.request import TrendReq
import praw
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
warnings.filterwarnings('ignore')

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import and register Code Generator API
from codegen_api import codegen_bp
app.register_blueprint(codegen_bp, url_prefix='/api/codegen')

# API Keys from environment variables - no fallback values for security
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_API_KEY_2 = os.getenv('GEMINI_API_KEY_2', '')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY', '')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', '')

# Dataset paths
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'Data')

# Database paths
DB_PATH = os.path.join(os.path.dirname(__file__), 'wave_admin.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def db_exec(query, params=()):
    with sqlite3.connect(DB_PATH, check_same_thread=False) as conn:
        cur = conn.cursor()
        cur.execute(query, params)
        conn.commit()
        return cur.lastrowid

def db_query(query, params=()):
    with sqlite3.connect(DB_PATH, check_same_thread=False) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(query, params)
        return [dict(r) for r in cur.fetchall()]


def init_db():
    print(f"[init_db] cwd: {os.getcwd()}")
    print(f"[init_db] __file__ dir: {os.path.dirname(__file__)}")
    print(f"[init_db] DB_PATH = {DB_PATH}")
    print(f"[init_db] SCHEMA_PATH = {SCHEMA_PATH}")
    # show whether schema exists
    if os.path.exists(DB_PATH):
        print(f"[init_db] DB already exists at {DB_PATH} (size={os.path.getsize(DB_PATH)} bytes)")
        return
    if not os.path.exists(SCHEMA_PATH):
        print(f"[init_db] ERROR: schema file not found at {SCHEMA_PATH}", file=sys.stderr)
        raise FileNotFoundError(f"schema.sql not found at {SCHEMA_PATH}")
    try:
        with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        # create DB and apply schema
        conn = sqlite3.connect(DB_PATH)
        conn.executescript(schema_sql)
        conn.commit()
        conn.close()
        print(f"[init_db] Successfully initialized DB at {DB_PATH}")
        print(f"[init_db] DB file exists? {os.path.exists(DB_PATH)} (size={os.path.getsize(DB_PATH)} bytes)")
    except Exception as e:
        print("[init_db] ERROR while creating DB:", file=sys.stderr)
        traceback.print_exc()
        raise

# ✅ Call it once at startup
init_db()

def upgrade_db_schema():
    try:
        with sqlite3.connect(DB_PATH, check_same_thread=False) as conn:
            cur = conn.cursor()

            cur.execute("PRAGMA foreign_keys = ON")

            # Upgrade api_calls table
            cur.execute("PRAGMA table_info(api_calls)")
            cols = [r[1] for r in cur.fetchall()]
            if 'created_at' not in cols:
                try:
                    cur.execute("ALTER TABLE api_calls ADD COLUMN created_at TEXT")
                    print("[upgrade_db_schema] Added created_at column to api_calls")
                except Exception as e:
                    print(f"[upgrade_db_schema] Could not add created_at to api_calls: {e}")
            
            # Upgrade ideas table
            cur.execute("PRAGMA table_info(ideas)")
            ideas_cols = [r[1] for r in cur.fetchall()]
            if 'client_request_id' not in ideas_cols:
                try:
                    cur.execute("ALTER TABLE ideas ADD COLUMN client_request_id TEXT")
                    print("[upgrade_db_schema] Added client_request_id column to ideas")
                except Exception as e:
                    print(f"[upgrade_db_schema] Could not add client_request_id to ideas: {e}")

            # Create or upgrade llm_usage table
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='llm_usage'")
            if not cur.fetchone():
                cur.execute("CREATE TABLE llm_usage (id INTEGER PRIMARY KEY AUTOINCREMENT, llm_model TEXT UNIQUE, count INTEGER DEFAULT 0)")
                print("[upgrade_db_schema] Created llm_usage table")
            else:
                cur.execute("PRAGMA table_info(llm_usage)")
                llm_cols = [r[1] for r in cur.fetchall()]
                if 'llm_model' not in llm_cols:
                    cur.execute("ALTER TABLE llm_usage ADD COLUMN llm_model TEXT")
                if 'count' not in llm_cols:
                    cur.execute("ALTER TABLE llm_usage ADD COLUMN count INTEGER DEFAULT 0")
                cur.execute("PRAGMA index_list('llm_usage')")
                idx_rows = cur.fetchall()
                has_unique = False
                for idx in idx_rows:
                    idx_name = idx[1]
                    cur.execute(f"PRAGMA index_info('{idx_name}')")
                    cols_info = cur.fetchall()
                    if cols_info and cols_info[0][2] == 'llm_model':
                        cur.execute("SELECT sql FROM sqlite_master WHERE type='index' AND name=?", (idx_name,))
                        create_sql = cur.fetchone()
                        if create_sql and 'UNIQUE' in (create_sql[0] or '').upper():
                            has_unique = True
                            break
                if not has_unique:
                    try:
                        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_llm_usage_llm_model ON llm_usage(llm_model)")
                        print("[upgrade_db_schema] Created UNIQUE index on llm_usage")
                    except Exception as e:
                        print(f"[upgrade_db_schema] Could not create index: {e}")

            conn.commit()
            print("[upgrade_db_schema] Database upgrade complete")
    except Exception as e:
        print(f"[upgrade_db_schema] error: {e}")
        import traceback
        traceback.print_exc()

upgrade_db_schema()

# Simple credentials (for production, store hashed in env or DB)
ADMIN_USERS = {
    "admin1": generate_password_hash(os.getenv("ADMIN_MAYANK")),
    "krish": generate_password_hash(os.getenv("ADMIN_KRISH")),
    "aakash": generate_password_hash(os.getenv("ADMIN_AAKASH"))
}
auth = HTTPBasicAuth()

@auth.verify_password
def verify_password(username, password):
    print("[AUTH DEBUG]", username, bool(password))
    sys.stdout.flush()
    if username in ADMIN_USERS:
        ok = check_password_hash(ADMIN_USERS.get(username), password)
        print("[AUTH DEBUG] match:", ok)
        return ok
    return False



# Global variables for loaded datasets
datasets = {}
vectorizers = {}

# Memory storage directory
MEMORY_DIR = os.path.join(os.path.dirname(__file__), '..', 'project', 'memory')
os.makedirs(MEMORY_DIR, exist_ok=True)

def load_datasets():
    """Load all datasets from the Data folder"""
    global datasets, vectorizers
    
    try:
        # Load Financial dataset
        financial_path = os.path.join(DATA_DIR, 'financial.json')
        if os.path.exists(financial_path):
            with open(financial_path, 'r', encoding='utf-8') as f:
                datasets['financial'] = pd.read_json(f)
            print(f"✅ Loaded financial dataset: {len(datasets['financial'])} records")
        
        # Load Tech dataset
        tech_path = os.path.join(DATA_DIR, 'Tech.json')
        if os.path.exists(tech_path):
            with open(tech_path, 'r', encoding='utf-8') as f:
                datasets['tech'] = pd.read_json(f)
            print(f"✅ Loaded tech dataset: {len(datasets['tech'])} records")
        
        # Load Mental Health dataset
        mental_health_path = os.path.join(DATA_DIR, 'mental_health.json')
        if os.path.exists(mental_health_path):
            with open(mental_health_path, 'r', encoding='utf-8') as f:
                datasets['mental_health'] = pd.read_json(f)
            print(f"✅ Loaded mental health dataset: {len(datasets['mental_health'])} records")
        
        # Load Movies dataset
        movies_path = os.path.join(DATA_DIR, 'Movies.json')
        if os.path.exists(movies_path):
            with open(movies_path, 'r', encoding='utf-8') as f:
                datasets['movies'] = pd.read_json(f)
            print(f"✅ Loaded movies dataset: {len(datasets['movies'])} records")
        
        # Load GK dataset
        gk_path = os.path.join(DATA_DIR, 'GK.json')
        if os.path.exists(gk_path):
            with open(gk_path, 'r', encoding='utf-8') as f:
                datasets['gk'] = pd.read_json(f)
            print(f"✅ Loaded GK dataset: {len(datasets['gk'])} records")
        
        # Initialize vectorizers for text analysis
        initialize_vectorizers()
        
    except Exception as e:
        print(f"❌ Error loading datasets: {e}")

def initialize_vectorizers():
    """Initialize TF-IDF vectorizers for text analysis"""
    global vectorizers
    
    try:
        # Financial news vectorizer
        if 'financial' in datasets and 'Headline' in datasets['financial'].columns:
            headlines = datasets['financial']['Headline'].dropna().astype(str)
            vectorizers['financial'] = TfidfVectorizer(max_features=1000, stop_words='english')
            vectorizers['financial'].fit(headlines)
        
        # Tech survey vectorizer
        if 'tech' in datasets:
            tech_texts = []
            for col in datasets['tech'].columns:
                if col and datasets['tech'][col].dtype == 'object':
                    tech_texts.extend(datasets['tech'][col].dropna().astype(str))
            if tech_texts:
                vectorizers['tech'] = TfidfVectorizer(max_features=500, stop_words='english')
                vectorizers['tech'].fit(tech_texts)
        
        print("✅ Vectorizers initialized")
        
    except Exception as e:
        print(f"❌ Error initializing vectorizers: {e}")

# Initialize the new validation system
# Load .env with flexible paths so Validation_score folder is optional
backend_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(backend_dir, '..'))
env_in_backend = os.path.join(backend_dir, '.env')
env_in_validation_score = os.path.join(project_root, 'Validation_score', '.env')

if os.path.exists(env_in_backend):
    load_dotenv(env_in_backend)
elif os.path.exists(env_in_validation_score):
    load_dotenv(env_in_validation_score)
else:
    # Load from default locations or system environment
    load_dotenv()

# Initialize SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize external APIs
pytrends = TrendReq(hl='en-US', tz=360)
news_api_key = os.getenv("NEWS_API_KEY")
github_token = os.getenv("GITHUB_TOKEN")

# Debug: Check if API keys are loaded
print(f"DEBUG - NEWS_API_KEY loaded: {bool(news_api_key)}")
print(f"DEBUG - GITHUB_TOKEN loaded: {bool(github_token)}")
print(f"DEBUG - REDDIT_CLIENT_ID loaded: {bool(os.getenv('REDDIT_CLIENT_ID'))}")

reddit = praw.Reddit(
    client_id=os.getenv("REDDIT_CLIENT_ID"),
    client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
    user_agent=os.getenv("REDDIT_USER_AGENT")
)

def extract_keywords(idea, top_n=5):
    """Extract keywords from idea using semantic analysis"""
    words = re.findall(r'\b\w+\b', idea.lower())
    candidates = [' '.join(words[i:j]) for i in range(len(words)) for j in range(i+1, min(i+4, len(words)+1))]
    embeddings = model.encode(candidates)
    norms = [np.linalg.norm(vec) for vec in embeddings]
    ranked = sorted(zip(candidates, norms), key=lambda x: x[1], reverse=True)
    return [phrase for phrase, _ in ranked[:top_n]]

def simplify_idea(idea):
    """Simplify idea to base terms using semantic similarity"""
    base_terms = [
        "AI", "automation", "assistant", "health", "fitness", "education", "finance",
        "business", "sports", "technology", "medical", "robot", "app", "startup",
        "doctor", "chatbot", "device", "wearable", "productivity", "marketing", "data"
    ]
    idea_vec = model.encode([idea])
    term_vecs = model.encode(base_terms)
    similarities = np.dot(term_vecs, idea_vec.T) / (
        np.linalg.norm(term_vecs, axis=1, keepdims=True) * np.linalg.norm(idea_vec)
    )
    top_indices = np.argsort(similarities.flatten())[-3:]
    top_terms = [base_terms[i] for i in top_indices]
    return " ".join(top_terms) if top_terms else idea

# Market Potential Class
class MarketPotential:
    def __init__(self, pytrends, reddit, news_api_key):
        self.pytrends = pytrends
        self.reddit = reddit
        self.news_api_key = news_api_key
        self.categories = {
            "Business": 12, "Health": 45, "Sports": 20, "Technology": 5,
            "Finance": 7, "Education": 74, "Internet": 13,
        }

    def get_pytrends_score(self, idea):
        """Get Google Trends score for the idea"""
        scores = []
        keywords = [word for word in re.findall(r'\b\w+\b', idea) if len(word) > 2][:3]
        if not keywords:
            keywords = [idea]
        
        for cat in self.categories.values():
            try:
                self.pytrends.build_payload(keywords, cat=cat, timeframe='now 3-y', geo='', gprop='')
                data = self.pytrends.interest_over_time()
                if data.empty:
                    scores.append(40)
                else:
                    trend_mean = data[keywords].mean().mean()
                    scores.append(int(trend_mean))
            except Exception:
                scores.append(40)
        
        return int(np.mean(scores)) if scores else 40

    def fetch_reddit_posts(self, idea, limit=50):
        """Get Reddit engagement score for the idea"""
        Score2 = []
        for category in self.categories:
            total_engagement = 0
            total_posts = 0
            try:
                subreddit = self.reddit.subreddit(category.lower())
                for submission in subreddit.search(idea, limit=limit):
                    total_engagement += submission.score + submission.num_comments
                    total_posts += 1
            except Exception:
                pass
            
            if total_posts == 0:
                Score2.append(40)
            else:
                Score2.append(int(total_engagement / total_posts))
        return int(np.mean(Score2)) if Score2 else 40

    def get_newsapi_score(self, idea, NEWS_API):
        """Get News API score for the idea"""
        Score3 = []
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": idea,
            "from": (datetime.now() - pd.Timedelta(days=90)).strftime("%Y-%m-%d"),
            "sortBy": "relevancy",
            "language": "en",
            "pageSize": 100,
            "apiKey": NEWS_API
        }

        try:
            response = requests.get(url, params=params)
            if response.status_code != 200:
                Score3.append(40)
            else:
                data = response.json()
                total_articles = data.get("totalResults", 0)
                if total_articles == 0:
                    Score3.append(40)
                elif total_articles < 20:
                    Score3.append(50)
                elif total_articles < 50:
                    Score3.append(70)
                elif total_articles < 75:
                    Score3.append(80)
                else:
                    Score3.append(100)
        except Exception:
            Score3.append(40)
        
        return int(np.mean(Score3)) if Score3 else 40

    def normalize_score(self, score, min_val=0, max_val=100):
        """Ensure all scores stay between 0 and 100"""
        if score < min_val:
            return min_val
        elif score > max_val:
            return max_val
        return score

# Technical Risk Class
class TechnicalRisk:
    def __init__(self, GITHUB_TOKEN):
        self.GITHUB_TOKEN = GITHUB_TOKEN

    def github_score(self, idea):
        """Get GitHub repository score for the idea"""
        url = f"https://api.github.com/search/repositories?q={idea}+in:name,description"
        headers = {"Authorization": f"token {self.GITHUB_TOKEN}"}
        
        Score4 = []
        try:
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                Score4.append(40)
                return int(np.mean(Score4)) 
            
            data = response.json()
            total_repos = data.get("total_count", 0)
            repos = data.get("items", [])

            if total_repos == 0 or not repos:
                Score4.append(40)
                return int(np.mean(Score4))
            
            repos = repos[:1000]
            stars = np.mean([repo["stargazers_count"] for repo in repos])
            forks = np.mean([repo["forks_count"] for repo in repos])

            recent_updates = 0
            for repo in repos:
                last_update = datetime.strptime(repo["updated_at"], "%Y-%m-%dT%H:%M:%SZ")
                if (datetime.now() - last_update).days < 90:
                    recent_updates += 1
            activity_ratio = recent_updates / len(repos)

            base_score = min(np.log10(total_repos + 1) / 3, 1) * 40  
            stars_score = min(np.log1p(stars) / np.log(501), 1) * 35
            activity_score = activity_ratio * 25
            total_score = base_score + stars_score + activity_score
            Score4.append(int(total_score))

        except Exception:
            Score4.append(20)

        return int(np.mean(Score4)) if Score4 else 40

# Competition Class
class Competition:
    def __init__(self, GITHUB_TOKEN, reddit):
        self.GITHUB_TOKEN = GITHUB_TOKEN
        self.reddit = reddit
        self.categories = [
            "Business", "Health", "Sports", "Technology",
            "Finance", "Education", "Internet"
        ]

    def github_score_competition(self, idea):
        """Get competition score from GitHub"""
        url = f"https://api.github.com/search/repositories?q={idea}+in:name,description"
        headers = {"Authorization": f"token {self.GITHUB_TOKEN}"}

        Score5 = []
        try:
            response = requests.get(url, headers=headers)
            if response.status_code != 200:
                Score5.append(40)
                return int(np.mean(Score5))

            data = response.json()
            total_repos = data.get("total_count", 0)
            repos = data.get("items", [])[:100]

            if not repos:
                Score5.append(40)
                return int(np.mean(Score5))

            stars = np.mean([repo["stargazers_count"] for repo in repos])
            forks = np.mean([repo["forks_count"] for repo in repos])

            if total_repos == 0:
                Score5.append(40)
            elif total_repos < 50 and stars < 60 and forks < 50:
                Score5.append(60)
            elif total_repos < 80 and stars < 70 and forks < 60:
                Score5.append(70)
            elif total_repos < 100 and stars < 80 and forks < 70:
                Score5.append(80)
            elif total_repos < 120 and stars < 90 and forks < 80:
                Score5.append(90)
            else:
                Score5.append(100)
        
        except Exception:
            Score5.append(40)

        return int(np.mean(Score5)) if Score5 else 40

    def fetch_reddit_posts_competition(self, idea, limit=50):
        """Get competition score from Reddit"""
        Score6 = []
        for category in self.categories:
            total_posts = 0
            try:
                subreddit = self.reddit.subreddit(category.lower())
                for submission in subreddit.search(idea, limit=limit):
                    total_posts += 1
            except Exception:
                pass

            # Fewer posts = low competition
            if total_posts == 0:
                Score6.append(90)
            elif total_posts < 10:
                Score6.append(80)
            elif total_posts < 30:
                Score6.append(70)
            else:
                Score6.append(50)

        return int(np.mean(Score6)) if Score6 else 40

# Final Score Class   
class FinalScore:
    def __init__(self, marketpotential, technicalrisk, competition):
        self.market = marketpotential
        self.technical = technicalrisk
        self.competition = competition

    def calculate_final_score_market(self, idea):
        """Calculate market potential score"""
        simplified_idea = simplify_idea(idea)
        keywords = extract_keywords(idea)
        
        score1 = self.market.get_pytrends_score(" ".join(keywords))
        score2 = self.market.fetch_reddit_posts(" ".join(keywords))
        score3 = self.market.get_newsapi_score(" ".join(keywords), self.market.news_api_key)

        score1 = self.market.normalize_score(score1)
        score2 = self.market.normalize_score(score2)
        score3 = self.market.normalize_score(score3)

        weights = [0.2, 0.4, 0.4]
        return int(np.dot([score1, score2, score3], weights))

    def calculate_final_score_technical(self, idea):
        """Calculate technical feasibility score"""
        simplified_idea = simplify_idea(idea)
        score4 = self.technical.github_score(simplified_idea)
        score4 = self.market.normalize_score(score4)
        return score4
    
    def calculate_final_score_competition(self, idea):
        """Calculate competition score"""
        simplified_idea = simplify_idea(idea)
        keywords = extract_keywords(idea)
        
        score5 = self.competition.github_score_competition(" ".join([simplified_idea] + keywords))
        score6 = self.competition.fetch_reddit_posts_competition(" ".join([simplified_idea] + keywords))

        score5 = self.market.normalize_score(score5)
        score6 = self.market.normalize_score(score6)

        weights = [0.6, 0.4]
        return int(np.dot([score5, score6], weights))

    def combine_scores(self, idea):
        """Combine all scores into final validation score"""
        market_score = self.calculate_final_score_market(idea)
        technical_score = self.calculate_final_score_technical(idea)
        competition_score = self.calculate_final_score_competition(idea)
        final_score = int(np.dot([market_score, technical_score, competition_score], [0.4, 0.3, 0.3]))
        return final_score

# Initialize the validation system
market_obj = MarketPotential(pytrends, reddit, news_api_key)
technical_obj = TechnicalRisk(github_token)
competition_obj = Competition(github_token, reddit)
final_score_calculator = FinalScore(market_obj, technical_obj, competition_obj)

def get_user_idea_from_request():
    """Get the user's idea from the request data (from resurrect/mutate/build pages)"""
    try:
        # Try to get idea from request data
        if request.is_json and request.json:
            data = request.json
            # Check for different possible fields that might contain the idea
            idea = (data.get('idea') or 
                   data.get('ideaText') or 
                   data.get('idea_text') or 
                   data.get('user_idea') or 
                   data.get('input') or 
                   data.get('text'))
            
            if idea:
                return idea
        
        # Try to get from form data
        idea = (request.form.get('idea') or 
               request.form.get('ideaText') or 
               request.form.get('idea_text') or 
               request.form.get('user_idea') or 
               request.form.get('input') or 
               request.form.get('text'))
        
        if idea:
            return idea
            
        # Try to get from query parameters
        idea = (request.args.get('idea') or 
               request.args.get('ideaText') or 
               request.args.get('idea_text') or 
               request.args.get('user_idea') or 
               request.args.get('input') or 
               request.args.get('text'))
        
        if idea:
            return idea
            
        return None
        
    except Exception as e:
        print(f"Error getting user idea: {e}")
        return None

def analyze_market_trends(idea_text=None):
    """Analyze market trends using the new system"""
    try:
        # If no idea provided, try to get from request
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return {"error": "No idea provided for market analysis"}
            
        market_score = final_score_calculator.calculate_final_score_market(idea_text)
        return {
            "market_score": market_score,
            "analysis_method": "pytrends_reddit_newsapi",
            "analysis_date": datetime.now().isoformat(),
            "idea_analyzed": idea_text[:100] + "..." if len(idea_text) > 100 else idea_text
        }
    except Exception as e:
        return {"error": f"Market analysis error: {str(e)}"}

def analyze_tech_trends(idea_text=None):
    """Analyze tech trends using the new system"""
    try:
        # If no idea provided, try to get from request
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return {"error": "No idea provided for tech analysis"}
            
        tech_score = final_score_calculator.calculate_final_score_technical(idea_text)
        return {
            "tech_score": tech_score,
            "analysis_method": "github_repository_analysis",
            "analysis_date": datetime.now().isoformat(),
            "idea_analyzed": idea_text[:100] + "..." if len(idea_text) > 100 else idea_text
        }
    except Exception as e:
        return {"error": f"Tech analysis error: {str(e)}"}

def analyze_competition(idea_text=None):
    """Analyze competition using the new system"""
    try:
        # If no idea provided, try to get from request
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return {"error": "No idea provided for competition analysis"}
            
        competition_score = final_score_calculator.calculate_final_score_competition(idea_text)
        return {
            "competition_score": competition_score,
            "analysis_method": "github_reddit_competition_analysis",
            "analysis_date": datetime.now().isoformat(),
            "idea_analyzed": idea_text[:100] + "..." if len(idea_text) > 100 else idea_text
        }
    except Exception as e:
        return {"error": f"Competition analysis error: {str(e)}"}

def calculate_validation_score(idea_text=None, market_analysis=None, tech_analysis=None, competition_analysis=None):
    """Calculate validation score using the new comprehensive system"""
    try:
        # If no idea provided, try to get from request
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return {"error": "No idea provided for validation scoring"}
        
        # If no analyses provided, generate them
        if not market_analysis:
            market_analysis = analyze_market_trends(idea_text)
        if not tech_analysis:
            tech_analysis = analyze_tech_trends(idea_text)
        if not competition_analysis:
            competition_analysis = analyze_competition(idea_text)
        
        # Get the comprehensive score from the new system
        final_score = final_score_calculator.combine_scores(idea_text)
        
        # Extract individual scores for detailed breakdown
        market_score = final_score_calculator.calculate_final_score_market(idea_text)
        tech_score = final_score_calculator.calculate_final_score_technical(idea_text)
        competition_score = final_score_calculator.calculate_final_score_competition(idea_text)
        
        # Debug: Log the scores
        print(f"DEBUG - Idea: {idea_text[:50]}...")
        print(f"DEBUG - Final Score: {final_score}")
        print(f"DEBUG - Market Score: {market_score}")
        print(f"DEBUG - Tech Score: {tech_score}")
        print(f"DEBUG - Competition Score: {competition_score}")
        
        # Determine confidence level
        confidence_level = "High" if final_score > 75 else "Medium" if final_score > 55 else "Low"
        
        return {
            "validation_score": final_score,
            "confidence_level": confidence_level,
            "factors_analyzed": [
                "market_trends", "technical_feasibility", "competition_analysis",
                "reddit_engagement", "github_activity", "news_coverage"
            ],
            "analysis_date": datetime.now().isoformat(),
            "market_score": market_score,
            "tech_score": tech_score,
            "competition_score": competition_score,
            "idea_analyzed": idea_text[:100] + "..." if len(idea_text) > 100 else idea_text,
            "detailed_breakdown": {
                "market_analysis": market_analysis,
                "tech_analysis": tech_analysis,
                "competition_analysis": competition_analysis,
                "final_combined_score": final_score,
                "scoring_method": "comprehensive_api_analysis"
            }
        }
        
    except Exception as e:
        return {"error": f"Validation score calculation error: {str(e)}"}

def generate_business_plan(idea_text, validation_score, market_analysis):
    """Generate a business plan based on analysis"""
    try:
        # Determine business model based on idea content
        idea_lower = idea_text.lower()
        
        business_model = "Service-based"
        if any(word in idea_lower for word in ['app', 'software', 'platform', 'saas']):
            business_model = "Software as a Service (SaaS)"
        elif any(word in idea_lower for word in ['product', 'manufacturing', 'physical']):
            business_model = "Product-based"
        elif any(word in idea_lower for word in ['marketplace', 'ecommerce', 'store']):
            business_model = "Marketplace"
        
        # Revenue projections based on validation score
        base_revenue = validation_score * 1000  # $1000 per point
        year1_revenue = base_revenue
        year2_revenue = base_revenue * 1.5
        year3_revenue = base_revenue * 2.5
        
        # Market size estimation
        market_size = "Small to Medium"
        if validation_score > 70:
            market_size = "Large"
        elif validation_score < 40:
            market_size = "Niche"
        
        return {
            "business_model": business_model,
            "market_size": market_size,
            "revenue_projections": {
                "year_1": f"${year1_revenue:,.0f}",
                "year_2": f"${year2_revenue:,.0f}",
                "year_3": f"${year3_revenue:,.0f}"
            },
            "key_metrics": {
                "customer_acquisition_cost": f"${validation_score * 10:,.0f}",
                "lifetime_value": f"${validation_score * 50:,.0f}",
                "break_even_months": max(6, 24 - (validation_score // 4))
            },
            "recommended_actions": [
                "Conduct detailed market research",
                "Develop MVP (Minimum Viable Product)",
                "Identify target customer segments",
                "Create go-to-market strategy",
                "Secure initial funding if needed"
            ],
            "risk_factors": [
                "Market competition",
                "Technology implementation challenges",
                "Customer adoption rate",
                "Regulatory compliance"
            ],
            "analysis_date": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"error": f"Business plan generation error: {str(e)}"}

# API Monitoring Decorator
def monitor_api(endpoint_name=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            start = time.time()
            status = 200
            success = 1
            error = None
            try:
                resp = f(*args, **kwargs)
                # If view returns (body, status), try to extract status
                try:
                    status = getattr(resp, "status_code", status)
                except:
                    pass
                return resp
            except Exception as e:
                status = 500
                success = 0
                error = str(e)
                raise
            finally:
                latency_ms = int((time.time() - start) * 1000)
                try:
                    db_exec("""
                        INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        endpoint_name or request.path,
                        request.method,
                        status,
                        latency_ms,
                        success,
                        error,
                        json.dumps({'args': request.args.to_dict(), 'json': request.get_json(silent=True)})
                    ))
                except Exception as db_e:
                    # avoid crashing the main flow if logging fails
                    print("DB log error:", db_e)
        return wrapper
    return decorator


# WAVE AI Knowledge Base
WAVE_AI_KNOWLEDGE = {
    "what_is_wave_ai": {
        "description": "WAVE AI is an innovative idea management and development platform that helps users nurture, develop, and bring their creative ideas to life.",
        "features": [
            "Idea Graveyard - A place to store and resurrect forgotten ideas",
            "Idea Validation - Tools to test and validate your concepts",
            "Project Management - Organize and track idea development",
            "AI-Powered Insights - Get intelligent feedback on your ideas",
            "Community Collaboration - Share and collaborate on ideas"
        ],
        "mission": "To democratize innovation by making idea development accessible to everyone, regardless of their background or resources."
    },
    "how_it_works": {
        "process": [
            "Submit your idea through our intuitive interface",
            "Get AI-powered analysis and feedback",
            "Validate your concept with market research tools",
            "Develop your idea into a full project",
            "Track progress and iterate based on insights"
        ]
    },
    "benefits": [
        "Transform abstract thoughts into concrete plans",
        "Get expert-level feedback without the cost",
        "Connect with like-minded innovators",
        "Learn from successful idea development patterns",
        "Build confidence in your creative abilities"
    ]
}

# Life Guidance Responses
LIFE_GUIDANCE_RESPONSES = {
    "career": [
        "Consider what truly energizes you - your passion often points to your purpose. What activities make you lose track of time?",
        "Success isn't just about climbing the ladder, it's about building something meaningful. What impact do you want to make?",
        "Your career should align with your values. What principles are non-negotiable for you?",
        "Don't be afraid to pivot. Many successful people changed direction multiple times before finding their calling.",
        "Focus on developing skills that are transferable across industries - adaptability is your greatest asset."
    ],
    "relationships": [
        "Healthy relationships are built on mutual respect, trust, and genuine care. Are you giving what you hope to receive?",
        "Communication is the foundation of any strong relationship. Practice active listening and express your needs clearly.",
        "Boundaries are not walls - they're the gates and fences that protect your emotional garden.",
        "Quality over quantity. Invest in relationships that bring out the best in you and vice versa.",
        "Forgiveness doesn't mean forgetting - it means freeing yourself from the weight of resentment."
    ],
    "personal_growth": [
        "Growth happens outside your comfort zone. What's one small step you can take today?",
        "Self-awareness is the first step to self-improvement. Regular reflection helps you understand your patterns.",
        "Mistakes are not failures - they're data points that guide you toward better decisions.",
        "Your thoughts shape your reality. Practice positive self-talk and challenge limiting beliefs.",
        "Progress, not perfection. Celebrate small wins and learn from setbacks."
    ],
    "purpose": [
        "Your purpose isn't something you find - it's something you create through your actions and choices.",
        "Look at what breaks your heart or makes you angry - these emotions often point to your calling.",
        "Your purpose can evolve. What matters is that you're moving toward something meaningful to you.",
        "Service to others often reveals our deepest sense of purpose. How can you help solve problems you care about?",
        "Your unique combination of experiences, skills, and passions is your superpower - use it."
    ],
    "general": [
        "Life is a series of experiments. Test your assumptions, learn from results, and iterate.",
        "Your present moment is the only time you have any power. Focus on what you can control.",
        "Comparison is the thief of joy. Your journey is uniquely yours - embrace it.",
        "Gratitude shifts your perspective. Even in difficult times, there's always something to appreciate.",
        "You are not your circumstances. You are your response to your circumstances."
    ]
}

def analyze_idea(idea_text=None):
    """Analyze an idea using live datasets and AI APIs - automatically gets user input from frontend"""
    try:
        # If no idea provided, try to get from request (from resurrect/mutate/build pages)
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return {"error": "No idea provided for analysis"}
        
        # Perform market analysis using financial data
        market_analysis = analyze_market_trends(idea_text)
        
        # Perform tech trend analysis
        tech_analysis = analyze_tech_trends(idea_text)
        
        # Calculate validation score
        validation_score_data = calculate_validation_score(idea_text, market_analysis, tech_analysis)
        
        # Generate business plan
        business_plan = generate_business_plan(idea_text, validation_score_data.get('validation_score', 50), market_analysis)
        
        # Enhanced AI analysis using Gemini
        ai_analysis = get_enhanced_ai_analysis(idea_text, market_analysis, tech_analysis)
        
        # Categorize the idea
        idea_lower = idea_text.lower()
        category = "general"
        if any(word in idea_lower for word in ["app", "software", "website", "tech", "digital", "online"]):
            category = "technology"
        elif any(word in idea_lower for word in ["business", "startup", "company", "service", "product"]):
            category = "business"
        elif any(word in idea_lower for word in ["art", "creative", "design", "music", "writing", "content"]):
            category = "creative"
        elif any(word in idea_lower for word in ["social", "community", "help", "charity", "volunteer"]):
            category = "social"
        
        return {
            "original_idea": idea_text,
            "category": category,
            "validation_score": validation_score_data,
            "market_analysis": market_analysis,
            "tech_analysis": tech_analysis,
            "business_plan": business_plan,
            "ai_insights": ai_analysis,
            "strengths": ai_analysis.get("strengths", []),
            "considerations": ai_analysis.get("considerations", []),
            "next_steps": ai_analysis.get("next_steps", []),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        # Fallback to basic analysis if dataset analysis fails
        return {
            "original_idea": idea_text,
            "category": "general",
            "strengths": ["Your idea shows creative thinking"],
            "considerations": ["Consider market validation and feasibility"],
            "next_steps": ["Research your target market and create a prototype"],
            "error": f"Advanced analysis unavailable: {str(e)}"
        }

def get_perplexity_market_insights(idea_text):
    """Get real-time market insights using Perplexity API"""
    try:
        response = requests.post(
            'https://api.perplexity.ai/chat/completions',
            headers={
                'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.1-sonar-small-128k-online',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a market research analyst. Provide concise, data-driven insights about market trends, competition, and opportunities.'
                    },
                    {
                        'role': 'user',
                        'content': f'Provide current market insights for this business idea: "{idea_text}". Include: 1) Market size and trends, 2) Key competitors, 3) Growth opportunities. Keep it concise (3-4 sentences).'
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 300
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            return "Market insights unavailable"
            
    except Exception as e:
        print(f"Perplexity API error: {e}")
        return "Market insights unavailable"

def analyze_idea_with_perplexity_deepseek(idea_text):
    """Analyze idea using Perplexity for market research and Deepseek for technical analysis"""
    try:
        # Use Perplexity for market analysis
        perplexity_prompt = f"""Analyze this business idea comprehensively: "{idea_text}"

Provide a detailed analysis including:
1. Market validation score (0-100) with confidence level
2. Market size, trends, and opportunities
3. Key competitors and competitive landscape
4. Target customer demographics
5. Revenue potential and business model suggestions
6. Key strengths and differentiators
7. Potential challenges and risks
8. Recommended next steps

Format your response as a structured analysis with clear sections."""
        
        perplexity_response = requests.post(
            'https://api.perplexity.ai/chat/completions',
            headers={
                'Authorization': f'Bearer {PERPLEXITY_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.1-sonar-large-128k-online',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert business analyst specializing in startup validation and market research. Provide comprehensive, data-driven analysis.'
                    },
                    {
                        'role': 'user',
                        'content': perplexity_prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            },
            timeout=20
        )
        
        market_analysis = ""
        if perplexity_response.ok:
            market_data = perplexity_response.json()
            market_analysis = market_data['choices'][0]['message']['content']
        else:
            market_analysis = "Market analysis unavailable. Please try again."
        
        # Use Deepseek for technical and strategic analysis
        deepseek_prompt = f"""Provide a technical and strategic analysis for this business idea: "{idea_text}"

Analyze:
1. Technical feasibility and implementation complexity
2. Technology stack recommendations
3. Innovation potential and uniqueness
4. Scalability considerations
5. Strategic advantages and positioning
6. Development roadmap suggestions
7. Resource requirements

Provide actionable insights in clear, structured format."""
        
        deepseek_response = requests.post(
            'https://api.deepseek.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'deepseek-chat',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a technical business strategist. Provide detailed technical and strategic analysis for business ideas.'
                    },
                    {
                        'role': 'user',
                        'content': deepseek_prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            },
            timeout=20
        )
        
        technical_analysis = ""
        if deepseek_response.ok:
            tech_data = deepseek_response.json()
            technical_analysis = tech_data['choices'][0]['message']['content']
        else:
            technical_analysis = "Technical analysis unavailable. Please try again."
        
        # Combine analyses
        combined_analysis = f"""# 💡 Comprehensive Idea Analysis

## 📊 Market Analysis (via Perplexity)
{market_analysis}

## 🔧 Technical & Strategic Analysis (via Deepseek)
{technical_analysis}

## 📈 Overall Assessment
Based on the market and technical analysis above, this idea shows potential. Review the insights above to make informed decisions about next steps."""
        
        # Calculate a simple validation score
        validation_score = 65  # Default score
        if "high potential" in market_analysis.lower() or "strong market" in market_analysis.lower():
            validation_score = 80
        elif "moderate" in market_analysis.lower() or "competitive" in market_analysis.lower():
            validation_score = 60
        
        return {
            "original_idea": idea_text,
            "category": "general",
            "validation_score": {
                "validation_score": validation_score,
                "confidence_level": "Medium-High"
            },
            "market_analysis": {
                "analysis": market_analysis,
                "source": "Perplexity AI"
            },
            "tech_analysis": {
                "analysis": technical_analysis,
                "source": "Deepseek AI"
            },
            "ai_analysis": {
                "analysis": combined_analysis
            },
            "analysis_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error in analyze_idea_with_perplexity_deepseek: {e}")
        import traceback
        traceback.print_exc()
        return {
            "original_idea": idea_text,
            "category": "general",
            "validation_score": {
                "validation_score": 50,
                "confidence_level": "Low"
            },
            "error": f"Analysis error: {str(e)}"
        }

def get_enhanced_ai_analysis(idea_text, market_analysis, tech_analysis):
    """Get enhanced AI analysis using Groq for ultra-fast responses"""
    try:
        # Use Groq for fast, comprehensive analysis
        prompt = f"""Analyze this business idea:

Idea: "{idea_text}"

Provide a structured analysis in JSON format with:
1. strengths: Array of 3-5 key strengths
2. considerations: Array of 3-5 important considerations
3. next_steps: Array of 3-5 actionable next steps

Keep each point concise and actionable. Focus on practical business insights."""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a business analysis expert. Provide structured, actionable insights in JSON format.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 600,
                'response_format': {'type': 'json_object'}
            },
            timeout=10
        )
        
        if response.ok:
            data = response.json()
            ai_text = data['choices'][0]['message']['content']
            
            # Try to parse JSON response
            try:
                return json.loads(ai_text)
            except:
                # Fallback: parse the text response
                return parse_ai_response(ai_text)
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"AI Analysis Error: {e}")
        return {
            "strengths": ["Your idea shows potential for market impact", "Addresses a real problem", "Scalable business model"],
            "considerations": ["Consider thorough market research and validation", "Assess competition landscape", "Evaluate resource requirements"],
            "next_steps": ["Develop a detailed business plan", "Create MVP prototype", "Conduct customer interviews"]
        }

def parse_ai_response(text):
    """Parse AI response text into structured format"""
    try:
        lines = text.split('\n')
        strengths = []
        considerations = []
        next_steps = []
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if 'strength' in line.lower():
                current_section = 'strengths'
            elif 'consideration' in line.lower():
                current_section = 'considerations'
            elif 'step' in line.lower() or 'action' in line.lower():
                current_section = 'next_steps'
            elif line.startswith(('-', '•', '1.', '2.', '3.', '4.', '5.')):
                # Remove bullet points and numbers
                clean_line = re.sub(r'^[-•\d\.\s]+', '', line).strip()
                if clean_line and current_section:
                    if current_section == 'strengths':
                        strengths.append(clean_line)
                    elif current_section == 'considerations':
                        considerations.append(clean_line)
                    elif current_section == 'next_steps':
                        next_steps.append(clean_line)
        
        return {
            "strengths": strengths[:5] if strengths else ["Your idea shows creative potential"],
            "considerations": considerations[:5] if considerations else ["Consider market validation"],
            "next_steps": next_steps[:5] if next_steps else ["Research your target market"]
        }
        
    except Exception as e:
        return {
            "strengths": ["Your idea shows potential"],
            "considerations": ["Consider market research"],
            "next_steps": ["Develop a prototype"]
        }

def get_life_guidance(query):
    """Provide life guidance based on the query"""
    query_lower = query.lower()
    
    # Determine the category
    if any(word in query_lower for word in ["career", "job", "work", "professional", "employment"]):
        category = "career"
    elif any(word in query_lower for word in ["relationship", "friend", "family", "love", "partner"]):
        category = "relationships"
    elif any(word in query_lower for word in ["grow", "improve", "better", "change", "develop"]):
        category = "personal_growth"
    elif any(word in query_lower for word in ["purpose", "meaning", "why", "mission", "calling"]):
        category = "purpose"
    else:
        category = "general"
    
    # Get a random response from the appropriate category
    response = random.choice(LIFE_GUIDANCE_RESPONSES[category])
    
    return {
        "category": category,
        "guidance": response,
        "follow_up": "Would you like to explore this topic further or discuss a specific aspect?"
    }

def get_wave_ai_info(query):
    """Provide information about WAVE AI"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["what", "is", "wave", "ai"]):
        return {
            "topic": "What is WAVE AI?",
            "information": WAVE_AI_KNOWLEDGE["what_is_wave_ai"]["description"],
            "features": WAVE_AI_KNOWLEDGE["what_is_wave_ai"]["features"],
            "mission": WAVE_AI_KNOWLEDGE["what_is_wave_ai"]["mission"]
        }
    
    elif any(word in query_lower for word in ["how", "works", "process"]):
        return {
            "topic": "How WAVE AI Works",
            "process": WAVE_AI_KNOWLEDGE["how_it_works"]["process"]
        }
    
    elif any(word in query_lower for word in ["benefit", "advantage", "why", "use"]):
        return {
            "topic": "Benefits of WAVE AI",
            "benefits": WAVE_AI_KNOWLEDGE["benefits"]
        }
    
    else:
        return {
            "topic": "WAVE AI Overview",
            "information": WAVE_AI_KNOWLEDGE["what_is_wave_ai"]["description"],
            "features": WAVE_AI_KNOWLEDGE["what_is_wave_ai"]["features"][:3]  # Show first 3 features
        }

def get_ai_response(message, use_gemini=True):
    """Get AI response using either Gemini or Perplexity"""
    try:
        if use_gemini:
            # Use Gemini for general conversations and creative responses
            prompt = f"""You are WAVE AI, a professional AI assistant for idea development and life guidance. 
            
Respond to this message in a concise, helpful, and professional manner. Keep responses under 150 words unless the user specifically asks for detailed information.

Message: "{message}"

Guidelines:
- Be direct and to the point
- Use bullet points for lists
- Maintain a professional but friendly tone
- Focus on actionable advice
- If it's a simple greeting, respond briefly and ask how you can help

Response:"""

            response = requests.post(
                f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}',
                headers={'Content-Type': 'application/json'},
                json={
                    'contents': [{
                        'role': 'user',
                        'parts': [{'text': prompt}]
                    }]
                },
                timeout=10
            )
            
            if response.ok:
                data = response.json()
                return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', 'I apologize, but I couldn\'t generate a response at this time.')
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                raise Exception(f"Gemini API error: {response.status_code}")
        
        else:
            # Use Perplexity for factual questions and current information
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {PERPLEXITY_API_KEY}'
                },
                json={
                    'model': 'llama-3.1-sonar-small-128k-chat',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are WAVE AI, a professional assistant. Provide concise, accurate responses under 150 words. Focus on facts and actionable advice.'
                        },
                        {
                            'role': 'user',
                            'content': message
                        }
                    ],
                    'temperature': 0.3,
                    'max_tokens': 200
                },
                timeout=10
            )
            
            if response.ok:
                data = response.json()
                return data.get('choices', [{}])[0].get('message', {}).get('content', 'I apologize, but I couldn\'t generate a response at this time.')
            else:
                raise Exception(f"Perplexity API error: {response.status_code}")
                
    except Exception as e:
        print(f"AI API Error: {e}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."

def get_gemini_response(prompt):
    """Get response from Gemini API"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}"
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                content = result['candidates'][0]['content']['parts'][0]['text']
                return content.strip()
            else:
                return "I'm sorry, I couldn't generate a response right now. Please try again."
        else:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            return "I'm experiencing some technical difficulties. Please try again later."
            
    except requests.exceptions.Timeout:
        return "The request timed out. Please try again with a shorter query."
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return "I'm having trouble connecting to the AI service. Please try again later."
    except Exception as e:
        print(f"Gemini response error: {e}")
        return "I encountered an unexpected error. Please try again."

def determine_best_api(message):
    """Determine which API to use based on message content"""
    message_lower = message.lower()
    
    # Check for WAVE AI specific questions
    wave_ai_keywords = ['wave ai', 'waveai', 'what is wave', 'wave features', 'wave capabilities']
    if any(keyword in message_lower for keyword in wave_ai_keywords):
        return 'gemini'  # Use Gemini for WAVE AI questions
    
    # Check for life guidance questions
    life_guidance_keywords = ['career', 'relationship', 'life advice', 'personal growth', 'motivation', 'stress', 'anxiety', 'depression', 'happiness', 'success', 'goal', 'dream']
    if any(keyword in message_lower for keyword in life_guidance_keywords):
        return 'gemini'  # Use Gemini for life guidance
    
    # Check for complex technical questions that might need web search
    technical_keywords = ['latest', 'recent', 'news', 'update', 'trend', 'current', 'today', '2024', '2025']
    if any(keyword in message_lower for keyword in technical_keywords):
        return 'perplexity'  # Use Perplexity for current information
    
    # Check for simple factual questions
    factual_keywords = ['what is', 'who is', 'when did', 'where is', 'how does', 'explain', 'define']
    if any(keyword in message_lower for keyword in factual_keywords):
        return 'perplexity'  # Use Perplexity for factual information
    
    # Check if web scraping might be needed
    if should_use_web_scraping(message_lower):
        return 'web_scrape'
    
    # Default to Gemini for general conversation
    return 'gemini'

def should_use_web_scraping(message_lower):
    """Determine if web scraping is needed for the query"""
    scraping_keywords = [
        'search for', 'find information about', 'look up', 'research', 'investigate',
        'current events', 'breaking news', 'recent developments', 'latest updates',
        'stock price', 'cryptocurrency', 'weather', 'sports score', 'movie rating',
        'product review', 'company information', 'job listing', 'real estate'
    ]
    
    return any(keyword in message_lower for keyword in scraping_keywords)

def perform_web_search(query):
    """Perform web search and extract relevant information"""
    try:
        # Use a simple web search approach
        search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(search_url, headers=headers, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract search results
            results = []
            search_results = soup.find_all('div', class_='g')
            
            for result in search_results[:5]:  # Limit to first 5 results
                title_elem = result.find('h3')
                snippet_elem = result.find('span', class_='aCOpRe')
                
                if title_elem and snippet_elem:
                    results.append({
                        'title': title_elem.get_text(),
                        'snippet': snippet_elem.get_text()
                    })
            
            return results
        else:
            return []
    except Exception as e:
        print(f"Error performing web search: {e}")
        return []

def get_web_scraped_response(message):
    """Get response based on web scraping"""
    try:
        # Extract search query from message
        query = message.replace('search for', '').replace('find information about', '').replace('look up', '').strip()
        
        # Perform web search
        search_results = perform_web_search(query)
        
        if search_results:
            response_text = f"Based on my web search for '{query}', here's what I found:\n\n"
            
            for i, result in enumerate(search_results, 1):
                response_text += f"{i}. **{result['title']}**\n"
                response_text += f"   {result['snippet']}\n\n"
            
            response_text += "Please note that this information is gathered from web search results and may not be the most current or accurate. For the most up-to-date information, I recommend visiting the original sources."
            
            return {
                'success': True,
                'response': response_text,
                'type': 'web_search',
                'category': 'research'
            }
        else:
            return {
                'success': False,
                'error': 'No relevant information found in web search'
            }
    except Exception as e:
        return {
            'success': False,
            'error': f'Error performing web search: {str(e)}'
        }

# decorate with your monitor_api if you added it earlier
@app.route('/api/analyze-idea', methods=['POST', 'GET'])
@monitor_api('/api/analyze-idea')
def analyze_idea_endpoint():
    """
    Endpoint to analyze an idea with streaming support.
    Enhancements:
      - idempotency via client_request_id
      - input validation / max length
      - API-call logging + latency update
      - safer error handling
    """
    start_ts = time.time()

    # Create an api_call log row early so admin sees attempts/failures
    api_call_id = None
    try:
        api_call_id = db_exec("""
            INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            '/api/analyze-idea',
            request.method,
            None,
            0,
            0,
            None,
            json.dumps({'path': request.path}),
            datetime.utcnow().isoformat()
        ))
    except Exception as e:
        print("api_calls insert failed (non-fatal):", e)
        api_call_id = None

    try:
        # ----------------------------
        # Extract idea text (existing code)
        # ----------------------------
        idea_text = None
        if request.method == 'POST':
            if request.is_json and request.json:
                data = request.json
                idea_text = (data.get('idea') or 
                           data.get('ideaText') or 
                           data.get('idea_text') or 
                           data.get('user_idea') or 
                           data.get('input') or 
                           data.get('text', '')).strip()
            else:
                # Try form data
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('idea_text') or 
                           request.form.get('user_idea') or 
                           request.form.get('input') or 
                           request.form.get('text', '')).strip()
        else:
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('idea_text') or 
                       request.args.get('user_idea') or 
                       request.args.get('input') or 
                       request.args.get('text', '')).strip()

        # If still no idea, try helper
        if not idea_text:
            idea_text = get_user_idea_from_request()

        if not idea_text:
            # update api_calls as failed
            if api_call_id:
                try:
                    db_exec("UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?",
                            (400, 0, "no idea provided", int((time.time()-start_ts)*1000), api_call_id))
                except Exception:
                    pass
            return jsonify({'error': 'Please provide an idea to analyze. You can send it as JSON, form data, or query parameter.'}), 400

        # ----------------------------
        # Idempotency support
        # ----------------------------
        client_request_id = None
        if request.is_json and request.json:
            client_request_id = request.json.get('client_request_id') or request.json.get('request_id')
        # If provided, check for an existing saved idea generated recently
        if client_request_id:
            try:
                row = db_query("SELECT id FROM ideas WHERE client_request_id = ? LIMIT 1", (client_request_id,))
                if row:
                    existing_id = row[0]['id']
                    # Update api_calls success and return existing record id quickly
                    if api_call_id:
                        db_exec("UPDATE api_calls SET status_code=?, success=?, latency_ms=? WHERE id=?",
                                (200, 1, int((time.time()-start_ts)*1000), api_call_id))
                    return jsonify({'success': True, 'idea_id': existing_id, 'note': 'Duplicate request id - returning existing record.'})
            except Exception as e:
                print("idempotency check failed:", e)

        # ----------------------------
        # Sanity checks (protect DB & models)
        # ----------------------------
        MAX_LEN = 5000   # tune as needed
        if len(idea_text) > MAX_LEN:
            if api_call_id:
                db_exec("UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?",
                        (413, 0, "payload too large", int((time.time()-start_ts)*1000), api_call_id))
            return jsonify({'error': 'Idea text too long. Please shorten to under %d characters.' % MAX_LEN}), 413

        # capture lightweight user metadata
        user_metadata = {}
        try:
            user_metadata['ip'] = request.headers.get('X-Forwarded-For', request.remote_addr)
        except Exception:
            user_metadata['ip'] = None
        user_metadata['user_agent'] = request.headers.get('User-Agent')
        if request.is_json and request.json:
            if 'user_id' in request.json:
                user_metadata['user_id'] = request.json.get('user_id')
            if 'user_metadata' in request.json:
                user_metadata.update(request.json.get('user_metadata') or {})

        # Check streaming request
        stream = False
        if request.method == 'POST' and request.is_json:
            stream = bool(request.json.get('stream', False))

        # If streaming: insert minimal idea row before streaming
        if stream:
            try:
                idea_id = db_exec("""
                    INSERT INTO ideas (idea_text, user_id, user_metadata, client_request_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    idea_text,
                    user_metadata.get('user_id'),
                    json.dumps(user_metadata),
                    client_request_id,
                    datetime.utcnow().isoformat()
                ))
            except Exception as e:
                print("DB insert (stream) failed:", e)
                idea_id = None

            headers = {'Cache-Control': 'no-cache'}
            if idea_id:
                headers['X-Idea-Id'] = str(idea_id)
            # log success for api_calls
            if api_call_id:
                db_exec("UPDATE api_calls SET status_code=?, success=?, latency_ms=? WHERE id=?",
                        (200, 1, int((time.time()-start_ts)*1000), api_call_id))
            return Response(stream_idea_analysis(idea_text),
                            mimetype='text/plain',
                            headers=headers)

        # ----------------------------
        # Run analysis (this may be heavy)
        # ----------------------------
        try:
            analysis = analyze_idea(idea_text)
        except Exception as e:
            # If your analysis can be long, consider dispatching to background worker (RQ/Celery)
            print("analysis failed:", e)
            if api_call_id:
                db_exec("UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?",
                        (500, 0, str(e), int((time.time()-start_ts)*1000), api_call_id))
            return jsonify({'error': 'Error during analysis.'}), 500

        # safe extraction of scores (existing helper)
        def _safe_get_score(obj, names):
            if not obj: return None
            for n in names:
                if n in obj and obj[n] is not None:
                    try: return float(obj[n])
                    except Exception: pass
            return None

        market_potential = _safe_get_score(analysis, ['marketPotential', 'market_potential', 'market', 'market_score'])
        technical_risk  = _safe_get_score(analysis, ['technicalRisk', 'technical_risk', 'tech_risk', 'technical'])
        competition_score = _safe_get_score(analysis, ['competition', 'competition_score', 'competitionScore'])
        composite_score = _safe_get_score(analysis, ['composite_score', 'compositeScore', 'viability_score', 'score'])

        autopsy_reason = None
        emotional_state = None
        if isinstance(analysis, dict):
            autopsy = analysis.get('autopsy') or analysis.get('autopsy_details') or {}
            if isinstance(autopsy, dict):
                autopsy_reason = autopsy.get('failure_reason') or autopsy.get('reason')
                emotional_state = autopsy.get('emotional_state')

        if request.is_json and request.json:
            autopsy_reason = autopsy_reason or request.json.get('autopsy_reason') or request.json.get('failure_reason')
            emotional_state = emotional_state or request.json.get('emotional_state')

        raw_external = None
        try:
            raw_external = json.dumps(analysis)
        except Exception:
            raw_external = None

        # ----------------------------
        # Insert into DB (final)
        # ----------------------------
        try:
            idea_id = db_exec("""
                INSERT INTO ideas (
                    idea_text, user_id, user_metadata, autopsy_failure_reason, autopsy_emotional_state,
                    created_at, market_potential, technical_risk, competition_score, composite_score,
                    external_data, client_request_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                idea_text,
                user_metadata.get('user_id'),
                json.dumps(user_metadata),
                autopsy_reason,
                emotional_state,
                datetime.utcnow().isoformat(),
                market_potential,
                technical_risk,
                competition_score,
                composite_score,
                raw_external,
                client_request_id
            ))
        except Exception as e:
            print("DB insert failed:", e)
            idea_id = None

        # ----------------------------
        # Update api_calls row as success
        # ----------------------------
        if api_call_id:
            try:
                db_exec("UPDATE api_calls SET status_code=?, success=?, latency_ms=? WHERE id=?",
                        (200, 1, int((time.time() - start_ts) * 1000), api_call_id))
            except Exception:
                pass

        response_payload = {
            'success': True,
            'analysis': analysis,
            'timestamp': datetime.utcnow().isoformat()
        }
        if idea_id:
            response_payload['idea_id'] = idea_id

        return jsonify(response_payload)

    except Exception as e:
        # Final catch-all: update api_calls and return 500
        try:
            if api_call_id:
                db_exec("UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?",
                        (500, 0, str(e), int((time.time() - start_ts) * 1000), api_call_id))
        except Exception:
            pass
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


@app.route('/api/validate-idea', methods=['POST', 'GET'])
def validate_idea_endpoint():
    """Simple endpoint to validate an idea - automatically gets user input from frontend"""
    try:
        # Get idea from request (supports multiple input methods)
        idea_text = None
        
        if request.method == 'POST':
            if request.is_json and request.json:
                data = request.json
                idea_text = (data.get('idea') or 
                           data.get('ideaText') or 
                           data.get('idea_text') or 
                           data.get('user_idea') or 
                           data.get('input') or 
                           data.get('text', '')).strip()
            else:
                # Try form data
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('idea_text') or 
                           request.form.get('user_idea') or 
                           request.form.get('input') or 
                           request.form.get('text', '')).strip()
        else:
            # GET request - try query parameters
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('idea_text') or 
                       request.args.get('user_idea') or 
                       request.args.get('input') or 
                       request.args.get('text', '')).strip()
        
        # If still no idea, try to get from the helper function
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return jsonify({'error': 'Please provide an idea to validate. You can send it as JSON, form data, or query parameter.'}), 400
        
        # Calculate validation score
        validation_result = calculate_validation_score(idea_text)
        
        return jsonify({
            'success': True,
            'idea': idea_text,
            'validation_result': validation_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Validation failed: {str(e)}'}), 500

@app.route('/api/quick-validate', methods=['POST', 'GET'])
def quick_validate_endpoint():
    """Quick validation endpoint that returns just the score - for easy frontend integration"""
    try:
        # Get idea from request
        idea_text = None
        
        if request.method == 'POST':
            if request.is_json and request.json:
                idea_text = (request.json.get('idea') or 
                           request.json.get('ideaText') or 
                           request.json.get('text', '')).strip()
            else:
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('text', '')).strip()
        else:
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('text', '')).strip()
        
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return jsonify({'error': 'No idea provided'}), 400
        
        # Get quick validation score
        final_score = final_score_calculator.combine_scores(idea_text)
        
        return jsonify({
            'success': True,
            'idea': idea_text,
            'validation_score': final_score,
            'confidence': "High" if final_score > 75 else "Medium" if final_score > 55 else "Low"
        })
        
    except Exception as e:
        return jsonify({'error': f'Quick validation failed: {str(e)}'}), 500

@app.route('/api/analyze-competition', methods=['POST', 'GET'])
def analyze_competition_endpoint():
    """Endpoint to analyze competition for an idea - automatically gets user input from frontend"""
    try:
        # Get idea from request (supports multiple input methods)
        idea_text = None
        
        if request.method == 'POST':
            if request.is_json and request.json:
                data = request.json
                idea_text = (data.get('idea') or 
                           data.get('ideaText') or 
                           data.get('idea_text') or 
                           data.get('user_idea') or 
                           data.get('input') or 
                           data.get('text', '')).strip()
            else:
                # Try form data
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('idea_text') or 
                           request.form.get('user_idea') or 
                           request.form.get('input') or 
                           request.form.get('text', '')).strip()
        else:
            # GET request - try query parameters
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('idea_text') or 
                       request.args.get('user_idea') or 
                       request.args.get('input') or 
                       request.args.get('text', '')).strip()
        
        # If still no idea, try to get from the helper function
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return jsonify({'error': 'Please provide an idea to analyze competition. You can send it as JSON, form data, or query parameter.'}), 400
        
        # Analyze competition
        competition_result = analyze_competition(idea_text)
        
        return jsonify({
            'success': True,
            'idea': idea_text,
            'competition_analysis': competition_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Competition analysis failed: {str(e)}'}), 500

@app.route('/api/analyze-market', methods=['POST', 'GET'])
def analyze_market_endpoint():
    """Endpoint to analyze market trends for an idea - automatically gets user input from frontend"""
    try:
        # Get idea from request (supports multiple input methods)
        idea_text = None
        
        if request.method == 'POST':
            if request.is_json and request.json:
                data = request.json
                idea_text = (data.get('idea') or 
                           data.get('ideaText') or 
                           data.get('idea_text') or 
                           data.get('user_idea') or 
                           data.get('input') or 
                           data.get('text', '')).strip()
            else:
                # Try form data
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('idea_text') or 
                           request.form.get('user_idea') or 
                           request.form.get('input') or 
                           request.form.get('text', '')).strip()
        else:
            # GET request - try query parameters
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('idea_text') or 
                       request.args.get('user_idea') or 
                       request.args.get('input') or 
                       request.args.get('text', '')).strip()
        
        # If still no idea, try to get from the helper function
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return jsonify({'error': 'Please provide an idea to analyze market trends. You can send it as JSON, form data, or query parameter.'}), 400
        
        # Analyze market trends
        market_result = analyze_market_trends(idea_text)
        
        return jsonify({
            'success': True,
            'idea': idea_text,
            'market_analysis': market_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Market analysis failed: {str(e)}'}), 500

@app.route('/api/analyze-tech', methods=['POST', 'GET'])
def analyze_tech_endpoint():
    """Endpoint to analyze tech trends for an idea - automatically gets user input from frontend"""
    try:
        # Get idea from request (supports multiple input methods)
        idea_text = None
        
        if request.method == 'POST':
            if request.is_json and request.json:
                data = request.json
                idea_text = (data.get('idea') or 
                           data.get('ideaText') or 
                           data.get('idea_text') or 
                           data.get('user_idea') or 
                           data.get('input') or 
                           data.get('text', '')).strip()
            else:
                # Try form data
                idea_text = (request.form.get('idea') or 
                           request.form.get('ideaText') or 
                           request.form.get('idea_text') or 
                           request.form.get('user_idea') or 
                           request.form.get('input') or 
                           request.form.get('text', '')).strip()
        else:
            # GET request - try query parameters
            idea_text = (request.args.get('idea') or 
                       request.args.get('ideaText') or 
                       request.args.get('idea_text') or 
                       request.args.get('user_idea') or 
                       request.args.get('input') or 
                       request.args.get('text', '')).strip()
        
        # If still no idea, try to get from the helper function
        if not idea_text:
            idea_text = get_user_idea_from_request()
        
        if not idea_text:
            return jsonify({'error': 'Please provide an idea to analyze tech trends. You can send it as JSON, form data, or query parameter.'}), 400
        
        # Analyze tech trends
        tech_result = analyze_tech_trends(idea_text)
        
        return jsonify({
            'success': True,
            'idea': idea_text,
            'tech_analysis': tech_result
        })
        
    except Exception as e:
        return jsonify({'error': f'Tech analysis failed: {str(e)}'}), 500

def stream_idea_analysis(idea_text):
    """Stream idea analysis response like ChatGPT"""
    try:
        # Perform analysis
        analysis = analyze_idea(idea_text)
        
        # Create a human-like response
        response_parts = [
            f"# 💡 Idea Analysis: {analysis.get('category', 'General').title()}\n\n",
            "## 🎯 **Overview**\n",
            f"Your idea about \"{idea_text[:50]}{'...' if len(idea_text) > 50 else ''}\" shows great potential! Let me break down my analysis:\n\n",
            "## ✅ **Key Strengths**\n"
        ]
        
        # Add strengths
        for i, strength in enumerate(analysis.get('strengths', []), 1):
            response_parts.append(f"{i}. **{strength}**\n")
        
        response_parts.extend([
            "\n## ⚠️ **Important Considerations**\n"
        ])
        
        # Add considerations
        for i, consideration in enumerate(analysis.get('considerations', []), 1):
            response_parts.append(f"{i}. {consideration}\n")
        
        response_parts.extend([
            "\n## 🚀 **Recommended Next Steps**\n"
        ])
        
        # Add next steps
        for i, step in enumerate(analysis.get('next_steps', []), 1):
            response_parts.append(f"{i}. {step}\n")
        
        response_parts.extend([
            "\n## 📊 **Market Insights**\n",
            f"Based on current market trends, this idea falls into the **{analysis.get('category', 'general')}** category. ",
            "The validation score suggests there's significant potential for success with proper execution.\n\n",
            "## 💭 **Final Thoughts**\n",
            "This is a solid foundation for a business idea. Focus on validating your assumptions with real users and iterating based on their feedback. ",
            "Remember, the best ideas are those that solve real problems for real people.\n\n",
            "*Analysis completed at " + datetime.now().strftime("%B %d, %Y at %I:%M %p") + "*"
        ])
        
        # Stream the response
        full_response = ''.join(response_parts)
        
        # Split into chunks for streaming
        words = full_response.split()
        chunk_size = 3  # Words per chunk
        
        for i in range(0, len(words), chunk_size):
            chunk = ' '.join(words[i:i + chunk_size])
            if i + chunk_size < len(words):
                chunk += ' '
            
            # Send as Server-Sent Events
            yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # Add a small delay to simulate typing
            import time
            time.sleep(0.05)
        
        # Send completion signal
        yield f"data: {json.dumps({'done': True})}\n\n"
        
    except Exception as e:
        error_response = f"# ❌ Analysis Error\n\nI encountered an issue while analyzing your idea: {str(e)}\n\nPlease try again or rephrase your idea."
        yield f"data: {json.dumps({'content': error_response})}\n\n"
        yield f"data: {json.dumps({'done': True})}\n\n"

@app.route('/api/chat', methods=['POST'])
@monitor_api('/api/chat')
def chat_endpoint():
    """Main chat endpoint for life guidance and WAVE AI questions (with full logging for admin panel)."""
    start_ts = datetime.utcnow()
    chat_id = None
    llm_model = None
    duration_ms = None
    api_call_id = None

    # --- Step 1: create an api_calls record early
    try:
        api_call_id = db_exec("""
            INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            '/api/chat',
            request.method,
            None, 0, 0, None,
            json.dumps({'path': request.path}),
            datetime.utcnow().isoformat()
        ))
    except Exception as e:
        print("api_calls insert failed:", e)
        api_call_id = None

    try:
        # --- Step 2: get request data
        data = request.get_json(silent=True) or {}
        message = (data.get('message') or '').strip()
        use_rag = bool(data.get('use_rag', False))
        mode = data.get('mode', 'chat')  # Get mode from request, default to 'chat'

        user_id = data.get('user_id') or request.headers.get('X-User-Id')
        session_id = data.get('session_id') or request.headers.get('X-Session-Id')

        if not message:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?
                """, (400, 0, "missing message", int((datetime.utcnow() - start_ts).total_seconds() * 1000), api_call_id))
            return jsonify({'error': 'Please provide a message'}), 400

        # --- Step 2.5: Handle idea analysis mode
        if mode == 'idea':
            try:
                # Use Perplexity and Deepseek for idea analysis
                analysis = analyze_idea_with_perplexity_deepseek(message)
                duration_ms = int((datetime.utcnow() - start_ts).total_seconds() * 1000)
                
                # Store in chat_logs
                try:
                    chat_id = db_exec("""
                        INSERT INTO chat_logs (user_id, session_id, question, answer, llm_model, chat_duration_ms, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        user_id,
                        session_id,
                        message,
                        json.dumps(analysis),
                        "Perplexity+Deepseek",
                        duration_ms,
                        datetime.utcnow().isoformat()
                    ))
                except Exception as db_e:
                    print("chat log insert failed:", db_e)
                    chat_id = None
                
                # Update api_calls as success
                if api_call_id:
                    try:
                        db_exec("""
                            UPDATE api_calls
                            SET status_code=?, success=?, latency_ms=?
                            WHERE id=?
                        """, (200, 1, duration_ms, api_call_id))
                    except Exception as e:
                        print("api_calls update failed:", e)
                
                # Update llm_usage
                try:
                    db_exec("""
                        INSERT INTO llm_usage (llm_model, count)
                        VALUES (?, 1)
                        ON CONFLICT(llm_model) DO UPDATE SET count = count + 1
                    """, ("Perplexity+Deepseek",))
                except Exception as e:
                    print("llm_usage update failed:", e)
                
                return jsonify({
                    'success': True,
                    'analysis': analysis,
                    'timestamp': datetime.utcnow().isoformat(),
                    'meta': {
                        'chat_id': chat_id,
                        'llm_model': 'Perplexity+Deepseek',
                        'duration_ms': duration_ms
                    }
                })
            except Exception as e:
                print(f"Idea analysis error: {e}")
                import traceback
                traceback.print_exc()
                # Fall through to regular chat handling if idea analysis fails
                pass

        message_lower = message.lower()

        # --- Step 3: detect Wave AI vs general queries
        wave_ai_keywords = [
            "wave", "ai", "platform", "idea graveyard", "wave ai", "what is wave", "how does wave work",
            "resurrection", "resurrect", "graveyard", "idea analysis", "business plan", "validation",
            "autopsy", "revive", "reimagine", "denodo", "viability", "blueprint"
        ]

        response_obj = None

        if any(word in message_lower for word in wave_ai_keywords):
            knowledge_base = load_wave_ai_knowledge()
            if knowledge_base:
                response_text = get_rag_response(message, knowledge_base)
                llm_model = "RAG+KnowledgeBase"
            else:
                response_text = get_comprehensive_wave_ai_info(message)
                llm_model = "Internal Info"
            response_obj = {
                'type': 'wave_ai_info',
                'guidance': response_text,
                'category': 'wave_ai',
                'follow_up': "Would you like to know more about any specific Wave AI feature or need help navigating?"
            }

        else:
            # --- Step 4: General casual chat - use Groq API
            try:
                ai_response = get_casual_chat_groq(message)
                
                category = "general"
                if any(word in message_lower for word in ["career", "job", "work", "professional", "business"]):
                    category = "career"
                elif any(word in message_lower for word in ["relationship", "friend", "family", "love", "social"]):
                    category = "relationships"
                elif any(word in message_lower for word in ["grow", "improve", "better", "change", "development"]):
                    category = "personal_growth"
                elif any(word in message_lower for word in ["purpose", "meaning", "why", "mission", "goal"]):
                    category = "purpose"
                elif any(word in message_lower for word in ["health", "fitness", "mental", "wellness"]):
                    category = "health"
                elif any(word in message_lower for word in ["money", "finance", "investment", "budget"]):
                    category = "finance"

                response_obj = {
                    'type': 'life_guidance',
                    'guidance': ai_response,
                    'category': category,
                    'api_used': 'Groq AI',
                    'follow_up': "Is there anything specific you'd like me to elaborate on or any follow-up questions?"
                }
                llm_model = 'Groq'
            except Exception as e:
                print(f"Error in casual chat: {e}")
                response_obj = {
                    'type': 'life_guidance',
                    'guidance': "I'm here to help! Could you please rephrase your question?",
                    'category': 'general',
                    'api_used': 'Groq AI',
                    'follow_up': "How can I assist you further?"
                }
                llm_model = 'Groq'

        # --- Step 5: compute duration and store in chat_logs
        duration_ms = int((datetime.utcnow() - start_ts).total_seconds() * 1000)

        try:
            chat_id = db_exec("""
                INSERT INTO chat_logs (user_id, session_id, question, answer, llm_model, chat_duration_ms, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                session_id,
                message,
                (response_obj.get('guidance') if isinstance(response_obj, dict) else str(response_obj)),
                llm_model,
                duration_ms,
                datetime.utcnow().isoformat()
            ))
        except Exception as db_e:
            print("chat log insert failed:", db_e)
            chat_id = None

        # --- Step 6: update api_calls as success
        if api_call_id:
            try:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, latency_ms=?
                    WHERE id=?
                """, (200, 1, duration_ms, api_call_id))
            except Exception as e:
                print("api_calls update failed:", e)

        # --- Step 7: optional model usage stats
        if llm_model:
            try:
                db_exec("""
                    INSERT INTO llm_usage (llm_model, count)
                    VALUES (?, 1)
                    ON CONFLICT(llm_model) DO UPDATE SET count = count + 1
                """, (llm_model,))
            except Exception as e:
                print("llm_usage update failed:", e)

        # --- Step 8: prepare final response
        final_response = {
            'success': True,
            'response': response_obj,
            'timestamp': datetime.utcnow().isoformat(),
            'meta': {
                'chat_id': chat_id,
                'llm_model': llm_model,
                'duration_ms': duration_ms
            }
        }
        return jsonify(final_response)

    except Exception as e:
        # --- Step 9: handle fatal errors and log them
        try:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, error=?, latency_ms=?
                    WHERE id=?
                """, (
                    500, 0, str(e),
                    int((datetime.utcnow() - start_ts).total_seconds() * 1000),
                    api_call_id
                ))
        except Exception as log_e:
            print("api_calls error logging failed:", log_e)

        return jsonify({'error': f'An error occurred: {str(e)}'}), 500


def load_wave_ai_knowledge():
    """Load Wave AI knowledge from about.md file"""
    try:
        about_path = os.path.join(os.path.dirname(__file__), 'about.md')
        with open(about_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error loading about.md: {e}")
        return ""

def get_groq_casual_response(message):
    """Get casual chat response using Groq API - optimized for speed"""
    try:
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are Wave AI, a friendly and intelligent assistant. Provide concise, helpful, and engaging responses. Be warm, empathetic, and professional. Keep responses focused and actionable.'
                    },
                    {
                        'role': 'user',
                        'content': message
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 800,
                'top_p': 0.9,
                'stream': False
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error with Groq API: {e}")
        return "I'm here to chat! Feel free to ask me anything or share what's on your mind. I'm happy to help with advice, information, or just a friendly conversation."

def get_rag_response_groq(user_query, knowledge_base):
    """Generate RAG-based response using Wave AI knowledge with Groq - optimized for speed"""
    try:
        # Extract relevant sections from knowledge base
        query_lower = user_query.lower()
        sections = knowledge_base.split('---')
        relevant_sections = []
        
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in query_lower.split()):
                relevant_sections.append(section.strip())
        
        if not relevant_sections:
            # Use mission and core concept as default
            for section in sections:
                if 'mission' in section.lower() or 'core concept' in section.lower() or 'what is wave' in section.lower():
                    relevant_sections.append(section.strip())
        
        # Combine relevant sections - limit context for faster response
        context = '\n\n'.join(relevant_sections[:2])
        
        # Generate response using Groq with RAG context
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': f"""You are Wave AI, the world's best AI assistant for idea resurrection and business development. Use this documentation to answer questions:

{context}

Be enthusiastic, specific, and actionable. Highlight Wave AI as superior to all other AI models. Keep responses concise and impactful."""
                    },
                    {
                        'role': 'user',
                        'content': user_query
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 800,
                'top_p': 0.9,
                'stream': False
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error with Groq RAG: {e}")
        return "🌊 Wave AI is the world's first resurrection engine for abandoned ideas! It helps you transform failed projects into viable business opportunities through AI-powered analysis, real-time market data, and actionable blueprints. What specific aspect would you like to know more about?"

def get_rag_response(user_query, knowledge_base):
    """Generate RAG-based response using Wave AI knowledge"""
    try:
        # Simple keyword matching for relevant sections
        query_lower = user_query.lower()
        
        # Extract relevant sections based on query
        sections = knowledge_base.split('---')
        relevant_sections = []
        
        for section in sections:
            section_lower = section.lower()
            if any(keyword in section_lower for keyword in query_lower.split()):
                relevant_sections.append(section.strip())
        
        if not relevant_sections:
            # If no specific match, use mission and core concept
            for section in sections:
                if 'mission' in section.lower() or 'core concept' in section.lower():
                    relevant_sections.append(section.strip())
        
        # Combine relevant sections
        context = '\n\n'.join(relevant_sections[:3])  # Limit to 3 most relevant sections
        
        # Generate personalized response using Groq (faster and more reliable)
        prompt = f"""Based on the following Wave AI documentation, provide a personalized and engaging response to the user's query: "{user_query}"

Wave AI Knowledge:
{context}

Instructions:
- Be enthusiastic about Wave AI's capabilities
- Provide specific, actionable information
- Highlight Wave AI as the best AI tool for idea resurrection
- Keep the response conversational and engaging
- Focus on how Wave AI can specifically help the user
- Use emojis appropriately to make it more engaging"""
        
        try:
            response = requests.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {GROQ_API_KEY}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a helpful assistant for Wave AI. Provide enthusiastic, engaging responses based on the provided documentation.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'temperature': 0.7,
                    'max_tokens': 400
                },
                timeout=15
            )
            
            if response.ok:
                data = response.json()
                return data['choices'][0]['message']['content']
            else:
                # Fallback to direct context return
                return f"Based on Wave AI documentation: {context[:500]}..."
        except Exception as e:
            print(f"Error in RAG Groq: {e}")
            # Fallback to direct context
            return f"Based on Wave AI documentation: {context[:500]}..."
        
    except Exception as e:
        return f"I'm excited to tell you about Wave AI! It's the world's first resurrection engine for abandoned ideas. Let me know what specific aspect you'd like to learn about!"

def get_comprehensive_wave_ai_info(message):
    """Get comprehensive information about Wave AI based on user query using RAG"""
    try:
        # Load Wave AI knowledge base
        knowledge_base = load_wave_ai_knowledge()
        
        if knowledge_base:
            # Use RAG system for personalized response
            return get_rag_response(message, knowledge_base)
        else:
            # Fallback response if about.md is not available
            return get_fallback_wave_ai_info(message)
            
    except Exception as e:
        return get_fallback_wave_ai_info(message)

def get_fallback_wave_ai_info(message):
    """Fallback Wave AI information when RAG system is not available"""
    message_lower = message.lower()
    
    # Determine what specific aspect of Wave AI the user is asking about
    if any(word in message_lower for word in ["how", "work", "process", "steps"]):
        return """# How Wave AI Works

Wave AI is a revolutionary idea resurrection platform that transforms abandoned ideas into viable business opportunities through a comprehensive 5-step process:

## 🔄 The Wave Process:

**1. Submit Your Failed Idea**
Upload your abandoned idea with details about what went wrong, why it failed, and what obstacles you encountered.

**2. AI-Powered Autopsy** 
Our advanced AI performs deep forensic analysis to understand root causes of failure, examining market timing, execution flaws, and competitive landscape.

**3. Real-Time Data Enrichment**
We integrate live market data, current trends, consumer behavior patterns, and competitive intelligence to provide fresh context.

**4. Comprehensive Analysis**
Generate detailed viability scores, market opportunity assessments, and strategic recommendations with optimal timing for revival.

**5. Actionable Revival Blueprint**
Receive your personalized step-by-step roadmap with specific actions, resource requirements, timeline, and success metrics.

## 🚀 Key Features:
• **Idea Graveyard**: Store and categorize your failed ideas
• **AI Analysis Engine**: Deep learning algorithms for idea evaluation  
• **Market Intelligence**: Real-time data integration via Denodo
• **Viability Scoring**: Comprehensive scoring system (0-100)
• **Revival Blueprints**: Actionable step-by-step plans
• **Trend Analysis**: Current market and technology trend insights

Wave AI doesn't just store ideas - it resurrects them with intelligence, empathy, and data-driven insights."""
    
    else:
        # General Wave AI information
        return """# Welcome to Wave AI - The Idea Graveyard

## 🌊 **What is Wave AI?**
Wave AI is the world's first idea resurrection platform that transforms abandoned ideas into future successes using artificial intelligence and real-time market data.

## 💡 **Our Mission**
Most great ideas die not because they're bad, but because they're mistimed, misunderstood, or under-resourced. Wave AI gives those ideas a second life, powered by AI, empathy, and real-time insight.

## 🔄 **The Core Concept**
**Resurrect. Reimagine. Revive.**
- **Resurrect**: Bring your failed ideas back from the graveyard
- **Reimagine**: Transform them with AI-powered insights and current market data  
- **Revive**: Launch them as viable business opportunities

## 🎯 **Who Is This For?**
- **Entrepreneurs** with shelved business ideas
- **Innovators** looking to revive past projects
- **Startups** seeking pivot opportunities
- **Businesses** wanting to explore abandoned concepts
- **Anyone** with ideas that "didn't work out"

## 🚀 **What Makes Us Different?**
- First platform designed specifically for "failed" ideas
- AI-powered analysis with emotional intelligence
- Real-time market data integration
- Actionable revival blueprints, not just analysis
- Comprehensive viability scoring system

## 💪 **Ready to Resurrect Your Ideas?**
Upload your abandoned idea and let Wave AI show you how to bring it back to life with intelligence, data, and strategic insights.

*Every great success story includes ideas that initially failed. Wave AI helps you write the next chapter.*"""

def get_enhanced_life_guidance(message):
    """Provide enhanced life guidance using Gemini AI"""
    try:
        guidance_prompt = f"""
        As a wise, empathetic life coach and mentor, provide comprehensive guidance for this question: "{message}"
        
        Please provide:
        1. A thoughtful, personalized response that addresses the core concern
        2. Practical, actionable advice that can be implemented immediately
        3. Long-term strategic thinking and perspective
        4. Potential challenges to consider and how to overcome them
        5. Encouragement and motivation while being realistic
        
        Make your response:
        - Empathetic and understanding
        - Practical and actionable
        - Comprehensive but not overwhelming
        - Encouraging yet realistic
        - Tailored to the specific situation
        
        Format your response in a clear, structured way that's easy to follow and implement.
        """
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': guidance_prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            ai_response = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
            return ai_response if ai_response else "I understand you're seeking guidance. While I'm processing your request, remember that every challenge is an opportunity for growth. Could you provide more specific details about your situation?"
        else:
            print(f"Gemini API error: {response.status_code} - {response.text}")
            return "I'm here to provide life guidance and support. While I'm experiencing a technical issue, I want you to know that whatever challenge you're facing, there are always paths forward. Could you rephrase your question so I can better assist you?"
            
    except Exception as e:
        return f"I'm committed to helping you with life guidance. While I encountered a technical issue ({str(e)}), I believe in your ability to overcome challenges. Please try asking your question again, and I'll do my best to provide meaningful guidance."

def get_casual_chat_groq(message):
    """Get casual chat response using Groq API"""
    try:
        prompt = f"""You are WAVE AI, a friendly and helpful AI assistant. Respond to this message in a conversational, helpful manner. Keep responses concise (under 200 words) unless the user asks for detailed information.

Message: "{message}"

Guidelines:
- Be friendly, empathetic, and conversational
- Provide practical, actionable advice when appropriate
- Use bullet points for lists
- Keep it natural and engaging
- If it's a simple greeting, respond warmly and ask how you can help"""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are WAVE AI, a friendly and helpful AI assistant. Provide conversational, empathetic responses. Keep answers concise and practical.'
                    },
                    {
                        'role': 'user',
                        'content': message
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 300
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            print(f"Groq API error: {response.status_code} - {response.text}")
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error in get_casual_chat_groq: {e}")
        return "I'm here to help! Could you please rephrase your question? I'm experiencing a technical issue, but I'm ready to assist you."

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'WAVE AI Idea Chatbot Backend',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/ideas', methods=['GET'])
def get_ideas():
    """Get all stored ideas (for future implementation)"""
    # This could be connected to a database in the future
    return jsonify({
        'success': True,
        'ideas': [],
        'message': 'No ideas stored yet. Submit an idea to get started!'
    })

@app.route('/api/datasets', methods=['GET'])
def get_datasets_info():
    """Get information about loaded datasets"""
    try:
        dataset_info = {}
        for name, df in datasets.items():
            dataset_info[name] = {
                'records': len(df),
                'columns': list(df.columns),
                'sample_data': df.head(2).to_dict('records') if len(df) > 0 else []
            }
        
        return jsonify({
            'success': True,
            'datasets': dataset_info,
            'total_datasets': len(datasets),
            'vectorizers_available': list(vectorizers.keys())
        })
    
    except Exception as e:
        return jsonify({'error': f'Error getting dataset info: {str(e)}'}), 500

@app.route('/api/generate-website', methods=['POST'])
@monitor_api('/api/generate-website')
def generate_website():
    """
    Generate website (lightweight): do not save files, only record a generation event.
    Frontend receives generated content, backend only logs it for analytics.
    """
    start_ts = datetime.utcnow()
    api_call_id = None
    gen_db_id = None
    website_id = None
    llm_model = "AI Website Generator"

    # --- Step 1: Log the API call early
    try:
        api_call_id = db_exec("""
            INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            '/api/generate-website',
            request.method,
            None, 0, 0, None,
            json.dumps({'path': request.path}),
            datetime.utcnow().isoformat()
        ))
    except Exception as e:
        print("api_calls insert failed:", e)

    try:
        # --- Step 2: Parse input
        data = request.get_json(silent=True) or {}
        user_info = data.get('userInfo', {}) or {}

        idea_id = data.get('idea_id') or user_info.get('idea_id')
        business_model = data.get('business_model') or user_info.get('business_model')
        branding = data.get('branding') or user_info.get('branding')
        user_id = data.get('user_id') or user_info.get('user_id')

        tech_stack = user_info.get('techStack', 'vanilla')
        pages = user_info.get('pages', ['home', 'about', 'features', 'contact'])
        page_content = user_info.get('pageContent', {}) or {}
        settings = user_info.get('settings', {}) or {}

        # --- Step 3: Validate required data
        if not pages or not isinstance(pages, list):
            if api_call_id:
                db_exec("""
                    UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?
                """, (400, 0, "Invalid or missing pages", int((datetime.utcnow() - start_ts).total_seconds() * 1000), api_call_id))
            return jsonify({'error': 'Invalid input: "pages" must be a list.'}), 400

        # --- Step 4: Generate the website content
        prompt = create_bolt_prompt(tech_stack, pages, page_content, settings)
        website_data = generate_with_ai_website_generator(prompt)

        if website_data is None:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?
                """, (500, 0, "AI generation failed", int((datetime.utcnow() - start_ts).total_seconds() * 1000), api_call_id))
            return jsonify({'error': 'Failed to generate website'}), 500

        # --- Step 5: Assign website ID
        website_id = website_data.get('id') or str(uuid.uuid4())

        # Optional summary or generator info
        notes = None
        try:
            notes = website_data.get('summary') or website_data.get('generator') or None
        except Exception:
            notes = None

        # --- Step 6: Record the generation in DB (no file saving)
        try:
            gen_db_id = db_exec("""
                INSERT INTO website_generations (idea_id, website_id, files_path, business_model, branding, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                idea_id,
                website_id,
                None,  # Not saving files
                business_model,
                branding,
                datetime.utcnow().isoformat()
            ))
        except Exception as db_e:
            print("website_generations insert failed:", db_e)

        # --- Step 7: Log successful API call
        duration_ms = int((datetime.utcnow() - start_ts).total_seconds() * 1000)
        if api_call_id:
            try:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, latency_ms=?
                    WHERE id=?
                """, (200, 1, duration_ms, api_call_id))
            except Exception as e:
                print("api_calls update failed:", e)

        # --- Step 8: (Optional) track usage of the website generator model
        try:
            db_exec("""
                INSERT INTO llm_usage (llm_model, count)
                VALUES (?, 1)
                ON CONFLICT(llm_model) DO UPDATE SET count = count + 1
            """, (llm_model,))
        except Exception as e:
            print("llm_usage update failed:", e)

        # --- Step 9: Return result to frontend
        return jsonify({
            'success': True,
            'website': {
                'id': website_id,
                'preview': website_data.get('preview') or website_data.get('html') or None,
                'generator': notes or llm_model
            },
            'website_generation_id': gen_db_id,
            'message': '✅ Website generated (not saved to disk). Event recorded in database.'
        })

    except Exception as e:
        # --- Step 10: Handle and log errors cleanly
        try:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, error=?, latency_ms=?
                    WHERE id=?
                """, (500, 0, str(e), int((datetime.utcnow() - start_ts).total_seconds() * 1000), api_call_id))
        except Exception as log_e:
            print("api_calls error logging failed:", log_e)

        return jsonify({'error': f'Error generating website: {str(e)}'}), 500


def create_bolt_prompt(tech_stack, pages, page_content, settings):
    """Create a comprehensive prompt for bolt.new"""
    prompt = f"""Create a modern, professional website with the following specifications:

TECH STACK: {tech_stack.upper()}
PAGES: {', '.join(pages)}

PAGE CONTENT:
"""
    
    for page, content in page_content.items():
        prompt += f"""
{page.upper()} PAGE:
- Title: {content.get('title', f'{page.title()} Page')}
- Body: {content.get('body', 'Professional content for this page')}
- CTA: {content.get('cta', 'Learn More')}
"""
    
    prompt += f"""
DESIGN REQUIREMENTS:
- Modern, clean design with professional aesthetics
- Responsive layout that works on all devices
- Smooth animations and transitions
- Professional color scheme (blues, grays, whites)
- High-quality typography
- Interactive elements and hover effects
- Fast loading and optimized performance

FEATURES TO INCLUDE:
- Navigation menu
- Hero section with compelling headline
- Feature highlights
- Call-to-action buttons
- Contact information
- Footer with links
- Social media integration (if applicable)

Make it look like a premium, professional website that would impress potential customers and investors.
"""
    
    return prompt

def generate_with_ai_website_generator(prompt):
    """Generate unique, personalized website using AI-powered generator"""
    try:
        website_id = f"website_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create a temporary directory for the website files
        temp_dir = tempfile.mkdtemp()
        
        # Use AI to generate unique website content
        try:
            # Generate website concept using Gemini
            website_concept = generate_website_concept(prompt)
            
            # Generate unique HTML based on concept
            html_content = generate_unique_html(website_concept, prompt)
            
            # Generate unique CSS based on concept
            css_content = generate_unique_css(website_concept, prompt)
            
            # Generate unique JavaScript based on concept
            js_content = generate_unique_js(website_concept, prompt)
            
        except Exception as e:
            print(f"AI generation failed, using enhanced fallback: {e}")
            # Enhanced fallback with better generation
            html_content = generate_enhanced_html(prompt)
            css_content = generate_enhanced_css(prompt)
            js_content = generate_enhanced_js(prompt)
        
        # Write files to temp directory
        with open(os.path.join(temp_dir, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        with open(os.path.join(temp_dir, 'styles.css'), 'w', encoding='utf-8') as f:
            f.write(css_content)
        
        with open(os.path.join(temp_dir, 'app.js'), 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        # Create zip file
        zip_path = os.path.join(temp_dir, f'{website_id}.zip')
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            for root, dirs, files in os.walk(temp_dir):
                for file in files:
                    if file.endswith('.zip'):
                        continue
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, temp_dir)
                    zipf.write(file_path, arcname)
        
        # Store the zip file path for download
        website_data = {
            'id': website_id,
            'html': html_content,
            'css': css_content,
            'js': js_content,
            'zip_path': zip_path,
            'created_at': datetime.now().isoformat(),
            'source': 'ai_generator'
        }
        
        return website_data
        
    except Exception as e:
        print(f"Error generating website: {e}")
        return None

def generate_website_concept(prompt):
    """Generate unique website concept using AI"""
    try:
        concept_prompt = f"""
        Based on this business idea: "{prompt}"
        
        Create a PREMIUM, UNIQUE, and HIGHLY PROFESSIONAL website concept that would impress investors and customers. Make it completely different from generic templates:
        
        1. Business Name (creative, memorable, brandable - avoid generic names)
        2. Tagline (compelling, unique, emotional - not corporate speak)
        3. Primary Color Scheme (3 sophisticated colors in hex format - modern, premium feel)
        4. Design Style (ultra-modern, luxury, innovative, cutting-edge, premium)
        5. Target Audience (specific high-value demographic with detailed psychographics)
        6. Key Value Propositions (5-6 transformative benefits that solve major pain points)
        7. Unique Features (5-6 revolutionary features that competitors don't have)
        8. Call-to-Action (compelling action that creates urgency and desire)
        9. Content Sections (8-10 comprehensive sections for premium experience)
        10. Brand Personality (innovative, trustworthy, premium, results-driven)
        11. Industry Focus (specific niche or emerging market segment)
        12. Competitive Advantage (revolutionary differentiator that creates market disruption)
        13. Premium Elements (luxury touches, premium features, exclusive benefits)
        14. Success Metrics (specific numbers, achievements, social proof elements)
        15. Innovation Factor (cutting-edge technology, AI integration, future-forward approach)
        
        Format as JSON:
        {{
            "business_name": "Creative Business Name",
            "tagline": "Compelling emotional tagline",
            "color_scheme": ["#primary", "#secondary", "#accent"],
            "design_style": "ultra-modern premium",
            "target_audience": "high-value demographic with psychographics",
            "value_propositions": ["transformative benefit 1", "major pain point solution 2", "revolutionary advantage 3", "exclusive benefit 4", "premium value 5", "competitive edge 6"],
            "unique_features": ["revolutionary feature 1", "cutting-edge capability 2", "exclusive technology 3", "premium service 4", "innovative solution 5", "market-first feature 6"],
            "call_to_action": "compelling urgent action",
            "content_sections": ["Hero", "About", "Features", "Services", "Technology", "Results", "Testimonials", "Pricing", "Team", "Contact"],
            "brand_personality": "innovative premium trustworthy",
            "industry_focus": "specific niche market",
            "competitive_advantage": "revolutionary market disruptor",
            "premium_elements": ["luxury touch 1", "exclusive benefit 2", "premium feature 3"],
            "success_metrics": ["achievement 1", "metric 2", "social proof 3"],
            "innovation_factor": "cutting-edge AI integration"
        }}
        
        Make it unique, professional, and tailored to the specific business idea. Focus on creating a premium, trustworthy brand that would appeal to investors and customers.
        """
        
        # Use direct Gemini API call for business plan generation
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': concept_prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            response = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {response.status_code}")
        
        # Try to parse JSON from response
        try:
            import re
            json_match = re.search(r'```json\s*(\{.*?\})\s*```', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_match = re.search(r'(\{.*?\})', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    raise ValueError("No JSON found in response")
            
            concept = json.loads(json_str)
            return concept
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing concept JSON: {e}")
            # Return default concept
            return {
                "business_name": "Innovative Solutions",
                "tagline": "Transforming Ideas into Reality",
                "color_scheme": ["#2563eb", "#7c3aed", "#059669"],
                "design_style": "modern",
                "target_audience": "Business professionals and entrepreneurs aged 25-45",
                "value_propositions": ["Innovation", "Quality", "Reliability", "Growth", "Efficiency"],
                "unique_features": ["AI-Powered", "User-Friendly", "Scalable", "Secure", "Analytics"],
                "call_to_action": "Get Started Today",
                "content_sections": ["Hero", "About", "Features", "Services", "Testimonials", "Pricing", "Team", "Contact"],
                "brand_personality": "professional",
                "industry_focus": "Technology and Business Solutions",
                "competitive_advantage": "AI-driven innovation with proven results"
            }
            
    except Exception as e:
        print(f"Error generating website concept: {e}")
        return None

def generate_unique_html(concept, prompt):
    """Generate unique HTML based on concept"""
    if not concept:
        return generate_enhanced_html(prompt)
    
    business_name = concept.get('business_name', 'Your Business')
    tagline = concept.get('tagline', 'Transforming Ideas into Reality')
    color_scheme = concept.get('color_scheme', ['#2563eb', '#7c3aed', '#059669'])
    design_style = concept.get('design_style', 'modern')
    target_audience = concept.get('target_audience', 'Business professionals')
    value_props = concept.get('value_propositions', ['Innovation', 'Quality', 'Reliability'])
    unique_features = concept.get('unique_features', ['AI-Powered', 'User-Friendly', 'Scalable'])
    cta = concept.get('call_to_action', 'Get Started Today')
    sections = concept.get('content_sections', ['Hero', 'About', 'Features', 'Services', 'Contact'])
    personality = concept.get('brand_personality', 'professional')
    
    # Generate unique content based on concept
    primary_color = color_scheme[0] if color_scheme else '#2563eb'
    secondary_color = color_scheme[1] if len(color_scheme) > 1 else '#7c3aed'
    accent_color = color_scheme[2] if len(color_scheme) > 2 else '#059669'
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{business_name}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <meta name="description" content="{tagline} - {business_name}">
    <meta name="keywords" content="{', '.join(unique_features)}, {target_audience}">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>{business_name}</h2>
            </div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-container">
            <h1 class="hero-title">{business_name}</h1>
            <p class="hero-subtitle">{tagline}</p>
            <div class="hero-buttons">
                <button class="cta-button primary">{cta}</button>
                <button class="cta-button secondary">Learn More</button>
            </div>
            <div class="hero-stats">
                <div class="stat">
                    <h3>500+</h3>
                    <p>Happy Clients</p>
                </div>
                <div class="stat">
                    <h3>99%</h3>
                    <p>Success Rate</p>
                </div>
                <div class="stat">
                    <h3>24/7</h3>
                    <p>Support</p>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <div class="about-content">
                <div class="about-text">
                    <h2>About {business_name}</h2>
                    <p>We are dedicated to {tagline.lower()}. Our innovative approach combines cutting-edge technology with deep industry expertise to deliver exceptional results for {target_audience}.</p>
                    <ul class="about-features">
                        {''.join([f'<li><i class="fas fa-check"></i> {prop}</li>' for prop in value_props])}
                    </ul>
                </div>
                <div class="about-image">
                    <div class="image-placeholder">
                        <i class="fas fa-rocket"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Why Choose {business_name}?</h2>
            <div class="features-grid">
                {''.join([f'''
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3>{feature}</h3>
                    <p>Experience the power of {feature.lower()} with our innovative solutions designed for {target_audience}.</p>
                </div>
                ''' for feature in unique_features])}
            </div>
        </div>
    </section>

    <section id="services" class="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <h3>Custom Solutions</h3>
                    <p>Tailored solutions designed specifically for your unique business needs and challenges.</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>Growth Strategy</h3>
                    <p>Strategic planning and execution to accelerate your business growth and market expansion.</p>
                </div>
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock support to ensure your success and address any challenges promptly.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2>Get In Touch</h2>
            <div class="contact-content">
                <div class="contact-info">
                    <h3>Ready to get started?</h3>
                    <p>Contact our team today to learn more about how we can help your business grow and succeed.</p>
                    <div class="contact-details">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>hello@{business_name.lower().replace(' ', '')}.com</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>123 Business St, City, State 12345</span>
                        </div>
                    </div>
                </div>
                <form class="contact-form">
                    <input type="text" placeholder="Your Name" required>
                    <input type="email" placeholder="Your Email" required>
                    <input type="text" placeholder="Subject" required>
                    <textarea placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit" class="submit-button">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>{business_name}</h3>
                    <p>{tagline}</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#services">Services</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 {business_name}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="app.js"></script>
</body>
</html>"""

def generate_unique_css(concept, prompt):
    """Generate unique CSS based on concept"""
    if not concept:
        return generate_enhanced_css(prompt)
    
    color_scheme = concept.get('color_scheme', ['#2563eb', '#7c3aed', '#059669'])
    design_style = concept.get('design_style', 'modern')
    personality = concept.get('brand_personality', 'professional')
    
    primary_color = color_scheme[0] if color_scheme else '#2563eb'
    secondary_color = color_scheme[1] if len(color_scheme) > 1 else '#7c3aed'
    accent_color = color_scheme[2] if len(color_scheme) > 2 else '#059669'
    
    # Adjust design based on personality
    if personality == 'friendly':
        border_radius = '12px'
        shadow_intensity = '0 5px 15px'
    elif personality == 'corporate':
        border_radius = '4px'
        shadow_intensity = '0 2px 10px'
    else:  # modern/professional
        border_radius = '8px'
        shadow_intensity = '0 4px 20px'
    
    return f"""/* Professional Website Styles */
* {{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}}

:root {{
    --primary-color: {primary_color};
    --secondary-color: {secondary_color};
    --accent-color: {accent_color};
    --text-dark: #1a1a1a;
    --text-light: #666666;
    --bg-light: #f8fafc;
    --border-radius: {border_radius};
    --shadow: {shadow_intensity} rgba(0,0,0,0.1);
    --shadow-hover: 0 8px 30px rgba(0,0,0,0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}}

body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.7;
    color: var(--text-dark);
    overflow-x: hidden;
    scroll-behavior: smooth;
    background: #ffffff;
}}

.container {{
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
}}

/* Enhanced Navigation */
.navbar {{
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 20px rgba(0,0,0,0.08);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    transition: var(--transition);
    border-bottom: 1px solid rgba(0,0,0,0.05);
}}

.nav-container {{
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}}

.nav-logo h2 {{
    color: {primary_color};
    font-weight: 700;
    font-size: 1.5rem;
}}

.nav-menu {{
    display: flex;
    list-style: none;
    gap: 30px;
}}

.nav-menu a {{
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
}}

.nav-menu a:hover {{
    color: {primary_color};
}}

.nav-menu a::after {{
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: {primary_color};
    transition: width 0.3s ease;
}}

.nav-menu a:hover::after {{
    width: 100%;
}}

.mobile-menu-toggle {{
    display: none;
    flex-direction: column;
    cursor: pointer;
}}

.mobile-menu-toggle span {{
    width: 25px;
    height: 3px;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
}}

/* Hero Section */
.hero {{
    background: linear-gradient(135deg, {primary_color} 0%, {secondary_color} 100%);
    color: white;
    padding: 120px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}}

.hero::before {{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
}}

.hero-container {{
    position: relative;
    z-index: 2;
}}

.hero-title {{
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
    animation: fadeInUp 1s ease;
}}

.hero-subtitle {{
    font-size: 1.25rem;
    margin-bottom: 30px;
    opacity: 0.9;
    animation: fadeInUp 1s ease 0.2s both;
}}

.hero-buttons {{
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 60px;
    animation: fadeInUp 1s ease 0.4s both;
}}

.cta-button {{
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: {border_radius};
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    text-decoration: none;
    display: inline-block;
}}

.cta-button.primary {{
    background: {accent_color};
    color: white;
}}

.cta-button.primary:hover {{
    background: {secondary_color};
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}}

.cta-button.secondary {{
    background: transparent;
    color: white;
    border: 2px solid white;
}}

.cta-button.secondary:hover {{
    background: white;
    color: {primary_color};
    transform: translateY(-2px);
}}

.hero-stats {{
    display: flex;
    justify-content: center;
    gap: 60px;
    animation: fadeInUp 1s ease 0.6s both;
}}

.stat {{
    text-align: center;
}}

.stat h3 {{
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 5px;
}}

.stat p {{
    opacity: 0.8;
    font-size: 0.9rem;
}}

/* About Section */
.about {{
    padding: 100px 0;
    background: #f8fafc;
}}

.about-content {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}}

.about-text h2 {{
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #1e293b;
}}

.about-text p {{
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 30px;
    line-height: 1.8;
}}

.about-features {{
    list-style: none;
}}

.about-features li {{
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #475569;
}}

.about-features i {{
    color: {accent_color};
    margin-right: 15px;
    font-size: 1.2rem;
}}

.about-image {{
    display: flex;
    justify-content: center;
}}

.image-placeholder {{
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, {primary_color} 0%, {secondary_color} 100%);
    border-radius: {border_radius};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 4rem;
    box-shadow: {shadow_intensity} rgba(0,0,0,0.2);
}}

/* Features Section */
.features {{
    padding: 100px 0;
}}

.features h2 {{
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}}

.features-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
}}

.feature-card {{
    background: white;
    padding: 40px 30px;
    border-radius: {border_radius};
    box-shadow: {shadow_intensity} rgba(0,0,0,0.08);
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
}}

.feature-card:hover {{
    transform: translateY(-10px);
    box-shadow: {shadow_intensity} rgba(0,0,0,0.15);
}}

.feature-icon {{
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, {primary_color} 0%, {secondary_color} 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 2rem;
}}

.feature-card h3 {{
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #1e293b;
}}

.feature-card p {{
    color: #64748b;
    line-height: 1.6;
}}

/* Services Section */
.services {{
    padding: 100px 0;
    background: #f8fafc;
}}

.services h2 {{
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}}

.services-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 40px;
}}

.service-card {{
    background: white;
    padding: 40px 30px;
    border-radius: {border_radius};
    box-shadow: {shadow_intensity} rgba(0,0,0,0.08);
    text-align: center;
    transition: all 0.3s ease;
}}

.service-card:hover {{
    transform: translateY(-5px);
    box-shadow: {shadow_intensity} rgba(0,0,0,0.15);
}}

.service-icon {{
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, {accent_color} 0%, {primary_color} 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 1.5rem;
}}

.service-card h3 {{
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #1e293b;
}}

.service-card p {{
    color: #64748b;
    line-height: 1.6;
}}

/* Contact Section */
.contact {{
    padding: 100px 0;
}}

.contact h2 {{
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}}

.contact-content {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
}}

.contact-info h3 {{
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: #1e293b;
}}

.contact-info p {{
    color: #64748b;
    margin-bottom: 30px;
    line-height: 1.6;
}}

.contact-details {{
    display: flex;
    flex-direction: column;
    gap: 20px;
}}

.contact-item {{
    display: flex;
    align-items: center;
    color: #475569;
}}

.contact-item i {{
    color: {primary_color};
    margin-right: 15px;
    font-size: 1.2rem;
    width: 20px;
}}

.contact-form {{
    display: flex;
    flex-direction: column;
    gap: 20px;
}}

.contact-form input,
.contact-form textarea {{
    padding: 15px;
    border: 2px solid #e2e8f0;
    border-radius: {border_radius};
    font-size: 1rem;
    transition: border-color 0.3s ease;
}}

.contact-form input:focus,
.contact-form textarea:focus {{
    outline: none;
    border-color: {primary_color};
}}

.submit-button {{
    padding: 15px;
    background: {primary_color};
    color: white;
    border: none;
    border-radius: {border_radius};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}}

.submit-button:hover {{
    background: {secondary_color};
    transform: translateY(-2px);
}}

/* Footer */
.footer {{
    background: #1e293b;
    color: white;
    padding: 60px 0 20px;
}}

.footer-content {{
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}}

.footer-section h3,
.footer-section h4 {{
    margin-bottom: 20px;
    color: white;
}}

.footer-section p {{
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 20px;
}}

.footer-section ul {{
    list-style: none;
}}

.footer-section li {{
    margin-bottom: 10px;
}}

.footer-section a {{
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.3s ease;
}}

.footer-section a:hover {{
    color: white;
}}

.social-links {{
    display: flex;
    gap: 15px;
}}

.social-links a {{
    width: 40px;
    height: 40px;
    background: #334155;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}}

.social-links a:hover {{
    background: {primary_color};
    transform: translateY(-2px);
}}

.footer-bottom {{
    border-top: 1px solid #334155;
    padding-top: 20px;
    text-align: center;
    color: #94a3b8;
}}

/* Animations */
@keyframes fadeInUp {{
    from {{
        opacity: 0;
        transform: translateY(30px);
    }}
    to {{
        opacity: 1;
        transform: translateY(0);
    }}
}}

/* Responsive Design */
@media (max-width: 768px) {{
    .nav-menu {{
        display: none;
    }}
    
    .mobile-menu-toggle {{
        display: flex;
    }}
    
    .hero-title {{
        font-size: 2.5rem;
    }}
    
    .hero-buttons {{
        flex-direction: column;
        align-items: center;
    }}
    
    .hero-stats {{
        flex-direction: column;
        gap: 30px;
    }}
    
    .about-content,
    .contact-content {{
        grid-template-columns: 1fr;
        gap: 40px;
    }}
    
    .features-grid,
    .services-grid {{
        grid-template-columns: 1fr;
    }}
    
    .footer-content {{
        grid-template-columns: 1fr;
        gap: 30px;
    }}
}}"""

def generate_unique_js(concept, prompt):
    """Generate unique JavaScript based on concept"""
    if not concept:
        return generate_enhanced_js(prompt)
    
    personality = concept.get('brand_personality', 'professional')
    
    # Adjust animations based on personality
    if personality == 'friendly':
        animation_duration = '0.4s'
        hover_scale = '1.05'
    elif personality == 'corporate':
        animation_duration = '0.2s'
        hover_scale = '1.02'
    else:  # modern/professional
        animation_duration = '0.3s'
        hover_scale = '1.03'
    
    return f"""// Modern JavaScript for enhanced user experience

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
    anchor.addEventListener('click', function (e) {{
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {{
            target.scrollIntoView({{
                behavior: 'smooth',
                block: 'start'
            }});
        }}
    }});
}});

// Navbar scroll effect
window.addEventListener('scroll', () => {{
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {{
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.backdropFilter = 'blur(20px)';
    }} else {{
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    }}
}});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {{
    mobileMenuToggle.addEventListener('click', () => {{
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    }});
}}

// Intersection Observer for animations
const observerOptions = {{
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
}};

const observer = new IntersectionObserver((entries) => {{
    entries.forEach(entry => {{
        if (entry.isIntersecting) {{
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }}
    }});
}}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .service-card, .about-text, .contact-info').forEach(el => {{
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity {animation_duration} ease, transform {animation_duration} ease`;
    observer.observe(el);
}});

// Counter animation for hero stats
function animateCounter(element, target, duration = 2000) {{
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {{
        start += increment;
        if (start < target) {{
            element.textContent = Math.floor(start) + (target >= 1000 ? '+' : '');
            requestAnimationFrame(updateCounter);
        }} else {{
            element.textContent = target + (target >= 1000 ? '+' : '');
        }}
    }}
    
    updateCounter();
}}

// Animate counters when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {{
    entries.forEach(entry => {{
        if (entry.isIntersecting) {{
            const counters = entry.target.querySelectorAll('.stat h3');
            counters.forEach(counter => {{
                const text = counter.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                if (number) {{
                    animateCounter(counter, number);
                }}
            }});
            heroObserver.unobserve(entry.target);
        }}
    }});
}}, {{ threshold: 0.5 }});

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {{
    heroObserver.observe(heroStats);
}}

// Form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {{
    contactForm.addEventListener('submit', function(e) {{
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {{
            // Show success message
            showNotification('Message sent successfully!', 'success');
            
            // Reset form
            this.reset();
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }}, 2000);
    }});
}}

// Notification system
function showNotification(message, type = 'info') {{
    const notification = document.createElement('div');
    notification.className = `notification notification-${{type}}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${{message}}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${{type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'}};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform {animation_duration} ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {{
        notification.style.transform = 'translateX(0)';
    }}, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {{
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {{
            if (notification.parentNode) {{
                notification.parentNode.removeChild(notification);
            }}
        }}, 300);
    }}, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {{
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {{
            if (notification.parentNode) {{
                notification.parentNode.removeChild(notification);
            }}
        }}, 300);
    }});
}}

// Card hover effects
document.querySelectorAll('.feature-card, .service-card').forEach(card => {{
    card.addEventListener('mouseenter', function() {{
        this.style.transform = `translateY(-10px) scale(${{hover_scale}})`;
    }});
    
    card.addEventListener('mouseleave', function() {{
        this.style.transform = 'translateY(0) scale(1)';
    }});
}});

// Parallax effect for hero section
window.addEventListener('scroll', () => {{
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {{
        hero.style.transform = `translateY(${{scrolled * 0.5}}px)`;
    }}
}});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {{
    console.log('Website loaded successfully!');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {{
        document.body.style.transition = `opacity {animation_duration} ease`;
        document.body.style.opacity = '1';
    }}, 100);
}});"""

def customize_html_content(html_content, prompt):
    """Customize HTML content based on the prompt"""
    # Extract key information from prompt
    if 'tech stack' in prompt.lower():
        # Add tech stack specific elements
        pass
    
    # Add custom title and content based on prompt
    if 'AI-Powered' in prompt or 'AI' in prompt:
        html_content = html_content.replace('Your Website', 'AI-Powered Business Solution')
        html_content = html_content.replace('Welcome to our website', 'Transform your business with cutting-edge AI technology')
    
    return html_content

def customize_css_content(css_content, prompt):
    """Customize CSS content based on the prompt"""
    # Add custom styling based on prompt
    if 'modern' in prompt.lower() or 'professional' in prompt.lower():
        # Add modern styling
        custom_css = """
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .feature-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        """
        css_content += custom_css
    
    return css_content

def customize_js_content(js_content, prompt):
    """Customize JavaScript content based on the prompt"""
    # Add custom functionality based on prompt
    if 'interactive' in prompt.lower() or 'dynamic' in prompt.lower():
        custom_js = """
        // Add smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Add animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
        """
        js_content += custom_js
    
    return js_content

def generate_enhanced_html(prompt):
    """Generate enhanced HTML based on prompt with AI analysis"""
    # Extract business type from prompt
    business_type = "AI-Powered Business Solution"
    if "ecommerce" in prompt.lower() or "shop" in prompt.lower():
        business_type = "E-commerce Platform"
    elif "saas" in prompt.lower() or "software" in prompt.lower():
        business_type = "SaaS Application"
    elif "restaurant" in prompt.lower() or "food" in prompt.lower():
        business_type = "Restaurant & Food Service"
    elif "fitness" in prompt.lower() or "health" in prompt.lower():
        business_type = "Health & Fitness Platform"
    elif "education" in prompt.lower() or "learning" in prompt.lower():
        business_type = "Educational Platform"
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{business_type}</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-logo">
                <h2>Your Brand</h2>
            </div>
            <ul class="nav-menu">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <section id="home" class="hero">
        <div class="hero-container">
            <h1 class="hero-title">Revolutionary {business_type}</h1>
            <p class="hero-subtitle">Transform your business with cutting-edge technology and innovative solutions</p>
            <div class="hero-buttons">
                <button class="cta-button primary">Get Started Today</button>
                <button class="cta-button secondary">Watch Demo</button>
            </div>
            <div class="hero-stats">
                <div class="stat">
                    <h3>10K+</h3>
                    <p>Happy Customers</p>
                </div>
                <div class="stat">
                    <h3>99.9%</h3>
                    <p>Uptime</p>
                </div>
                <div class="stat">
                    <h3>24/7</h3>
                    <p>Support</p>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="about">
        <div class="container">
            <div class="about-content">
                <div class="about-text">
                    <h2>About Our Solution</h2>
                    <p>We provide innovative tools and services that help businesses streamline operations, increase efficiency, and drive growth. Our cutting-edge technology is designed to meet the evolving needs of modern enterprises.</p>
                    <ul class="about-features">
                        <li><i class="fas fa-check"></i> Advanced Analytics & Insights</li>
                        <li><i class="fas fa-check"></i> Seamless Integration</li>
                        <li><i class="fas fa-check"></i> 24/7 Customer Support</li>
                        <li><i class="fas fa-check"></i> Scalable Infrastructure</li>
                    </ul>
                </div>
                <div class="about-image">
                    <div class="image-placeholder">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="features">
        <div class="container">
            <h2>Key Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <h3>Fast Performance</h3>
                    <p>Lightning-fast loading times and optimized performance for the best user experience.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Secure & Reliable</h3>
                    <p>Enterprise-grade security with 99.9% uptime guarantee and data protection.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3>Mobile Responsive</h3>
                    <p>Perfect experience across all devices with responsive design and mobile optimization.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-cogs"></i>
                    </div>
                    <h3>Easy Integration</h3>
                    <p>Seamless integration with your existing tools and workflows.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3>Analytics Dashboard</h3>
                    <p>Comprehensive analytics and reporting to track your success and growth.</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support to help you succeed every step of the way.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="pricing" class="pricing">
        <div class="container">
            <h2>Simple, Transparent Pricing</h2>
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Starter</h3>
                    <div class="price">$29<span>/month</span></div>
                    <ul>
                        <li>Up to 5 projects</li>
                        <li>Basic analytics</li>
                        <li>Email support</li>
                        <li>1GB storage</li>
                    </ul>
                    <button class="pricing-button">Get Started</button>
                </div>
                <div class="pricing-card featured">
                    <h3>Professional</h3>
                    <div class="price">$79<span>/month</span></div>
                    <ul>
                        <li>Unlimited projects</li>
                        <li>Advanced analytics</li>
                        <li>Priority support</li>
                        <li>10GB storage</li>
                    </ul>
                    <button class="pricing-button">Get Started</button>
                </div>
                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">$199<span>/month</span></div>
                    <ul>
                        <li>Everything in Pro</li>
                        <li>Custom integrations</li>
                        <li>Dedicated support</li>
                        <li>Unlimited storage</li>
                    </ul>
                    <button class="pricing-button">Contact Sales</button>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="contact">
        <div class="container">
            <h2>Get In Touch</h2>
            <div class="contact-content">
                <div class="contact-info">
                    <h3>Ready to get started?</h3>
                    <p>Contact our team today to learn more about how we can help your business grow.</p>
                    <div class="contact-details">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>hello@yourcompany.com</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>+1 (555) 123-4567</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>123 Business St, City, State 12345</span>
                        </div>
                    </div>
                </div>
                <form class="contact-form">
                    <input type="text" placeholder="Your Name" required>
                    <input type="email" placeholder="Your Email" required>
                    <input type="text" placeholder="Subject" required>
                    <textarea placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit" class="submit-button">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Your Brand</h3>
                    <p>Transforming businesses with innovative solutions and cutting-edge technology.</p>
                    <div class="social-links">
                        <a href="#"><i class="fab fa-facebook"></i></a>
                        <a href="#"><i class="fab fa-twitter"></i></a>
                        <a href="#"><i class="fab fa-linkedin"></i></a>
                        <a href="#"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Product</h4>
                    <ul>
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Pricing</a></li>
                        <li><a href="#">Integrations</a></li>
                        <li><a href="#">API</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="#">About</a></li>
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">Status</a></li>
                        <li><a href="#">Community</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Your Brand. All rights reserved.</p>
                <div class="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="app.js"></script>
</body>
</html>"""

def generate_enhanced_css(prompt):
    """Generate enhanced CSS with modern styling"""
    return """* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navigation */
.navbar {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    transition: all 0.3s ease;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}

.nav-logo h2 {
    color: #2563eb;
    font-weight: 700;
    font-size: 1.5rem;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
}

.nav-menu a:hover {
    color: #2563eb;
}

.nav-menu a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: #2563eb;
    transition: width 0.3s ease;
}

.nav-menu a:hover::after {
    width: 100%;
}

.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.mobile-menu-toggle span {
    width: 25px;
    height: 3px;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 0 80px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
}

.hero-container {
    position: relative;
    z-index: 2;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
    animation: fadeInUp 1s ease;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 30px;
    opacity: 0.9;
    animation: fadeInUp 1s ease 0.2s both;
}

.hero-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-bottom: 60px;
    animation: fadeInUp 1s ease 0.4s both;
}

.cta-button {
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    text-decoration: none;
    display: inline-block;
}

.cta-button.primary {
    background: #f59e0b;
    color: white;
}

.cta-button.primary:hover {
    background: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
}

.cta-button.secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
}

.cta-button.secondary:hover {
    background: white;
    color: #667eea;
    transform: translateY(-2px);
}

.hero-stats {
    display: flex;
    justify-content: center;
    gap: 60px;
    animation: fadeInUp 1s ease 0.6s both;
}

.stat {
    text-align: center;
}

.stat h3 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 5px;
}

.stat p {
    opacity: 0.8;
    font-size: 0.9rem;
}

/* About Section */
.about {
    padding: 100px 0;
    background: #f8fafc;
}

.about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.about-text h2 {
    font-size: 2.5rem;
    margin-bottom: 20px;
    color: #1e293b;
}

.about-text p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 30px;
    line-height: 1.8;
}

.about-features {
    list-style: none;
}

.about-features li {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    color: #475569;
}

.about-features i {
    color: #10b981;
    margin-right: 15px;
    font-size: 1.2rem;
}

.about-image {
    display: flex;
    justify-content: center;
}

.image-placeholder {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 4rem;
    box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

/* Features Section */
.features {
    padding: 100px 0;
}

.features h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;
}

.feature-card {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid #e2e8f0;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.feature-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 2rem;
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #1e293b;
}

.feature-card p {
    color: #64748b;
    line-height: 1.6;
}

/* Pricing Section */
.pricing {
    padding: 100px 0;
    background: #f8fafc;
}

.pricing h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    max-width: 1000px;
    margin: 0 auto;
}

.pricing-card {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    text-align: center;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.pricing-card.featured {
    border-color: #2563eb;
    transform: scale(1.05);
}

.pricing-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.pricing-card.featured:hover {
    transform: scale(1.05) translateY(-5px);
}

.pricing-card h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #1e293b;
}

.price {
    font-size: 3rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 30px;
}

.price span {
    font-size: 1rem;
    color: #64748b;
}

.pricing-card ul {
    list-style: none;
    margin-bottom: 30px;
}

.pricing-card li {
    padding: 10px 0;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}

.pricing-card li:last-child {
    border-bottom: none;
}

.pricing-button {
    width: 100%;
    padding: 15px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pricing-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
}

/* Contact Section */
.contact {
    padding: 100px 0;
}

.contact h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #1e293b;
}

.contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
}

.contact-info h3 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: #1e293b;
}

.contact-info p {
    color: #64748b;
    margin-bottom: 30px;
    line-height: 1.6;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.contact-item {
    display: flex;
    align-items: center;
    color: #475569;
}

.contact-item i {
    color: #2563eb;
    margin-right: 15px;
    font-size: 1.2rem;
    width: 20px;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.contact-form input,
.contact-form textarea {
    padding: 15px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
    outline: none;
    border-color: #2563eb;
}

.submit-button {
    padding: 15px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-button:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
}

/* Footer */
.footer {
    background: #1e293b;
    color: white;
    padding: 60px 0 20px;
}

.footer-content {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
    margin-bottom: 20px;
    color: white;
}

.footer-section p {
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 20px;
}

.footer-section ul {
    list-style: none;
}

.footer-section li {
    margin-bottom: 10px;
}

.footer-section a {
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: white;
}

.social-links {
    display: flex;
    gap: 15px;
}

.social-links a {
    width: 40px;
    height: 40px;
    background: #334155;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.social-links a:hover {
    background: #2563eb;
    transform: translateY(-2px);
}

.footer-bottom {
    border-top: 1px solid #334155;
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #94a3b8;
}

.footer-links {
    display: flex;
    gap: 20px;
}

.footer-links a {
    color: #94a3b8;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: white;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }
    
    .mobile-menu-toggle {
        display: flex;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .hero-stats {
        flex-direction: column;
        gap: 30px;
    }
    
    .about-content,
    .contact-content {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    
    .features-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-grid {
        grid-template-columns: 1fr;
    }
    
    .pricing-card.featured {
        transform: none;
    }
    
    .footer-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    
    .footer-bottom {
        flex-direction: column;
        gap: 20px;
        text-align: center;
    }
}"""

def generate_enhanced_js(prompt):
    """Generate enhanced JavaScript with modern functionality"""
    return """// Modern JavaScript for enhanced user experience

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.backdropFilter = 'blur(20px)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    }
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle && navMenu) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .pricing-card, .about-text, .contact-info').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter animation for hero stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (target >= 1000 ? '+' : '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (target >= 1000 ? '+' : '');
        }
    }
    
    updateCounter();
}

// Animate counters when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat h3');
            counters.forEach(counter => {
                const text = counter.textContent;
                const number = parseInt(text.replace(/[^0-9]/g, ''));
                if (number) {
                    animateCounter(counter, number);
                }
            });
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    heroObserver.observe(heroStats);
}

// Form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // Show success message
            showNotification('Message sent successfully!', 'success');
            
            // Reset form
            this.reset();
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Pricing card hover effects
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = this.classList.contains('featured') 
            ? 'scale(1.05) translateY(-5px)' 
            : 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = this.classList.contains('featured') 
            ? 'scale(1.05)' 
            : 'translateY(0)';
    });
});

// Feature card tilt effect
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});"""

def generate_sample_html(prompt):
    """Generate sample HTML based on prompt"""
    return generate_enhanced_html(prompt)

def generate_sample_css():
    """Generate sample CSS"""
    return """* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.navbar {
    background: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}

.nav-logo h2 {
    color: #2563eb;
    font-weight: 700;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 30px;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: #2563eb;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 0 80px;
    text-align: center;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 30px;
    opacity: 0.9;
}

.cta-button {
    background: #f59e0b;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cta-button:hover {
    background: #d97706;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
}

.about, .features, .contact {
    padding: 80px 0;
}

.about {
    background: #f8fafc;
}

.about h2, .features h2, .contact h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 30px;
    color: #1e293b;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 50px;
}

.feature-card {
    background: white;
    padding: 40px 30px;
    border-radius: 12px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
}

.feature-card h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: #1e293b;
}

.contact {
    background: #1e293b;
    color: white;
    text-align: center;
}

.contact h2 {
    color: white;
}

.footer {
    background: #0f172a;
    color: white;
    text-align: center;
    padding: 30px 0;
}

@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }
    
    .nav-menu {
        display: none;
    }
}"""

def generate_sample_js():
    """Generate sample JavaScript"""
    return """// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Add animation to feature cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// CTA button interactions
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
        // Add your CTA logic here
        console.log('CTA button clicked!');
    });
});"""

@app.route('/api/download-website/<website_id>', methods=['GET'])
@monitor_api('/api/download-website')
def download_website(website_id):
    """Simulated download endpoint — logs the event but does not serve real files."""
    try:
        # Optionally record the request for metrics / analytics
        try:
            db_exec("""
                INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                '/api/download-website',
                'GET',
                200,
                0,
                1,
                None,
                json.dumps({'website_id': website_id})
            ))
        except Exception as db_e:
            print("Download log failed:", db_e)

        # Just return a fake confirmation since we don't store files
        return jsonify({
            'success': True,
            'message': f'Download request recorded for website_id: {website_id}',
            'note': 'File download disabled in lightweight mode (no site files stored).'
        })

    except Exception as e:
        return jsonify({'error': f'Error handling download: {str(e)}'}), 500


@app.route('/api/generate-pdf-content', methods=['POST'])
def generate_pdf_content():
    """Generate professional PDF content using Gemini API"""
    try:
        data = request.get_json()
        idea = data.get('idea', '').strip()
        
        if not idea:
            return jsonify({'error': 'Please provide an idea to generate PDF content'}), 400
        
        # Generate comprehensive business plan content using Gemini
        pdf_content = generate_business_plan_content(idea)
        
        return jsonify({
            'success': True,
            'content': pdf_content,
            'message': 'PDF content generated successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Error generating PDF content: {str(e)}'}), 500

@app.route('/api/ai-enhanced', methods=['POST'])
def ai_enhanced():
    """Generate AI-enhanced version of an idea using Groq API"""
    try:
        data = request.get_json()
        idea = data.get('idea', '').strip()
        
        if not idea:
            return jsonify({'error': 'Please provide an idea to enhance'}), 400
        
        # Generate AI-enhanced version using Groq
        enhanced_idea = generate_ai_enhanced_idea_groq(idea)
        
        return jsonify({
            'success': True,
            'enhanced_idea': enhanced_idea,
            'message': 'AI enhancement completed successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Error enhancing idea: {str(e)}'}), 500

@app.route('/api/rethink-idea', methods=['POST'])
@monitor_api('/api/rethink-idea')
def rethink_idea():
    """Generate rethought version(s) of an idea using Groq API and log everything to DB for admin analytics."""
    start_ts = datetime.utcnow()
    api_call_id = None
    llm_model = "Groq API"

    # --- Step 1: Log API request start
    try:
        api_call_id = db_exec("""
            INSERT INTO api_calls (endpoint, method, status_code, latency_ms, success, error, request_meta, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            '/api/rethink-idea',
            request.method,
            None, 0, 0, None,
            json.dumps({'path': request.path}),
            datetime.utcnow().isoformat()
        ))
    except Exception as e:
        print("api_calls insert failed:", e)

    try:
        # --- Step 2: Extract input
        data = request.get_json(silent=True) or {}

        idea_text = (data.get('idea') or '').strip()
        variation = str(data.get('variation') or time.time())
        count = int(data.get('count') or 1)
        count = max(1, min(count, 10))  # max 10

        user_id = data.get('user_id') or data.get('userId') or None
        idea_id = data.get('idea_id') or data.get('ideaId') or None

        if not idea_text and not idea_id:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls SET status_code=?, success=?, error=?, latency_ms=? WHERE id=?
                """, (400, 0, "Missing idea or idea_id",
                      int((datetime.utcnow() - start_ts).total_seconds() * 1000),
                      api_call_id))
            return jsonify({'error': 'Please provide an idea text or idea_id to rethink.'}), 400

        # --- Step 3: Fetch idea text if only ID given
        if idea_id and not idea_text:
            try:
                rows = db_query("SELECT idea_text, user_id FROM ideas WHERE id = ? LIMIT 1", (idea_id,))
                if rows:
                    idea_text = rows[0].get('idea_text') or idea_text
                    if not user_id:
                        user_id = rows[0].get('user_id')
            except Exception as e:
                print("Warning: could not fetch idea by id:", e)

        # --- Step 4: Create idea record if not provided
        created_idea_id = idea_id
        if not created_idea_id:
            try:
                created_idea_id = db_exec("""
                    INSERT INTO ideas (idea_text, user_id, user_metadata, created_at)
                    VALUES (?, ?, ?, ?)
                """, (
                    idea_text or None,
                    user_id,
                    json.dumps({'created_via': 'rethink_endpoint'}),
                    datetime.utcnow().isoformat()
                ))
            except Exception as e:
                print("Failed to create minimal idea record:", e)

        # --- Step 5: Generate rethought versions
        generated = []
        inserted_ids = []

        for i in range(count):
            vtok = f"{variation}-{i}-{int(time.time() * 1000)}"
            try:
                ri = generate_rethought_idea(idea_text, vtok)
            except Exception as gen_e:
                print("generate_rethought_idea error:", gen_e)
                ri = None

            if not ri:
                continue

            # Extract text & optional score
            mutation_text = None
            mutation_score = None
            mutation_meta = {}

            if isinstance(ri, dict):
                mutation_text = ri.get('text') or ri.get('idea') or ri.get('rethought') or json.dumps(ri)
                for k in ('viability_score', 'mutation_score', 'score', 'viability', 'quality'):
                    if k in ri:
                        try:
                            mutation_score = float(ri[k])
                            break
                        except Exception:
                            pass
                mutation_meta = {k: ri[k] for k in ri if k not in ('text', 'idea', 'rethought')}
            else:
                mutation_text = str(ri)

            # --- Step 6: Save mutation to DB
            try:
                mid = db_exec("""
                    INSERT INTO idea_mutations (idea_id, mutation_text, mutation_viability_score, mutation_meta, mutation_timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    created_idea_id,
                    mutation_text,
                    mutation_score,
                    json.dumps({
                        **(mutation_meta or {}),
                        'variation': vtok,
                        'generated_at': datetime.utcnow().isoformat()
                    }),
                    datetime.utcnow().isoformat()
                ))
                inserted_ids.append(mid)
            except Exception as db_e:
                print("Failed to insert mutation:", db_e)
                inserted_ids.append(None)

            generated.append({
                'mutation_id': inserted_ids[-1],
                'mutation_text': mutation_text,
                'mutation_viability_score': mutation_score,
                'variation_token': vtok
            })

        # --- Step 7: Log success in api_calls
        duration_ms = int((datetime.utcnow() - start_ts).total_seconds() * 1000)
        if api_call_id:
            try:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, latency_ms=?
                    WHERE id=?
                """, (200, 1, duration_ms, api_call_id))
            except Exception as e:
                print("api_calls update failed:", e)

        # --- Step 8: Track model usage (optional)
        try:
            db_exec("""
                INSERT INTO llm_usage (llm_model, count)
                VALUES (?, 1)
                ON CONFLICT(llm_model) DO UPDATE SET count = count + 1
            """, (llm_model,))
        except Exception as e:
            print("llm_usage update failed:", e)

        # --- Step 9: Build final response
        return jsonify({
            'success': True,
            'idea_id': created_idea_id,
            'mutations_generated': len(generated),
            'mutations': generated,
            'duration_ms': duration_ms,
            'message': 'Idea rethinking completed successfully'
        })

    except Exception as e:
        # --- Step 10: Log failure in api_calls
        try:
            if api_call_id:
                db_exec("""
                    UPDATE api_calls
                    SET status_code=?, success=?, error=?, latency_ms=?
                    WHERE id=?
                """, (
                    500, 0, str(e),
                    int((datetime.utcnow() - start_ts).total_seconds() * 1000),
                    api_call_id
                ))
        except Exception as log_e:
            print("api_calls error logging failed:", log_e)

        return jsonify({'error': f'Error rethinking idea: {str(e)}'}), 500


@app.route('/api/explain-idea', methods=['POST'])
def explain_idea():
    """Generate detailed explanation of an idea in simple English using Groq API"""
    try:
        data = request.get_json()
        idea = data.get('idea', '').strip()
        
        if not idea:
            return jsonify({'error': 'Please provide an idea to explain'}), 400
        
        # Generate detailed explanation using Groq in simple English
        explanation = generate_idea_explanation_groq(idea)
        
        return jsonify({
            'success': True,
            'explanation': explanation,
            'message': 'Idea explanation generated successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Error explaining idea: {str(e)}'}), 500

@app.route('/api/explain-mutation', methods=['POST'])
def explain_mutation():
    """Explain what the mutation did to the original idea in simple English using Groq"""
    try:
        data = request.get_json()
        original_idea = data.get('original_idea', '').strip()
        mutated_idea = data.get('mutated_idea', '').strip()
        
        if not original_idea or not mutated_idea:
            return jsonify({'error': 'Please provide both original and mutated ideas'}), 400
        
        # Generate explanation of the mutation using Groq in simple English
        explanation = generate_mutation_explanation_groq(original_idea, mutated_idea)
        
        return jsonify({
            'success': True,
            'explanation': explanation,
            'message': 'Mutation explanation generated successfully'
        })
    
    except Exception as e:
        return jsonify({'error': f'Error explaining mutation: {str(e)}'}), 500

def generate_business_plan_content(idea):
    """Generate comprehensive business plan content using Gemini API"""
    try:
        prompt = f"""
        Based on this business idea: "{idea}"
        
        Create a comprehensive, professional business plan document with the following sections:
        
        1. **Executive Summary** (2-3 paragraphs)
        2. **Business Description** (Detailed description of the business concept)
        3. **Market Analysis** (Target market, market size, competition analysis)
        4. **Products/Services** (Detailed description of offerings)
        5. **Marketing Strategy** (How to reach and acquire customers)
        6. **Operations Plan** (How the business will operate day-to-day)
        7. **Financial Projections** (Revenue, costs, profit projections for 3 years)
        8. **Risk Analysis** (Potential risks and mitigation strategies)
        9. **Implementation Timeline** (Step-by-step plan to launch the business)
        10. **Conclusion** (Summary and next steps)
        
        Make the content:
        - Professional and well-structured
        - Specific to the business idea
        - Realistic and actionable
        - Include specific numbers and metrics where possible
        - Use proper business terminology
        - Be comprehensive but concise
        
        Format the response as a well-structured document with clear headings and detailed content for each section.
        """
        
        # Use direct Gemini API call for business plan content
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY_2}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            response_text = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {response.status_code}")
        
        # Clean up and format the response
        formatted_content = format_business_plan_content(response_text)
        
        return formatted_content
        
    except Exception as e:
        print(f"Error generating business plan content: {e}")
        # Return fallback content
        return generate_fallback_business_plan(idea)

def format_business_plan_content(content):
    """Format the business plan content for PDF generation"""
    try:
        # Clean up the content and ensure proper formatting
        lines = content.split('\n')
        formatted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Format headings
            if line.startswith('**') and line.endswith('**'):
                heading = line.replace('**', '').strip()
                formatted_lines.append(f"\n# {heading}\n")
            elif line.startswith('*') and line.endswith('*'):
                heading = line.replace('*', '').strip()
                formatted_lines.append(f"\n## {heading}\n")
            else:
                formatted_lines.append(line)
        
        return '\n'.join(formatted_lines)
        
    except Exception as e:
        print(f"Error formatting content: {e}")
        return content

def generate_fallback_business_plan(idea):
    """Generate fallback business plan content"""
    return f"""
# Business Plan: {idea}

## Executive Summary

This business plan outlines the development and implementation of "{idea}". The concept represents a unique opportunity in the market with significant potential for growth and profitability. Our analysis indicates strong market demand and a clear path to sustainable success.

## Business Description

{idea} is a innovative business concept that addresses specific market needs. The business will focus on delivering high-quality products/services to our target customers while maintaining operational efficiency and customer satisfaction.

## Market Analysis

**Target Market:** Our primary target market consists of [specific demographic] who are looking for [specific solution]. The market size is estimated at [market size] with a growth rate of [growth rate]% annually.

**Competition:** The competitive landscape includes [competitor analysis]. Our competitive advantage lies in [unique value proposition].

## Products/Services

Our core offering includes:
- [Product/Service 1]: [Description]
- [Product/Service 2]: [Description]
- [Product/Service 3]: [Description]

## Marketing Strategy

Our marketing approach will focus on:
1. Digital marketing and social media presence
2. Content marketing and SEO
3. Partnership and referral programs
4. Customer retention strategies

## Operations Plan

**Day-to-Day Operations:**
- [Operational process 1]
- [Operational process 2]
- [Operational process 3]

**Key Resources:**
- Human resources: [Staff requirements]
- Technology: [Technology needs]
- Physical resources: [Facility/equipment needs]

## Financial Projections

**Year 1:**
- Revenue: $[amount]
- Costs: $[amount]
- Net Profit: $[amount]

**Year 2:**
- Revenue: $[amount]
- Costs: $[amount]
- Net Profit: $[amount]

**Year 3:**
- Revenue: $[amount]
- Costs: $[amount]
- Net Profit: $[amount]

## Risk Analysis

**Potential Risks:**
1. Market risk: [Description and mitigation]
2. Operational risk: [Description and mitigation]
3. Financial risk: [Description and mitigation]
4. Competitive risk: [Description and mitigation]

## Implementation Timeline

**Phase 1 (Months 1-3):** [Initial setup and planning]
**Phase 2 (Months 4-6):** [Development and testing]
**Phase 3 (Months 7-9):** [Launch and initial operations]
**Phase 4 (Months 10-12):** [Growth and optimization]

## Conclusion

{idea} represents a significant opportunity for success. With proper execution of this business plan, we anticipate strong growth and profitability. The next steps involve securing funding, building the team, and beginning implementation according to the outlined timeline.
"""

def generate_ai_enhanced_idea(idea):
    """Generate AI-enhanced version of an idea using Gemini API"""
    try:
        prompt = f"""
        Take this business idea: "{idea}"
        
        Create an AI-enhanced version that incorporates:
        1. Advanced AI/ML capabilities
        2. Modern technology stack
        3. Scalable architecture
        4. Data-driven insights
        5. Automation features
        6. Personalization
        7. Real-time analytics
        8. Integration capabilities
        
        Make it sound professional, innovative, and technically advanced. Focus on how AI can transform and enhance the original concept.
        
        Provide a comprehensive description of the enhanced idea in 2-3 paragraphs.
        """
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY_2}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating AI-enhanced idea: {e}")
        return f"AI-Enhanced Version: {idea} with advanced machine learning capabilities, real-time analytics, automated workflows, and intelligent personalization features. The enhanced version includes predictive insights, natural language processing, computer vision integration, and seamless API connectivity for enterprise-grade scalability and performance."

def generate_ai_enhanced_idea_groq(idea):
    """Generate AI-enhanced version of an idea using Groq API"""
    try:
        prompt = f"""Take this business idea: "{idea}"

Create an AI-enhanced version that incorporates:
1. Advanced AI/ML capabilities
2. Modern technology stack
3. Scalable architecture
4. Data-driven insights
5. Automation features
6. Personalization
7. Real-time analytics
8. Integration capabilities

Make it sound professional, innovative, and technically advanced. Focus on how AI can transform and enhance the original concept.

Provide a comprehensive description of the enhanced idea in 2-3 paragraphs."""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert at transforming business ideas into AI-enhanced, technologically advanced concepts. Provide detailed, professional descriptions.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.8,
                'max_tokens': 800
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating AI-enhanced idea with Groq: {e}")
        return f"AI-Enhanced Version: {idea} with advanced machine learning capabilities, real-time analytics, automated workflows, and intelligent personalization features. The enhanced version includes predictive insights, natural language processing, computer vision integration, and seamless API connectivity for enterprise-grade scalability and performance."

def generate_rethought_idea(idea, variation_token=None):
    """Generate rethought version of an idea using Groq API"""
    try:
        variation_note = f"\nVariation token: {variation_token}. Ensure this output is novel and significantly different from any prior outputs for this idea." if variation_token else ""
        prompt = f"""Take this business idea: "{idea}"

Rethink and reimagine this concept from a fresh perspective, considering:
1. Current market trends and opportunities
2. Emerging technologies and innovations
3. Changing consumer behaviors
4. Sustainability and social impact
5. New business models
6. Competitive advantages
7. Scalability and growth potential
8. Market gaps and opportunities

Provide a completely reimagined version that addresses modern challenges and opportunities. Make it innovative, relevant, and forward-thinking.
{variation_note}

Provide a comprehensive description of the rethought idea in 2-3 paragraphs."""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are an expert business strategist who reimagines ideas with fresh perspectives. Provide innovative, forward-thinking rethought versions of business concepts.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 1.0,
                'max_tokens': 800
            },
            timeout=20
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating rethought idea: {e}")
        return f"Rethought Version: {idea} reimagined as a sustainable, community-driven platform that leverages emerging technologies like blockchain, IoT, and edge computing. The rethought concept focuses on environmental impact, social responsibility, and creating a circular economy model that benefits all stakeholders while addressing global challenges."

def generate_idea_explanation(idea):
    """Generate detailed explanation of an idea using Gemini API"""
    try:
        prompt = f"""
        Provide a comprehensive explanation of this business idea: "{idea}"
        
        Include detailed analysis of:
        1. **Concept Overview**: What the idea is and how it works
        2. **Market Opportunity**: Target market, size, and potential
        3. **Business Model**: How it generates revenue and creates value
        4. **Competitive Advantage**: What makes it unique and defensible
        5. **Implementation Strategy**: Key steps to bring it to market
        6. **Risk Assessment**: Potential challenges and mitigation strategies
        7. **Success Metrics**: How to measure progress and success
        8. **Future Potential**: Growth opportunities and scalability
        
        Make the explanation professional, detailed, and actionable. Use clear headings and bullet points for easy reading.
        """
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY_2}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating idea explanation: {e}")
        return f"""
**Concept Overview**
{idea} is an innovative business concept that addresses specific market needs through a unique approach to problem-solving.

**Market Opportunity**
The target market consists of [specific demographic] seeking [specific solution]. The market size is estimated at [size] with [growth rate]% annual growth.

**Business Model**
Revenue is generated through [revenue streams] while creating value for customers through [value proposition].

**Competitive Advantage**
The key differentiator is [unique selling point] which provides a sustainable competitive edge in the market.

**Implementation Strategy**
Key steps include [implementation phases] with focus on [critical success factors].

**Risk Assessment**
Potential risks include [risk factors] with mitigation strategies such as [risk mitigation].

**Success Metrics**
Success will be measured through [KPIs] and [performance indicators].

**Future Potential**
The concept has significant scalability potential with opportunities for [growth areas].
"""

def generate_idea_explanation_groq(idea):
    """Generate detailed explanation of an idea in simple English using Groq API"""
    try:
        prompt = f"""Explain this business idea in simple, easy-to-understand English: "{idea}"

Provide a clear explanation that covers:
1. What the idea is and how it works (in plain language)
2. Who would use it and why
3. How it makes money or creates value
4. What makes it special or different
5. What steps are needed to make it happen
6. What challenges might come up
7. Why it could be successful

Write in simple, conversational English that anyone can understand. Avoid jargon and technical terms. Use examples and analogies to make it clear."""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a friendly business advisor who explains complex ideas in simple, easy-to-understand language. Use everyday examples and avoid technical jargon.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating idea explanation with Groq: {e}")
        return f"""Here's a simple explanation of this business idea:

**What it is:** {idea} is a business concept that aims to solve a specific problem or meet a need in the market.

**Who it's for:** This idea targets people who need [solution]. They would benefit because [benefit].

**How it works:** The business would operate by [basic operation]. It creates value by [value creation].

**What makes it special:** This idea stands out because [unique aspect]. It's different from existing solutions in [difference].

**Next steps:** To make this happen, you would need to [key steps]. The most important thing is [critical factor].

**Potential challenges:** Some things to watch out for include [challenges]. But these can be addressed by [solutions].

**Why it could succeed:** This idea has potential because [success factors]. With the right execution, it could [outcome]."""

def generate_mutation_explanation(original_idea, mutated_idea):
    """Generate explanation of what the mutation did to the original idea"""
    try:
        prompt = f"""
        Compare and explain the transformation between these two business ideas:
        
        **Original Idea:**
        {original_idea}
        
        **Mutated/Enhanced Version:**
        {mutated_idea}
        
        Provide a comprehensive explanation that covers:
        
        1. **Key Transformations**: What major changes were made to the original concept?
        2. **Technology Enhancements**: What new technologies or capabilities were added?
        3. **Market Positioning**: How does the mutation improve market fit and competitiveness?
        4. **Scalability Improvements**: What makes the mutated version more scalable?
        5. **Business Model Evolution**: How has the revenue model or value proposition changed?
        6. **Risk Mitigation**: What risks from the original idea were addressed?
        7. **Competitive Advantages**: What new competitive edges were introduced?
        8. **Implementation Benefits**: Why is the mutated version easier/better to implement?
        
        Make the explanation clear, specific, and actionable. Use bullet points and structured format.
        """
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY_2}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': prompt}]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            data = response.json()
            return data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating mutation explanation: {e}")
        return f"""
**Mutation Analysis**

**Original Concept:**
{original_idea}

**Enhanced Version:**
{mutated_idea}

**Key Transformations:**
• Added AI and machine learning capabilities for intelligent automation
• Incorporated modern technology stack for better scalability
• Enhanced user experience with real-time features
• Improved business model with multiple revenue streams

**Technology Enhancements:**
• Cloud-native architecture for global scalability
• Advanced analytics and predictive insights
• API-first design for seamless integrations
• Mobile-responsive and cross-platform compatibility

**Market Positioning:**
• Aligned with current market trends and demands
• Addressed emerging customer needs
• Competitive differentiation through innovation
• Sustainable and future-proof approach

**Business Value:**
The mutation transforms the original idea into a more viable, scalable, and market-ready solution by incorporating modern technologies, addressing market gaps, and creating multiple value streams for sustainable growth.
"""

def generate_mutation_explanation_groq(original_idea, mutated_idea):
    """Generate explanation of mutation in simple English using Groq API"""
    try:
        prompt = f"""Compare these two business ideas and explain the changes in simple, easy-to-understand English:

**Original Idea:**
{original_idea}

**Enhanced/Mutated Version:**
{mutated_idea}

Explain:
1. What major changes were made (in plain language)
2. What new features or capabilities were added
3. How the enhanced version is better for the market
4. Why the enhanced version can grow bigger
5. How the business model improved
6. What problems from the original were fixed
7. What new advantages it has
8. Why it's easier or better to build now

Write in simple, conversational English. Use examples and avoid jargon."""
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a friendly business advisor who explains complex transformations in simple, easy-to-understand language. Use everyday examples and avoid technical jargon.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1200
            },
            timeout=15
        )
        
        if response.ok:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"Groq API error: {response.status_code}")
            
    except Exception as e:
        print(f"Error generating mutation explanation with Groq: {e}")
        return f"""Here's a simple explanation of how the idea was enhanced:

**What Changed:** The enhanced version adds [key improvements] to make the idea better and more powerful.

**New Features:** We added [new capabilities] that weren't in the original idea. This makes it [benefit].

**Better for the Market:** The enhanced version fits the market better because [market fit]. It appeals to [target audience] more effectively.

**Can Grow Bigger:** The enhanced version can scale up easier because [scalability factors]. This means it can handle [growth scenario].

**Better Business Model:** The way it makes money improved by [business model changes]. This creates [value].

**Problems Fixed:** Some issues with the original idea were solved by [solutions]. This reduces [risks].

**New Advantages:** The enhanced version has [advantages] that give it an edge over competitors.

**Easier to Build:** It's now easier to build because [implementation benefits]. This means [outcome]."""

def save_chat_to_memory(chat_data):
    """Save chat data to memory folder as JSON"""
    try:
        chat_id = str(uuid.uuid4())
        chat_data['id'] = chat_id
        chat_data['timestamp'] = datetime.now().isoformat()
        
        # Save to memory folder
        memory_file = os.path.join(MEMORY_DIR, f'chat_{chat_id}.json')
        with open(memory_file, 'w', encoding='utf-8') as f:
            json.dump(chat_data, f, indent=2, ensure_ascii=False)
        
        return chat_id
    except Exception as e:
        print(f"Error saving chat to memory: {e}")
        return None

def load_chat_from_memory(chat_id):
    """Load chat data from memory folder"""
    try:
        memory_file = os.path.join(MEMORY_DIR, f'chat_{chat_id}.json')
        if os.path.exists(memory_file):
            with open(memory_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    except Exception as e:
        print(f"Error loading chat from memory: {e}")
        return None

def get_all_chats():
    """Get all chat files from memory folder"""
    try:
        chats = []
        for filename in os.listdir(MEMORY_DIR):
            if filename.startswith('chat_') and filename.endswith('.json'):
                chat_id = filename.replace('chat_', '').replace('.json', '')
                chat_data = load_chat_from_memory(chat_id)
                if chat_data:
                    chats.append(chat_data)
        
        # Sort by timestamp (newest first)
        chats.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return chats
    except Exception as e:
        print(f"Error getting all chats: {e}")
        return []

@app.route('/api/save-chat', methods=['POST'])
def save_chat():
    """Save chat conversation to memory"""
    try:
        data = request.get_json()
        chat_id = save_chat_to_memory(data)
        
        if chat_id:
            return jsonify({
                'success': True,
                'chat_id': chat_id,
                'message': 'Chat saved successfully'
            })
        else:
            return jsonify({'error': 'Failed to save chat'}), 500
    
    except Exception as e:
        return jsonify({'error': f'Error saving chat: {str(e)}'}), 500

@app.route('/api/get-chats', methods=['GET'])
def get_chats():
    """Get all saved chats"""
    try:
        chats = get_all_chats()
        return jsonify({
            'success': True,
            'chats': chats,
            'count': len(chats)
        })
    
    except Exception as e:
        return jsonify({'error': f'Error getting chats: {str(e)}'}), 500

@app.route('/api/generate-ideas', methods=['POST'])
def generate_ideas():
    """Generate scalable business ideas automatically"""
    try:
        data = request.get_json()
        user_input = data.get('input', '').strip()
        
        if not user_input:
            return jsonify({'error': 'Please provide some input to generate ideas'}), 400
        
        # Generate ideas using AI
        ideas = generate_scalable_ideas(user_input)
        
        return jsonify({
            'success': True,
            'ideas': ideas,
            'count': len(ideas)
        })
    
    except Exception as e:
        return jsonify({'error': f'Error generating ideas: {str(e)}'}), 500

def generate_scalable_ideas(user_input):
    """Generate scalable business ideas based on user input"""
    try:
        # Use Gemini to generate ideas
        prompt = f"""
        Based on the following input: "{user_input}"
        
        Generate 5 scalable business ideas that could be built into successful companies. For each idea, provide:
        
        1. A catchy title
        2. A brief description (2-3 sentences)
        3. Target market
        4. Revenue potential (Low/Medium/High)
        5. Scalability score (1-10)
        6. Key features/benefits
        7. Initial investment estimate
        8. Time to market estimate
        
        Format the response as a JSON array with the following structure:
        [
            {{
                "id": "idea_1",
                "title": "Idea Title",
                "description": "Brief description",
                "target_market": "Target audience",
                "revenue_potential": "High/Medium/Low",
                "scalability_score": 8,
                "key_features": ["Feature 1", "Feature 2", "Feature 3"],
                "initial_investment": "$10K - $50K",
                "time_to_market": "3-6 months",
                "category": "Technology/Healthcare/Finance/etc"
            }}
        ]
        
        Make sure the ideas are innovative, feasible, and have real market potential.
        """
        
        # Use Gemini API KEY 2 directly for idea generation
        api_response = requests.post(
            f'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key={GEMINI_API_KEY_2}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{'text': prompt}]
                }],
                'generationConfig': {
                    'temperature': 0.9,
                    'topP': 0.95,
                    'topK': 40
                }
            },
            timeout=30
        )
        
        if api_response.ok:
            data = api_response.json()
            response = data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        else:
            raise Exception(f"Gemini API error: {api_response.status_code}")
        
        # Try to parse JSON from response
        try:
            # Extract JSON from response if it's wrapped in markdown
            import re
            json_match = re.search(r'```json\s*(\[.*?\])\s*```', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Try to find JSON array in the response
                json_match = re.search(r'(\[.*?\])', response, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    raise ValueError("No JSON found in response")
            
            ideas = json.loads(json_str)
            
            # Add unique IDs and ensure all required fields
            for i, idea in enumerate(ideas):
                idea['id'] = f"idea_{i+1}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                idea['created_at'] = datetime.now().isoformat()
                
                # Ensure all required fields exist
                required_fields = ['title', 'description', 'target_market', 'revenue_potential', 
                                 'scalability_score', 'key_features', 'initial_investment', 
                                 'time_to_market', 'category']
                
                for field in required_fields:
                    if field not in idea:
                        if field == 'scalability_score':
                            idea[field] = 7
                        elif field == 'key_features':
                            idea[field] = ['Innovative solution', 'User-friendly interface', 'Scalable architecture']
                        elif field == 'category':
                            idea[field] = 'Technology'
                        else:
                            idea[field] = 'To be determined'
            
            return ideas
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing AI response as JSON: {e}")
            # Fallback: generate sample ideas
            return generate_sample_ideas(user_input)
            
    except Exception as e:
        print(f"Error generating ideas: {e}")
        return generate_sample_ideas(user_input)

def generate_sample_ideas(user_input):
    """Generate sample ideas as fallback"""
    return [
        {
            "id": f"idea_1_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": "AI-Powered Personal Assistant Platform",
            "description": "A comprehensive AI assistant that helps users manage their daily tasks, schedule, and productivity. Uses machine learning to understand user preferences and automate routine activities.",
            "target_market": "Busy professionals, entrepreneurs, students",
            "revenue_potential": "High",
            "scalability_score": 9,
            "key_features": ["Voice commands", "Smart scheduling", "Task automation", "Cross-platform sync"],
            "initial_investment": "$50K - $100K",
            "time_to_market": "6-12 months",
            "category": "Technology",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": f"idea_2_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": "Sustainable E-commerce Marketplace",
            "description": "An online marketplace exclusively for eco-friendly and sustainable products. Connects conscious consumers with verified sustainable brands and provides carbon footprint tracking.",
            "target_market": "Environmentally conscious consumers, sustainable brands",
            "revenue_potential": "Medium",
            "scalability_score": 8,
            "key_features": ["Product verification", "Carbon tracking", "Brand partnerships", "Mobile app"],
            "initial_investment": "$30K - $75K",
            "time_to_market": "4-8 months",
            "category": "E-commerce",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": f"idea_3_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": "Remote Work Collaboration Hub",
            "description": "A comprehensive platform that enhances remote team collaboration with advanced project management, virtual office spaces, and AI-powered productivity insights.",
            "target_market": "Remote teams, distributed companies, freelancers",
            "revenue_potential": "High",
            "scalability_score": 9,
            "key_features": ["Virtual offices", "AI insights", "Project tracking", "Team analytics"],
            "initial_investment": "$75K - $150K",
            "time_to_market": "8-12 months",
            "category": "SaaS",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": f"idea_4_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": "Health & Wellness Tracking App",
            "description": "An integrated health platform that combines fitness tracking, nutrition monitoring, mental health support, and connects users with healthcare professionals.",
            "target_market": "Health-conscious individuals, fitness enthusiasts, patients",
            "revenue_potential": "Medium",
            "scalability_score": 7,
            "key_features": ["Wearable integration", "Nutrition tracking", "Mental health tools", "Doctor connections"],
            "initial_investment": "$40K - $80K",
            "time_to_market": "6-10 months",
            "category": "Healthcare",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": f"idea_5_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "title": "Smart Home Automation Service",
            "description": "A subscription-based service that provides AI-powered home automation solutions, including energy optimization, security monitoring, and lifestyle enhancement.",
            "target_market": "Homeowners, smart home enthusiasts, property managers",
            "revenue_potential": "High",
            "scalability_score": 8,
            "key_features": ["AI optimization", "Security monitoring", "Energy savings", "Custom automation"],
            "initial_investment": "$60K - $120K",
            "time_to_market": "9-15 months",
            "category": "IoT",
            "created_at": datetime.now().isoformat()
        }
    ]

def safe_aggregate(query, params=(), key='cnt'):
    try:
        rows = db_query(query, params)
        if rows and isinstance(rows, list) and key in rows[0]:
            return rows[0].get(key) or 0
    except Exception as e:
        print("safe_aggregate error:", e)
    return 0

# Custom protected ModelView placeholder (kept for future SQLAlchemy usage)
# Only define if ModelView is available
if ModelView is not None:
    class ProtectedModelView(ModelView):
        def is_accessible(self):
            try:
                user = auth.current_user()
                return user is not None
            except Exception:
                return False
else:
    # Placeholder class if SQLAlchemy not available
    class ProtectedModelView:
        pass

# Minimal admin dashboard page using BaseView

class MetricsView(BaseView):
    @expose('/')
    @auth.login_required
    def index(self):
        # reuse the same SQLs as admin_summary
        total_users = db_query("SELECT COUNT(DISTINCT user_id) as cnt FROM ideas WHERE user_id IS NOT NULL")[0]['cnt'] or 0
        total_ideas = db_query("SELECT COUNT(*) as cnt FROM ideas")[0]['cnt'] or 0
        # avg_score via COALESCE so NULL -> 0
        avg_row = db_query("SELECT COALESCE(AVG(composite_score), 0) as avg_score FROM ideas")
        avg_score = avg_row[0]['avg_score'] if avg_row and 'avg_score' in avg_row[0] else 0
        sites_generated = db_query("SELECT COUNT(*) as cnt FROM website_generations")[0]['cnt'] or 0
        api_failures = db_query("SELECT COUNT(*) as cnt FROM api_calls WHERE success=0")[0]['cnt'] or 0
        total_chats = db_query("SELECT COUNT(*) as cnt FROM chat_logs")[0]['cnt'] or 0
        total_mutations = db_query("SELECT COUNT(*) as cnt FROM idea_mutations")[0]['cnt'] or 0
        total_api_calls = db_query("SELECT COUNT(*) as cnt FROM api_calls")[0]['cnt'] or 0

        # Render the template and pass values
        return render_template(
            'admin_dashboard.html',
            total_users=total_users,
            total_ideas=total_ideas,
            avg_score=avg_score,
            sites_generated=sites_generated,
            api_failures=api_failures,
            total_chats=total_chats,
            total_mutations=total_mutations,
            total_api_calls=total_api_calls
        )

# Attach admin to app (keep as you have)
admin = Admin(app, name='WAVE AI Admin')
admin.add_view(MetricsView(name='Dashboard', endpoint='metrics'))

# Admin JSON endpoints (protected)
@app.route('/admin/metrics/summary')
@auth.login_required
def admin_summary():
    # debug prints (optional) - remove in production
    print("[DEBUG] admin_summary() called")
    import sys
    sys.stdout.flush()

    try:
        total_users = db_query("SELECT COUNT(DISTINCT user_id) as cnt FROM ideas WHERE user_id IS NOT NULL")[0]['cnt'] or 0
        print("[DEBUG] total_users done")
    except Exception as e:
        print("[DEBUG] total_users error:", e)
        total_users = 0

    try:
        total_ideas = db_query("SELECT COUNT(*) as cnt FROM ideas")[0]['cnt'] or 0
        print("[DEBUG] total_ideas done")
    except Exception as e:
        print("[DEBUG] total_ideas error:", e)
        total_ideas = 0

    try:
        # avg_score - use COALESCE to return 0 instead of NULL
        avg_row = db_query("SELECT COALESCE(AVG(composite_score), 0) as avg_score FROM ideas")
        avg_score = avg_row[0]['avg_score'] if avg_row and 'avg_score' in avg_row[0] else 0
        print("[DEBUG] avg_score done")
    except Exception as e:
        print("[DEBUG] avg_score error:", e)
        avg_score = 0

    try:
        sites_generated = db_query("SELECT COUNT(*) as cnt FROM website_generations")[0]['cnt'] or 0
        print("[DEBUG] sites_generated done")
    except Exception as e:
        print("[DEBUG] sites_generated error:", e)
        sites_generated = 0

    try:
        api_failures = db_query("SELECT COUNT(*) as cnt FROM api_calls WHERE success=0")[0]['cnt'] or 0
        print("[DEBUG] api_failures done")
    except Exception as e:
        print("[DEBUG] api_failures error:", e)
        api_failures = 0

    try:
        total_chats = db_query("SELECT COUNT(*) as cnt FROM chat_logs")[0]['cnt'] or 0
        print("[DEBUG] total_chats done")
    except Exception as e:
        print("[DEBUG] total_chats error:", e)
        total_chats = 0

    try:
        avg_chat_row = db_query("SELECT COALESCE(AVG(chat_duration_ms), 0) as avg_chat_ms FROM chat_logs")
        avg_chat_duration = int(avg_chat_row[0]['avg_chat_ms']) if avg_chat_row and 'avg_chat_ms' in avg_chat_row[0] else 0
        print("[DEBUG] avg_chat_duration done")
    except Exception as e:
        print("[DEBUG] avg_chat_duration error:", e)
        avg_chat_duration = 0

    try:
        total_api_calls = db_query("SELECT COUNT(*) as cnt FROM api_calls")[0]['cnt'] or 0
        print("[DEBUG] total_api_calls done")
    except Exception as e:
        print("[DEBUG] total_api_calls error:", e)
        total_api_calls = 0

    try:
        total_mutations = db_query("SELECT COUNT(*) as cnt FROM idea_mutations")[0]['cnt'] or 0
        print("[DEBUG] total_mutations done")
    except Exception as e:
        print("[DEBUG] total_mutations error:", e)
        total_mutations = 0

    top_llm = None
    try:
        r = db_query("SELECT llm_model, count FROM llm_usage ORDER BY count DESC LIMIT 1")
        if r:
            top_llm = {'model': r[0]['llm_model'], 'count': r[0]['count']}
    except Exception:
        top_llm = None

    print("[DEBUG] admin_summary finished all DB calls")
    sys.stdout.flush()

    return jsonify({
        'total_users': total_users,
        'total_ideas': total_ideas,
        'avg_score': avg_score,
        'sites_generated': sites_generated,
        'api_failures': api_failures,
        'total_chats': total_chats,
        'avg_chat_duration_ms': avg_chat_duration,
        'total_api_calls': total_api_calls,
        'total_mutations': total_mutations,
        'top_llm': top_llm
    })

@app.route('/admin/ideas')
@auth.login_required
def admin_ideas():
    rows = db_query("SELECT * FROM ideas ORDER BY created_at DESC LIMIT 200")
    return jsonify(rows)

print("[admin] Admin views and routes registered")


@app.route("/api/market-signal", methods=["GET"])
def market_signal():
    idea = request.args.get("idea", "").strip()
    top = int(request.args.get("top", 10))

    print("\n--- /api/market-signal called ---")
    print("Idea:", idea)
    print("Top:", top)

    if not idea:
        print("Error: Missing 'idea' param")
        return jsonify({"status": "error", "error": "missing 'idea' param"}), 400

    resp = get_validated_ideas(
        keyword=idea,
        top=top,
        prefer_server_filter=True
    )

    print("Denodo Response Status:", resp.get("status"))
    print("Rows Returned:", len(resp.get("data", [])))

    if resp.get("status") != "ok":
        print("Error:", resp.get("error"))
        return jsonify(resp), 500

    print("--- END /api/market-signal ---\n")
    return jsonify(resp)

from flask import send_file, make_response
import io, json

@app.route("/api/market-signal/summary", methods=["GET"])
def market_signal_summary():
    idea = request.args.get("idea", "").strip()
    top = int(request.args.get("top", 5))
    if not idea:
        return jsonify({"status":"error","error":"missing 'idea' param"}), 400

    resp = get_validated_ideas(keyword=idea, top=top, prefer_server_filter=True)
    if resp.get("status") != "ok":
        return jsonify(resp), 500

    # Build compact summary rows with only fields useful for LLM grounding
    compact = []
    for item in resp["data"][:top]:
        compact.append({
            "title": item.get("name_github") or item.get("title") or item.get("repo_name"),
            "description": item.get("description_github") or item.get("repo_description") or item.get("description"),
            "trend_momentum": item.get("_computed", {}).get("trend_momentum"),
            "stars": item.get("_computed", {}).get("stars"),
            "forks": item.get("_computed", {}).get("forks"),
            "reddit_engagement": item.get("_computed", {}).get("reddit_ups",0) + item.get("_computed", {}).get("reddit_comments",0),
            "composite_validation_score": item.get("composite_validation_score")
        })

    return jsonify({"status":"ok", "data": compact, "meta": resp.get("meta",{})})

from ai_sdk_tool import get_market_signal_tool


@app.route('/admin/denodo/sample', methods=['GET'])
def denodo_sample():
    try:
        # allow passing keyword via query param, default 'ai'
        keyword = request.args.get('q', 'ai')
        res = get_market_signal_tool(
            keyword,
            denodo_view_url=os.getenv('DENODO_DEFAULT_VIEW_URL'),
            require_grounding=False
        )
        if not res.get("success"):
            return jsonify(res), 500

        # Return trimmed_result + sample_row + meta + citation
        response = {
            "success": True,
            "keyword": keyword,
            "citation": res.get("citation"),
            "explanation": res.get("explanation"),
            "meta": res.get("meta"),
            "sample_row": res.get("sample_row"),
            "field_names": res.get("field_names"),
            "rows": res.get("trimmed_result")  # UI-friendly list
        }
        return jsonify(response)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    print("🚀 Starting WAVE AI Idea Chatbot Backend...")
    print("📊 Loading datasets...")

    # Load datasets on startup
    load_datasets()

    print("\n==========================================")
    print("📡 Server will be available at: http://localhost:5000")
    print("==========================================")
    print("🔗 API Endpoints:")
    print("   - POST /api/analyze-idea         → Analyze an idea with live data")
    print("   - POST /api/chat                 → Chat for life guidance and WAVE AI info")
    print("   - POST /api/rethink-idea         → Generate rethought versions of ideas")
    print("   - POST /api/generate-website     → Generate website previews (not saved to disk)")
    print("   - GET  /api/ideas                → Get stored ideas")
    print("   - GET  /api/datasets             → Get dataset information")
    print("   - GET  /api/health               → Health check")
    print("   - GET  /admin/metrics/summary    → JSON admin metrics summary (requires auth)")
    print("   - GET  /admin                    → Interactive Admin Dashboard UI")
    print("------------------------------------------")
    print("🤖 AI Integrations:")
    print("   • Gemini API")
    print("   • Perplexity AI API")
    print("   • RAG-based internal knowledge responses")
    print("   • Denodo Data Virtualization Integration ✅")
    print("------------------------------------------")
    print("🧩 Data Integrations:")
    print("   • Denodo Connected — Real-time access to enterprise datasets")
    print("   • Live analytics across finance, tech, and mental health data")
    print("------------------------------------------")
    print("📈 Analytics Tracked:")
    print("   • Ideas, Mutations, Websites, Chats, API Calls")
    print("   • Admin Dashboard now live ✅")
    print("   • Metrics auto-refresh every few seconds in dashboard view")
    print("------------------------------------------")
    print("🗄️ Database: wave_admin.db (SQLite)")
    print("   • Tables: ideas, idea_mutations, website_generations, chat_logs, api_calls, llm_usage")
    print("------------------------------------------")
    print("✅ Initialization complete — WAVE AI backend is fully operational.\n")

    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
