# Wave AI — Documentation

Wave AI is a platform for AI-powered idea validation and high-speed website code generation. This document describes the architecture, setup, environment configuration, key components, API endpoints, integration between applications, and operational guidance.

## Overview
- End-to-end workflow from idea validation to production-ready code.
- Frontend app (React + TypeScript) with chat, projects, and profiles.
- Separate WaveCodeGen app for high-speed, AI-driven code generation.
- Python Flask backend providing validation, analysis, and code generation APIs.

## Architecture
- Frontend (`project/`): main Wave app UI and flows.
- WaveCodeGen (`project/WaveCodeGen/`): Vite app for code generation.
- Backend (`backend/`): Flask app with endpoints and model integrations.
- Data (`Data/`): curated datasets used in validation and analysis.
- Memory (`project/memory/`): local utilities for session/state.

## Key Components
- `project/src/App.tsx`: main UI and navigation.
- `project/src/Chat.tsx`: chat interface and assistant.
- `project/src/Projects.tsx`: project management and history.
- `project/src/Profile.tsx`: profile details and persistence.
- `project/src/firebase/`: Firebase config, auth, Firestore operations.
- `project/WaveCodeGen/`: code generation UI, services, and build assets.
- `backend/app.py`: validation pipeline, data loaders, analytics, and app configuration.
- `backend/codegen_api.py`: AI endpoints for prompt enhancement, analysis, and generation.

## AI Implementation
- Models: Groq (llama-3.3-70b), Google Gemini, optional Perplexity/DeepSeek.
- Prompt enhancement: prompt refinement for better generation.
- Tech stack detection: analyzes requirements and suggests stack/components.
- Code generation: returns a complete file map and setup instructions.
- Analysis suite: code explanation, suggestions, auto-fix, tests, docs, API stubs.
- Smart selection and fallback: chooses model by task and provides fallbacks.

## Idea Validation and Data
- Uses curated datasets (`Data/`) for market and domain signals.
- Trend and news signals via Google Trends, Reddit, and News API (if configured).
- Semantic analysis with SentenceTransformer for keyword extraction and similarity.
- Produces validation metrics and structured insights to guide build decisions.

## Setup
- Prerequisites: Node.js 18+, Python 3.9+, Git.
- Backend:
  - `cd backend && pip install -r requirements.txt`
  - Create `backend/.env` with `GROQ_API_KEY`, `GEMINI_API_KEY`, `NEWS_API_KEY`, `GITHUB_TOKEN`, and any optional keys.
  - Run `python app.py` (default `http://localhost:5000`).
- Frontend:
  - `cd project && npm install && npm run dev` (Vite selects an available port; commonly 5173).
- WaveCodeGen:
  - `cd project/WaveCodeGen && npm install && npm run dev` (runs on a separate Vite port).

## Environment Configuration
- Backend `.env` (examples):
  - `GROQ_API_KEY=...`
  - `GEMINI_API_KEY=...`
  - `GEMINI_API_KEY_2=...`
  - `PERPLEXITY_API_KEY=...`
  - `NEWS_API_KEY=...`
  - `GITHUB_TOKEN=...`
