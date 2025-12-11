"""
Wave AI Code Generator API
Advanced AI-powered code generation with Groq and Gemini
"""

from flask import Blueprint, request, jsonify
import requests
import json
import time
from datetime import datetime, timedelta
import re
import os
from typing import Dict, List, Any, Optional
import hashlib

codegen_bp = Blueprint('codegen', __name__)

# API Keys - Load from environment variables
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GEMINI_API_KEY_1 = os.getenv('GEMINI_API_KEY_1', '')
GEMINI_API_KEY_2 = os.getenv('GEMINI_API_KEY_2', '')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')

# In-memory storage (replace with database in production)
user_credits = {}
user_history = {}
rate_limits = {}

# Constants
MAX_FREE_PROMPTS = 2
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_WINDOW = 10

def check_rate_limit(user_id: str) -> tuple[bool, Optional[str]]:
    """Check if user has exceeded rate limit"""
    current_time = time.time()
    
    if user_id not in rate_limits:
        rate_limits[user_id] = []
    
    # Remove old requests outside the window
    rate_limits[user_id] = [
        req_time for req_time in rate_limits[user_id]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    if len(rate_limits[user_id]) >= MAX_REQUESTS_PER_WINDOW:
        return False, f"Rate limit exceeded. Try again in {RATE_LIMIT_WINDOW} seconds."
    
    rate_limits[user_id].append(current_time)
    return True, None

def get_user_credits(user_id: str) -> int:
    """Get remaining credits for user"""
    if user_id not in user_credits:
        user_credits[user_id] = MAX_FREE_PROMPTS
    return user_credits[user_id]

def use_credit(user_id: str) -> bool:
    """Use one credit, return False if no credits left"""
    credits = get_user_credits(user_id)
    if credits <= 0:
        return False
    user_credits[user_id] = credits - 1
    return True

@codegen_bp.route('/enhance-prompt', methods=['POST'])
def enhance_prompt():
    """Enhance user prompt using Groq for ultra-fast processing"""
    try:
        data = request.json
        user_prompt = data.get('prompt', '')
        user_id = data.get('user_id', 'anonymous')
        
        # Check rate limit
        allowed, error_msg = check_rate_limit(user_id)
        if not allowed:
            return jsonify({'error': error_msg}), 429
        
        # Enhance prompt using Groq
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
                        'content': '''You are an expert prompt engineer for code generation. 
                        Enhance the user's prompt to be more specific, detailed, and actionable.
                        Include:
                        - Specific tech stack requirements
                        - UI/UX considerations
                        - Performance requirements
                        - Accessibility features
                        - Best practices
                        
                        Keep it concise but comprehensive. Output only the enhanced prompt.'''
                    },
                    {
                        'role': 'user',
                        'content': f'Enhance this prompt: {user_prompt}'
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=10
        )
        
        if response.ok:
            enhanced = response.json()['choices'][0]['message']['content']
            return jsonify({
                'original': user_prompt,
                'enhanced': enhanced,
                'success': True
            })
        else:
            return jsonify({'error': 'Failed to enhance prompt', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/detect-tech-stack', methods=['POST'])
def detect_tech_stack():
    """Detect optimal tech stack and estimate complexity"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
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
                        'content': '''Analyze the prompt and return a JSON object with:
                        {
                          "tech_stack": ["React", "TypeScript", "Tailwind CSS", ...],
                          "complexity": "simple|moderate|complex|advanced",
                          "estimated_time": "5-10 minutes",
                          "components_needed": ["Header", "Form", ...],
                          "features": ["Authentication", "API Integration", ...],
                          "recommendations": ["Use React Query for data fetching", ...]
                        }
                        Return ONLY valid JSON, no markdown.'''
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 800
            },
            timeout=10
        )
        
        if response.ok:
            content = response.json()['choices'][0]['message']['content']
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                return jsonify({'analysis': analysis, 'success': True})
        
        return jsonify({'error': 'Failed to analyze tech stack', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/generate-code', methods=['POST'])
def generate_code():
    """Generate website code using Gemini API 1"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        user_id = data.get('user_id', 'anonymous')
        tech_stack = data.get('tech_stack', ['React', 'TypeScript', 'Tailwind CSS'])
        
        # Check credits
        if not use_credit(user_id):
            return jsonify({
                'error': 'No credits remaining. Upgrade to continue.',
                'credits_left': 0,
                'success': False
            }), 402
        
        # Check rate limit
        allowed, error_msg = check_rate_limit(user_id)
        if not allowed:
            return jsonify({'error': error_msg}), 429
        
        # Generate code using Gemini
        tech_stack_str = ', '.join(tech_stack)
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY_1}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{
                        'text': f'''Generate a complete, production-ready web application based on this prompt:
                        
{prompt}

Tech Stack: {tech_stack_str}

Requirements:
1. Generate complete, working code with all imports
2. Include proper TypeScript types
3. Add comprehensive comments
4. Follow best practices and design patterns
5. Make it responsive and accessible
6. Include error handling
7. Add loading states
8. Use modern React patterns (hooks, context)
9. Style with Tailwind CSS
10. Make it beautiful and professional

Return the code in this JSON format:
{{
  "files": [
    {{
      "path": "src/App.tsx",
      "content": "// code here",
      "language": "typescript"
    }},
    {{
      "path": "src/components/Header.tsx",
      "content": "// code here",
      "language": "typescript"
    }}
  ],
  "dependencies": {{
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }},
  "instructions": "Step-by-step setup instructions"
}}

Return ONLY valid JSON, no markdown formatting.'''
                    }]
                }]
            },
            timeout=30
        )
        
        if response.ok:
            content = response.json()['candidates'][0]['content']['parts'][0]['text']
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                code_data = json.loads(json_match.group())
                
                # Save to history
                if user_id not in user_history:
                    user_history[user_id] = []
                
                history_entry = {
                    'id': hashlib.md5(f'{user_id}{time.time()}'.encode()).hexdigest()[:12],
                    'prompt': prompt,
                    'code': code_data,
                    'timestamp': datetime.now().isoformat(),
                    'tech_stack': tech_stack
                }
                user_history[user_id].append(history_entry)
                
                return jsonify({
                    'code': code_data,
                    'credits_left': get_user_credits(user_id),
                    'project_id': history_entry['id'],
                    'success': True
                })
        
        return jsonify({'error': 'Failed to generate code', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/analyze-code', methods=['POST'])
def analyze_code():
    """Analyze code quality with 5 metrics"""
    try:
        data = request.json
        code = data.get('code', '')
        
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
                        'content': '''Analyze the code and return JSON with 5 quality metrics (0-100):
                        {
                          "readability": 85,
                          "performance": 90,
                          "security": 75,
                          "maintainability": 88,
                          "best_practices": 92,
                          "overall_score": 86,
                          "issues": [
                            {"type": "warning", "message": "Consider memoizing this component", "line": 42}
                          ],
                          "suggestions": [
                            "Add error boundaries",
                            "Implement code splitting"
                          ]
                        }
                        Return ONLY valid JSON.'''
                    },
                    {
                        'role': 'user',
                        'content': f'Analyze this code:\n\n{code}'
                    }
                ],
                'temperature': 0.3,
                'max_tokens': 1000
            },
            timeout=15
        )
        
        if response.ok:
            content = response.json()['choices'][0]['message']['content']
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
                return jsonify({'analysis': analysis, 'success': True})
        
        return jsonify({'error': 'Failed to analyze code', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/ai-suggestions', methods=['POST'])
def ai_suggestions():
    """Get 5 types of AI suggestions with priority ranking"""
    try:
        data = request.json
        code = data.get('code', '')
        context = data.get('context', '')
        
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
                        'content': '''Provide 5 types of suggestions with priority (1-5, 1=highest):
                        {
                          "suggestions": [
                            {
                              "type": "performance",
                              "priority": 1,
                              "title": "Optimize re-renders",
                              "description": "Use React.memo to prevent unnecessary re-renders",
                              "code_example": "const MemoizedComponent = React.memo(MyComponent);"
                            },
                            {
                              "type": "security",
                              "priority": 2,
                              "title": "Sanitize user input",
                              "description": "Add input validation to prevent XSS",
                              "code_example": "const sanitized = DOMPurify.sanitize(userInput);"
                            },
                            {
                              "type": "accessibility",
                              "priority": 3,
                              "title": "Add ARIA labels",
                              "description": "Improve screen reader support",
                              "code_example": "<button aria-label='Close modal'>X</button>"
                            },
                            {
                              "type": "best_practice",
                              "priority": 4,
                              "title": "Extract reusable logic",
                              "description": "Create custom hook for this logic",
                              "code_example": "const useCustomHook = () => { ... }"
                            },
                            {
                              "type": "enhancement",
                              "priority": 5,
                              "title": "Add loading states",
                              "description": "Improve UX with loading indicators",
                              "code_example": "{isLoading ? <Spinner /> : <Content />}"
                            }
                          ]
                        }
                        Return ONLY valid JSON.'''
                    },
                    {
                        'role': 'user',
                        'content': f'Context: {context}\n\nCode:\n{code}'
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1500
            },
            timeout=15
        )
        
        if response.ok:
            content = response.json()['choices'][0]['message']['content']
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                suggestions = json.loads(json_match.group())
                return jsonify({'suggestions': suggestions, 'success': True})
        
        return jsonify({'error': 'Failed to get suggestions', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/auto-fix', methods=['POST'])
def auto_fix():
    """Automatically fix code issues"""
    try:
        data = request.json
        code = data.get('code', '')
        issues = data.get('issues', [])
        
        issues_str = '\n'.join([f"- {issue['message']}" for issue in issues])
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY_1}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{
                        'text': f'''Fix these issues in the code:

Issues:
{issues_str}

Original Code:
{code}

Return the fixed code with explanations in JSON format:
{{
  "fixed_code": "// fixed code here",
  "changes": [
    {{"issue": "...", "fix": "...", "explanation": "..."}}
  ]
}}

Return ONLY valid JSON.'''
                    }]
                }]
            },
            timeout=20
        )
        
        if response.ok:
            content = response.json()['candidates'][0]['content']['parts'][0]['text']
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                fix_data = json.loads(json_match.group())
                return jsonify({'fix': fix_data, 'success': True})
        
        return jsonify({'error': 'Failed to fix code', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/generate-docs', methods=['POST'])
def generate_docs():
    """Generate comprehensive documentation"""
    try:
        data = request.json
        code = data.get('code', '')
        
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
                        'content': '''Generate comprehensive documentation in markdown format including:
                        - Overview
                        - Installation steps
                        - Usage examples
                        - API reference
                        - Component documentation
                        - Configuration options
                        - Troubleshooting
                        
                        Make it professional and complete.'''
                    },
                    {
                        'role': 'user',
                        'content': f'Generate documentation for this code:\n\n{code}'
                    }
                ],
                'temperature': 0.5,
                'max_tokens': 2000
            },
            timeout=20
        )
        
        if response.ok:
            docs = response.json()['choices'][0]['message']['content']
            return jsonify({'documentation': docs, 'success': True})
        
        return jsonify({'error': 'Failed to generate documentation', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/explain-code', methods=['POST'])
def explain_code():
    """Explain code in natural language"""
    try:
        data = request.json
        code = data.get('code', '')
        
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
                        'content': '''Explain the code in simple, natural language. Include:
                        - What the code does
                        - How it works
                        - Key concepts used
                        - Potential improvements
                        
                        Make it easy to understand for beginners.'''
                    },
                    {
                        'role': 'user',
                        'content': f'Explain this code:\n\n{code}'
                    }
                ],
                'temperature': 0.7,
                'max_tokens': 1000
            },
            timeout=15
        )
        
        if response.ok:
            explanation = response.json()['choices'][0]['message']['content']
            return jsonify({'explanation': explanation, 'success': True})
        
        return jsonify({'error': 'Failed to explain code', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/generate-tests', methods=['POST'])
def generate_tests():
    """Generate unit tests (Vitest/Jest)"""
    try:
        data = request.json
        code = data.get('code', '')
        framework = data.get('framework', 'vitest')
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY_1}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{
                        'text': f'''Generate comprehensive unit tests using {framework} for this code:

{code}

Include:
- Test for all functions/components
- Edge cases
- Error handling
- Mock data
- Setup and teardown

Return complete, runnable test code.'''
                    }]
                }]
            },
            timeout=20
        )
        
        if response.ok:
            tests = response.json()['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'tests': tests, 'success': True})
        
        return jsonify({'error': 'Failed to generate tests', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/convert-language', methods=['POST'])
def convert_language():
    """Convert between languages (JS↔TS, React↔Vue)"""
    try:
        data = request.json
        code = data.get('code', '')
        from_lang = data.get('from', 'javascript')
        to_lang = data.get('to', 'typescript')
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY_1}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{
                        'text': f'''Convert this code from {from_lang} to {to_lang}:

{code}

Ensure:
- Proper types (if TypeScript)
- Equivalent functionality
- Best practices for target language
- All imports and dependencies

Return only the converted code.'''
                    }]
                }]
            },
            timeout=20
        )
        
        if response.ok:
            converted = response.json()['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'converted_code': converted, 'success': True})
        
        return jsonify({'error': 'Failed to convert code', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/generate-api', methods=['POST'])
def generate_api():
    """Generate API endpoints"""
    try:
        data = request.json
        description = data.get('description', '')
        framework = data.get('framework', 'express')
        
        response = requests.post(
            f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY_1}',
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{
                    'role': 'user',
                    'parts': [{
                        'text': f'''Generate complete API endpoints using {framework} for:

{description}

Include:
- RESTful routes
- Request validation
- Error handling
- Authentication middleware
- Database operations
- Response formatting
- TypeScript types

Return complete, production-ready code.'''
                    }]
                }]
            },
            timeout=25
        )
        
        if response.ok:
            api_code = response.json()['candidates'][0]['content']['parts'][0]['text']
            return jsonify({'api_code': api_code, 'success': True})
        
        return jsonify({'error': 'Failed to generate API', 'success': False}), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/user-stats', methods=['GET'])