- Frontend `.env` (examples):
  - `VITE_API_URL=http://localhost:5000`
  - `VITE_FIREBASE_API_KEY=...`
  - `VITE_FIREBASE_AUTH_DOMAIN=...`
  - `VITE_FIREBASE_PROJECT_ID=...`
  - `VITE_FIREBASE_STORAGE_BUCKET=...`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID=...`
  - `VITE_FIREBASE_APP_ID=...`
- Firebase:
  - Enable Authentication (Email/Password and Google) and Firestore.
  - Configure in `project/src/firebase/config.ts` and `project/src/firebase/db.ts`.

## Core Flows
- Idea validation: enter idea, backend analysis, view scores and insights.
- Site build and code generation: configure stack and pages, refine prompt, open WaveCodeGen to generate code.
- Projects and history: save ideas, convert to projects, track sessions via Firestore.

## Backend Endpoints
- Code generation APIs (`backend/codegen_api.py`):
  - `POST /api/codegen/enhance-prompt`: Refines user prompt for better code generation
  - `POST /api/codegen/detect-tech-stack`: Analyzes requirements and suggests optimal technology stack
  - `POST /api/codegen/generate-code`: Generates complete codebase with file structure
  - `POST /api/codegen/analyze-code`: Performs quality analysis on provided code
  - `POST /api/codegen/ai-suggestions`: Provides improvement suggestions for code
  - `POST /api/codegen/auto-fix`: Automatically fixes common code issues
  - `POST /api/codegen/generate-docs`: Creates API documentation and inline comments
  - `POST /api/codegen/explain-code`: Generates human-readable explanations of code
  - `POST /api/codegen/generate-tests`: Creates unit and integration test cases
  - `POST /api/codegen/convert-language`: Transpiles code between programming languages
  - `POST /api/codegen/generate-api`: Generates API endpoint specifications and stubs
  - `GET  /api/codegen/user-stats`: Retrieves user's generation statistics and credits
  - `GET  /api/codegen/project-history`: Fetches user's previous generations and projects
- Validation and analysis (`backend/app.py`):
  - `POST /api/analyze-idea`: Comprehensive idea analysis with market, tech, and competition scoring
  - `POST /api/validate-idea`: Quick validation of idea viability and feasibility
  - `POST /api/quick-validate`: Lightweight validation for rapid feedback
  - `POST /api/analyze-competition`: Analyzes market competition and similar products
  - `POST /api/analyze-market`: Evaluates market trends, size, and opportunity
  - `POST /api/analyze-tech`: Assesses technical feasibility and stack recommendations
  - `POST /api/chat`: Conversational AI endpoint for interactive guidance
  - `GET  /api/health`: Health check endpoint for service availability
  - `GET  /api/ideas`: Retrieves list of ideas from database
  - `GET  /api/datasets`: Lists available curated datasets for validation
  - `POST /api/generate-website`: Initiates website generation workflow
  - `GET  /api/download-website/:id`: Downloads generated website as compressed archive

## Deployment
- Frontend: `npm run build` then deploy to Vercel, Netlify, or similar.
- WaveCodeGen: `npm run build` then deploy to Cloudflare Pages, Vercel, or similar.
- Backend: deploy on any Flask-capable host with environment keys set.

## Database Layer

### Firestore Collections
Wave AI uses Firebase Firestore as the primary real-time database with the following structure:

- **USERS**: Stores user profile data
  - uid, name, email, photoURL, loginMethod, createdAt, lastLogin
  - Automatically synced across devices via Firebase Auth
  
- **CHAT_HISTORY**: Maintains conversation logs
  - Contains user queries, assistant responses, timestamps, and model information
  - Enables chat history retrieval and context preservation
  
- **GRAVEYARD**: Stores abandoned ideas for later resurrection
  - idea_text, category, failure_reason, emotional_metadata, created_at
  - Allows users to organize and revisit failed projects
  
- **PROJECTS**: Tracks active and completed projects
  - project_name, description, status, tech_stack, created_at, updated_at
  - Links to generated code and deployment information

### SQLite Backend Analytics Database
Located at `backend/wave_admin.db`, the SQLite database maintains analytics and audit logs:

- **ideas**: Core idea records with analysis scores
  - Fields: id, idea_text, user_id, autopsy_failure_reason, autopsy_emotional_state, market_potential, technical_risk, competition_score, composite_score, external_data, created_at
  
- **idea_mutations**: Tracks idea variations and resurrections
  - Fields: id, idea_id, mutation_text, mutation_timestamp, mutation_viability_score, mutation_meta
  - Enables A/B testing and iteration tracking
  
- **website_generations**: Records of generated websites
  - Fields: id, idea_id, website_id, files_path, business_model, branding, created_at
  - Stores file locations and configuration metadata
  
- **api_calls**: API performance and reliability metrics
  - Fields: id, endpoint, method, status_code, latency_ms, success, error, created_at, request_meta
  - Used for monitoring, debugging, and optimization
  
- **chat_logs**: Conversation history for analysis
  - Fields: id, user_id, session_id, question, answer, llm_model, chat_duration_ms, created_at
  - Tracks which AI models handled each query
  
- **llm_usage**: Aggregated metrics on model usage
  - Fields: id, llm_model, count
  - Helps optimize model selection and cost tracking

## Data Validation Pipeline

The backend implements a multi-stage validation pipeline:

1. **Market Analysis**: Uses Google Trends, Reddit data via PRAW, and News API to assess market demand
2. **Competition Scoring**: Leverages GitHub API to identify similar projects and assess competitive landscape
3. **Technical Risk Assessment**: Analyzes required tech stack and identifies potential implementation challenges
4. **Semantic Analysis**: SentenceTransformer embeddings for keyword extraction and similarity matching
5. **Composite Scoring**: Combines all signals into a unified 0-100 viability score

The pipeline operates through:
- `pytrends.TrendReq`: Queries Google Trends data
- `praw`: Reddit data collection for trend signals
- External News API: Market sentiment analysis
- `scikit-learn TfidfVectorizer`: Text analysis and matching
- `sentence-transformers`: Semantic embeddings for deep analysis

## Frontend Services and Utilities

### Service Modules (`project/src/services/`)

- **smartChatbot.ts**: OpenRouter-powered conversational AI service
  - Provides context-aware responses using meta-llama/llama-3.1-70b-instruct
  - Includes Wave AI knowledge base and feature descriptions
  - Manages conversation history and context preservation
  
- **streamingService.ts**: Handles server-sent events (SSE) streaming
  - Enables real-time code generation feedback
  - Provides progress updates during long-running operations
  - Implements automatic reconnection and error recovery
  
- **enhancedSupportBot.ts**: Advanced support and guidance system
  - Provides context-sensitive help within the application
  - Routes queries to appropriate knowledge base entries
  - Tracks common issues and suggests solutions
  
- **userDataService.ts**: User profile and preferences management
  - Manages user data persistence across sessions
  - Handles profile updates and synchronization
  - Integrates with Firebase for real-time sync
  
- **profileService.ts**: User profile operations
  - Retrieves and caches user profile information
  - Updates user preferences and settings
  - Manages authentication state

### Firebase Integration (`project/src/firebase/`)

- **config.ts**: Firebase project configuration
  - Initializes Firebase SDK with project credentials
  - Sets up API keys and authentication domain
  
- **auth.ts**: Authentication utilities
  - Email/password authentication
  - Google OAuth integration
  - Session management and logout handling
  
- **db.ts**: Firestore database operations
  - CRUD operations for all collections
  - Real-time listeners and subscriptions
  - Transaction management for consistency
  
- **types.ts**: TypeScript type definitions
  - Defines User, ChatMessage, GraveyardIdea, Project interfaces
  - Ensures type safety across frontend components
  
- **hooks.ts**: React hooks for Firebase integration
  - useAuth: Authentication state and user data
  - useDatabase: Firestore operations
  - Custom hooks for common operations
  
- **utils.ts**: Helper functions
  - Data transformation utilities
  - Timestamp conversion and formatting
  - Error handling and logging

### Component Architecture (`project/src/components/`)

- **ProtectedRoute.tsx**: Route guard for authenticated pages
  - Redirects unauthenticated users to login
  - Maintains session state across navigation
  
- **SupportBot.tsx**: Integrated support chat widget
  - Contextual help based on current page
  - Collapsible interface that doesn't obstruct main content
  - Search functionality across help topics
  
- **FirebaseTest.tsx**: Development utility for database testing
  - Validates Firestore connection
  - Tests CRUD operations
  - Helps diagnose Firebase configuration issues

## Denodo Backend Features

### Denodo Adapter (`backend/denodo_adapter.py`)
Integrates with Denodo data virtualization platform for market signals:
- Server-side OData filtering with fallback to client-side processing
- Redis caching for performance optimization
- Configurable TTL for cache invalidation
- Handles connection failures gracefully with retry logic

### AI SDK Integration (`backend/ai_sdk_tool.py`)
Manages LLM orchestration and fallback logic:
- Primary model: Groq (llama-3.3-70b) for ultra-fast responses
- Secondary models: Google Gemini for complex tasks
- Tertiary options: Perplexity and DeepSeek for specialized use cases
- Automatic fallback when primary model fails or rate-limits
- Request caching to reduce API calls and costs

### Code Generation Service (`backend/tables.py`)
Handles table schema generation and database design:
- Parses user requirements for data models
- Generates SQL/ORM table definitions
- Optimizes schema for performance
- Includes indexing recommendations

## Troubleshooting
- Ensure only one Firebase initialization (use `project/src/firebase/config.ts`).
- Verify `.env` keys exist for backend and frontend.
- If ports collide, Vite auto-increments; check terminal output.
- Clear browser cache when switching environments.
- Use browser console and backend logs for diagnostics.
- For Firestore connection issues, run `FirebaseTest.tsx` component to validate setup.
- Check SQLite database integrity: `sqlite3 backend/wave_admin.db ".schema"`.
- Monitor API call latencies in `api_calls` table to identify slow endpoints.
- Validate LLM API keys are not expired and have sufficient quota remaining.

## Security
- Do not commit real API keys to the repository.
- Store secrets in `.env` files and environment variables.
- Rotate keys and restrict usage in provider consoles.
- Remove any hardcoded keys from the codebase and replace with environment variables.
- Firestore security rules enforce user-scoped data access (see `project/firestore.rules`).
- Firebase Auth ensures proper session management and token validation.
- Backend validates all requests and sanitizes inputs to prevent injection attacks.

## Data Sources and Datasets

The `Data/` directory contains curated datasets used for idea validation and market analysis:

- **Tech.json**: Technology trends and stack popularity metrics
- **Financial.json**: Economic indicators and market sizing data
- **GK.json**: General knowledge base for competitive analysis
- **Movies.json**: Entertainment sector trends and data
- **mental_health.json**: Mental wellness and health tech trends
- **esg_data.json**: Environmental, Social, and Governance metrics
- **deliveriess.json**: Logistics and delivery market signals
- **denodo_data.py**: Script for enriching data with Denodo source integration

These datasets are loaded into the validation pipeline to provide contextual market insights.

## Advanced Features

### Rate Limiting and Credit System
The code generation API implements a credit-based rate limiting system:
- Free users: 2 prompts per month
- Rate limit window: 60 seconds
- Maximum requests per window: 10
- Credits are tracked per user and stored in-memory (upgradeable to database persistence)

### Streaming and Real-Time Updates
Code generation operations support server-sent events for real-time progress:
- Frontend establishes persistent connection to backend
- Backend streams partial results as generation progresses
- Automatic reconnection on connection loss
- User sees incremental code output instead of waiting for complete generation

### Multi-Model LLM Orchestration
Intelligent model selection based on task type:
- **Fast responses**: Groq (ultra-low latency, good for summaries)
- **Complex analysis**: Gemini (superior reasoning, better for design decisions)
- **Specialized tasks**: Perplexity (web browsing capability), DeepSeek (code-focused)
- Automatic fallback if primary model fails or hits rate limits
- Cost optimization through model selection based on complexity

## Status and Version
- Fully operational when backend and both frontends are running.
- Version: 1.0.0
- Last Updated: November 2025

## Development Workflow

### Local Development Setup

1. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   touch .env
   # Add API keys to .env
   python app.py
   ```

2. **Frontend Setup**:
   ```bash
   cd project
   npm install
   npm run dev
   ```

3. **WaveCodeGen Setup**:
   ```bash
   cd project/WaveCodeGen
   npm install
   npm run dev
   ```

### Environment Variables Reference

Backend `.env`:
```
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY_2=your_gemini_key_2
PERPLEXITY_API_KEY=your_perplexity_key
DEEPSEEK_API_KEY=your_deepseek_key
NEWS_API_KEY=your_news_api_key
GITHUB_TOKEN=your_github_token
DENODO_BASE_URL=http://localhost:9090
DENODO_USER=admin
DENODO_PASS=admin
REDIS_URL=redis://localhost:6379
DENODO_CACHE_TTL_SECONDS=1200
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Testing and Validation

- **Backend Testing**: Use provided Python test scripts (`inspect_sample.py`, test endpoints with curl/Postman)
- **Frontend Testing**: Check browser console for errors, use React DevTools
- **Firebase Testing**: Use `FirebaseTest.tsx` component to validate Firestore connection
- **Database Testing**: Query SQLite directly for analytics (`sqlite3 backend/wave_admin.db`)
- **API Testing**: Integration test file available at `project/test-integration.html`

### Monitoring and Debugging

Monitor backend performance through SQLite tables:
```sql
-- Check API performance
SELECT endpoint, AVG(latency_ms) as avg_latency, COUNT(*) as calls 
FROM api_calls GROUP BY endpoint;