def user_stats():
    """Get user usage statistics"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        
        credits = get_user_credits(user_id)
        history = user_history.get(user_id, [])
        
        return jsonify({
            'credits_left': credits,
            'total_projects': len(history),
            'recent_projects': history[-5:] if history else [],
            'success': True
        })
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/project-history', methods=['GET'])
def project_history():
    """Get user's project history"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        history = user_history.get(user_id, [])
        
        return jsonify({
            'history': history,
            'success': True
        })
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500

@codegen_bp.route('/github-push', methods=['POST'])
def github_push():
    """Push code to GitHub repository"""
    try:
        data = request.json
        repo_name = data.get('repo_name', '')
        code_files = data.get('files', [])
        
        # Create repository
        response = requests.post(
            'https://api.github.com/user/repos',
            headers={
                'Authorization': f'token {GITHUB_TOKEN}',
                'Accept': 'application/vnd.github.v3+json'
            },
            json={
                'name': repo_name,
                'description': 'Generated by Wave AI Code Generator',
                'private': False,
                'auto_init': True
            },
            timeout=10
        )
        
        if response.ok:
            repo_url = response.json()['html_url']
            return jsonify({
                'repo_url': repo_url,
                'success': True,
                'message': 'Repository created successfully'
            })
        else:
            return jsonify({
                'error': 'Failed to create repository',
                'details': response.json(),
                'success': False
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 500