-- Track LLM model usage
SELECT * FROM llm_usage;

-- Review error logs
SELECT * FROM api_calls WHERE success = 0;

-- Analyze chat performance
SELECT llm_model, AVG(chat_duration_ms) as avg_duration 
FROM chat_logs GROUP BY llm_model;
```

## Architecture Patterns

### Request Flow: Idea Validation
1. User submits idea in Wave App frontend
2. Frontend sends to `POST /api/validate-idea`
3. Backend initializes Firestore session for user
4. Validation pipeline processes: market + tech + competition analysis
5. SentenceTransformer generates embeddings for semantic matching
6. Results aggregated into composite score
7. Response cached in SQLite for analytics
8. Frontend displays results with actionable recommendations

### Request Flow: Code Generation
1. User configures requirements in Site Builder
2. Click generates in WaveCodeGen with query parameters
3. `POST /api/codegen/enhance-prompt` refines user prompt
4. `POST /api/codegen/detect-tech-stack` recommends optimal stack
5. `POST /api/codegen/generate-code` creates complete codebase
6. Multiple AI models may be called in sequence for different aspects
7. Results streamed back via SSE for real-time feedback
8. Generated files stored and indexed for history
9. User can download complete project archive

## Performance Considerations

- **Groq API**: Preferred for initial prompt enhancement (50-100ms latency)
- **Deepseek + Perplexity API**: Used for complex analysis requiring detailed reasoning
- **Caching**: Redis integration for Denodo responses reduces external calls
- **Firestore**: Real-time sync adds 200-500ms latency for initial load
- **Code Generation**: Full website generation typically 5-30 seconds depending on scope
- **Streaming**: SSE reduces perceived latency for long operations

## Scalability

- **Horizontal**: Backend stateless, can run multiple instances behind load balancer
- **Caching**: Implement Redis for session storage and query result caching
- **Database**: Firestore auto-scales; consider sharding SQLite analytics database at scale
- **Frontend**: Static assets served via CDN, minimal server-side processing required
- **API Gateway**: Add rate limiting at infrastructure level for production

## Summary
- Single cohesive platform from idea to code.
- Architecture: React + TypeScript + Flask.
- AI suite: prompt, generation, analysis, and fallback.
- Firebase-backed user data and project flows.

## Configuration and Customization

### Frontend Customization

**Tailwind Configuration** (`project/tailwind.config.js`):
- Customize color schemes, spacing, and typography
- Add custom components and utilities
- Configure dark mode preferences

**Vite Configuration** (`project/vite.config.ts`):
- Define build optimization settings
- Configure API proxy for development
- Set up environment-specific overrides

**TypeScript Configuration** (`project/tsconfig.json`):
- Control type checking strictness
- Define path aliases for imports
- Configure module resolution

**ESLint Configuration** (`project/eslint.config.js`):
- Code style and quality rules
- Enforce React hooks best practices
- Configure import sorting

### Backend Customization

**Model Selection**: Edit `codegen_api.py` to change primary/secondary LLM models

**Rate Limiting**: Modify constants in `codegen_api.py`:
```python
MAX_FREE_PROMPTS = 2
RATE_LIMIT_WINDOW = 60
MAX_REQUESTS_PER_WINDOW = 10
```

**Data Sources**: Add new dataset files to `Data/` directory and load in validation pipeline

**Analysis Weights**: Adjust scoring in `app.py` validation functions:
```python
market_weight = 0.4
tech_weight = 0.3
competition_weight = 0.3
```

### Firebase Configuration

Edit `project/src/firebase/config.ts` to point to different Firebase project:
```typescript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Update Firestore security rules in `project/firestore.rules` to customize access control.

## Glossary

- **Idea Graveyard**: Collection of abandoned or failed project ideas stored by users
- **Composite Score**: Aggregate 0-100 rating combining market, technical, and competitive signals
- **Viability Score**: Likelihood of project success based on multiple analysis dimensions
- **Mutation**: Alternative version of an idea generated through AI analysis and transformation
- **SSE (Server-Sent Events)**: Server-to-client streaming for real-time progress updates
- **Firestore**: Google Cloud NoSQL database with real-time synchronization
- **Embedding**: Semantic vector representation of text for similarity matching
- **TF-IDF**: Term frequency-inverse document frequency algorithm for text analysis
- **Redis**: In-memory cache for storing frequently accessed data
- **OData**: Open Data Protocol for server-side filtering and querying
- **CORS**: Cross-Origin Resource Sharing for browser security
- **Firebase Auth**: Authentication service supporting email/password and OAuth
- **Cloud Run**: Google Cloud serverless compute platform for backend deployment
- **CDN**: Content Delivery Network for fast global asset distribution
- **Rate Limiting**: Restricting number of API requests within time window
- **Fallback Model**: Alternative LLM used when primary model is unavailable

## Maintenance

### Regular Tasks
- Monitor API quota usage and renew keys before expiration
- Review `api_calls` table for error spikes and performance degradation
- Clear old entries from SQLite database (consider archival strategy)
- Test all external integrations monthly (Google Trends, Reddit, News API)
- Validate Firestore rules are functioning correctly
- Check backend logs for memory leaks or resource exhaustion

### Dependency Updates
```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt

# Frontend
cd project
npm update

# WaveCodeGen
cd project/WaveCodeGen
npm update
```

### Backup Strategy
- Firestore: Enable automated backups in Google Cloud Console
- SQLite: Export analytics database weekly for archival
- Source code: Push changes to Git repository regularly
- Generated files: Implement retention policy and archive old generations

## Site Builder Configuration
1. Navigate to Site Builder.
2. Choose a tech stack (Vanilla JS, React, or Next.js).
3. Select pages (Home, About, Features, Contact).
4. Customize content for each page.
5. Configure design settings.

## Generate Website
1. Click "Generate Website".
2. WaveCodeGen opens in a new tab with your refined prompt.
3. Review generated code and preview.
4. Edit and deploy your website.

Everything runs as a cohesive application.

---

## Features

### Wave App
- AI-powered idea validation.
- Real-time market analysis.
- Competition research.
- Technical feasibility assessment.
- Step-by-step site builder.
- Integration with WaveCodeGen.

### WaveCodeGen
- Code generation and preview.
- Code quality analysis.
- AI suggestions and auto-fix.
- Test and documentation generation.
- Language conversion and performance optimization.

---

## Technical Stack

### Backend
- Python Flask.
- Groq API (llama-3.3-70b-versatile).
- Google Gemini API.
- DeepSeek API.
- Perplexity API.
- Data Trained modules

### Wave App Frontend
- React + TypeScript.
- Vite.
- Tailwind CSS.
- Framer Motion.

### WaveCodeGen
- React + TypeScript.
- Vite.
- Auxiliary services for generation and analysis.

---

## Wave App to WaveCodeGen Integration

### How It Works

1. Refine the idea in Wave App.
2. Configure the website in Site Builder.
3. Click "Generate Website" to open WaveCodeGen in a new tab.
4. Pass prompt and configuration via query parameters.
5. Generate and preview code.

### Technical Implementation

Wave App (`project/src/waveWebGenIntegration.ts`):
```typescript
openWaveWebGen({ prompt, idea, techStack: 'React', mode: 'new' });
```
The integration opens WaveCodeGen at `http://localhost:5173` and supports query parameters for `prompt`, `idea`, `techStack`, and `mode`.

---

## Competitive Positioning
External comparisons and performance claims should be validated before publication. Focus on technical accuracy and reproducibility.

---

## Project Structure

```
Wave app/
├── backend/                 # Flask API
│   └── app.py               # Main backend application
├── project/                 # Wave App Frontend
│   ├── src/                 # React + TypeScript sources
│   │   ├── App.tsx
│   │   ├── Chat.tsx
│   │   ├── Projects.tsx
│   │   ├── Profile.tsx
│   │   └── waveWebGenIntegration.ts
│   └── WaveCodeGen/         # Code generation UI (Vite)
│       ├── components/
│       ├── services/
│       ├── src/
│       └── package.json
└── README.md
```

---

## Usage Examples

### Example 1: E-commerce Website

Wave App:
1. Enter idea: "Online store for handmade jewelry".
2. Validate the idea and review insights.
3. Configure stack: React; pages: Home, Features, Contact.
4. Click "Generate Website".

WaveCodeGen:
- Opens automatically.
- Generates a complete e-commerce scaffold with product grid and checkout placeholders.
- Preview and refine before deployment.

### Example 2: SaaS Landing Page

Wave App:
1. Enter idea: "AI-powered email marketing tool".
2. Validate and review insights.
3. Configure stack: React or Next.js; pages: Home, About, Features.
4. Click "Generate Website".

WaveCodeGen:
- Opens automatically.
- Generates a modern landing page scaffold.
- Preview and refine before deployment.

---

## Troubleshooting Guide

### WaveCodeGen does not open
- Check if port `5173` is available.
- Allow popups in the browser.
- Ensure WaveCodeGen is running (`npm run dev`).

### Prompt not loading
- Confirm query parameters are passed using `waveWebGenIntegration.ts`.
- Check browser console for errors.

### Dependencies not found
```
cd "project/WaveCodeGen"
npm install
```

---

## API Keys

Do not publish or commit real keys. Use environment variables and secured storage. Example placeholders:
- `GROQ_API_KEY=your-groq-key`
- `GEMINI_API_KEY=your-gemini-key`
- `NEWS_API_KEY=your-newsapi-key`

---

## Performance Metrics
Operational metrics vary by environment and configuration. Benchmark in your deployment context and document measured results.

---

## Best Practices

### To Improve Results
1. Be specific in idea descriptions.
2. Refine in Site Builder before generating.
3. Test on multiple devices.
4. Review generated code before deploying.

### Prompt Tips
- Include target audience.
- Specify key features.
- Mention tech preferences.
- Add design requirements.
- Note constraints.

---

## Deployment Commands

### Wave App
```
cd project
npm run build
```

### WaveCodeGen
```
cd "project/WaveCodeGen"
npm run build
```

---

## Support

For issues or questions:
1. Review this README.
2. Check browser console.
3. Verify API key configuration.
4. Confirm all services are running.

---

## Summary

Wave AI provides:
- Complete idea-to-website workflow.
- Integration between components.
- Fast AI-assisted code generation.
- Professional, production-ready output.

---

## Version

Current Version: 2.5.1
Last Updated: November 2025
Status: Production Ready

---

Built by the Wave AI: The Idea Graveyard Team.


## Denodo Integration (University Challenge)

This project integrates Denodo as a unified semantic layer for real‑world market signal aggregation and API virtualization.  
Below is the complete workflow implemented inside Denodo:

### 🔹 Work Done in Denodo

1. **Created Base Views for All Datasets and APIs**  
   - Loaded multiple datasets into Denodo and created base views.  
   - Imported external REST APIs (GitHub API, News API, Reddit API) and exposed them as Denodo base views.

2. **Published All Dataset Views Into the Project**  
   - All curated datasets (cricket, financial, gk, tech, movies, etc.) were published into the project folder.  
   - Ensured consistent naming and structure for clean semantic management.

3. **Flattened API Views**  
   - All API response structures (JSON) were flattened using Denodo's `JSONTABLE`, `FLATTEN`, and field extractions.  
   - This made downstream processing significantly cleaner.

4. **Auth Configuration for All API Keys**  
   - Configured Authorization parameters for:  
     - GitHub API  
     - News API  
     - Reddit API  
   - Keys were applied via Denodo’s **Data Source > Authentication > Custom Policies**.

5. **Joined and Combined API Views**  
   - Built a unified “market signals” perspective by joining GitHub, News, and Reddit API outputs.  
   - Used Denodo join conditions + projections to merge all signals into a cohesive model.

6. **Flattened Final Combined View**  
   - Once combined, the final view was flattened to ensure it was directly consumable by the backend AI pipeline.

7. **Published Final Semantic ViewBase**  
   - Published the final view (`final_market_signals`) into the project’s semantic layer.  
   - This view is now used by the backend for enriched market analysis.

8. **Added Custom Endpoints for API‑Fetch Diagnostics**  
   - Created additional views to provide metadata:  
     - API fetch status  
     - Response timestamps  
     - Rate‑limit warnings  
     - Signal completeness levels  

### 🔹 Visual References  
Screenshots attached above show:
- Dataset views  
- API views  
- Published semantic layer  
- Final flattened views

---

