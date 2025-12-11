# Wave AI - System Architecture Diagram

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           End Users / Browsers                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS
                    ┌─────────────┴─────────────┐
                    │                           │
        ┌───────────▼──────────┐    ┌──────────▼─────────┐
        │  Firebase Hosting    │    │   Web App CDN      │
        │  (React SPA)         │    │   (Global Cache)   │
        │  - Vite build        │    │                    │
        │  - Auto-scaling      │    │  - Fast delivery   │
        │  - HTTPS/SSL         │    │  - Replication     │
        └───────────┬──────────┘    └────────────────────┘
                    │
        ┌───────────▼─────────────────────────────────────┐
        │    Firebase Services (Google Cloud)             │
        │                                                 │
        │  ┌──────────────────────────────────────────┐   │
        │  │ Firebase Authentication                  │   │
        │  │ - Email/Password                         │   │
        │  │ - Google OAuth                           │   │
        │  │ - Session Management                     │   │
        │  └──────────────────────────────────────────┘   │
        │                                                 │
        │  ┌──────────────────────────────────────────┐   │
        │  │ Firestore Database (NoSQL)              │   │
        │  │ Collections:                             │   │
        │  │  - USERS (user profiles)                 │   │
        │  │  - CHAT_HISTORY (conversations)          │   │
        │  │  - GRAVEYARD (saved ideas)               │   │
        │  │  - PROJECTS (user projects)              │   │
        │  │                                          │   │
        │  │ Features:                                │   │
        │  │  - Real-time sync                        │   │
        │  │  - Automatic backups                     │   │
        │  │  - Security rules enforcement            │   │
        │  │  - Global replication                    │   │
        │  └──────────────────────────────────────────┘   │
        │                                                 │
        │  ┌──────────────────────────────────────────┐   │
        │  │ Firebase Storage                         │   │
        │  │ - User uploads                           │   │
        │  │ - Generated files                        │   │
        │  │ - Assets                                 │   │
        │  └──────────────────────────────────────────┘   │
        │                                                 │
        └─────────┬──────────────────────────────────────┘
                  │
        ┌─────────▼──────────────┐
        │  Firestore Rules       │
        │  (Access Control)      │
        │  - User isolation      │
        │  - Data validation     │
        │  - Rate limiting       │
        └────────────────────────┘
```

---

## Backend Architecture (Python Flask + AI)

```
┌──────────────────────────────────────────────────────────────────┐
│                  Cloud Run Container                             │
│                  (Managed by Google Cloud)                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Flask Application (Python)                 │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ CORS Middleware (flask_cors)                     │  │   │
│  │  │ Enables cross-origin requests from frontend      │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ API Routes                                       │  │   │
│  │  │                                                  │  │   │
│  │  │ Validation API:                                  │  │   │
│  │  │  POST /api/analyze-idea                          │  │   │
│  │  │  POST /api/validate-idea                         │  │   │
│  │  │  POST /api/quick-validate                        │  │   │
│  │  │  POST /api/analyze-competition                   │  │   │
│  │  │  POST /api/analyze-market                        │  │   │
│  │  │  POST /api/analyze-tech                          │  │   │
│  │  │  POST /api/chat                                  │  │   │
│  │  │                                                  │  │   │
│  │  │ Code Generation API:                             │  │   │
│  │  │  POST /api/codegen/enhance-prompt                │  │   │
│  │  │  POST /api/codegen/detect-tech-stack             │  │   │
│  │  │  POST /api/codegen/generate-code                 │  │   │
│  │  │  POST /api/codegen/analyze-code                  │  │   │
│  │  │  POST /api/codegen/ai-suggestions                │  │   │
│  │  │  POST /api/codegen/auto-fix                      │  │   │
│  │  │  POST /api/codegen/generate-docs                 │  │   │
│  │  │  POST /api/codegen/explain-code                  │  │   │
│  │  │  POST /api/codegen/generate-tests                │  │   │
│  │  │  POST /api/codegen/convert-language              │  │   │
│  │  │  POST /api/codegen/generate-api                  │  │   │
│  │  │  GET  /api/codegen/user-stats                    │  │   │
│  │  │  GET  /api/codegen/project-history               │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Business Logic Layer                             │  │   │
│  │  │                                                  │  │   │
│  │  │ Validation Engine:                               │  │   │
│  │  │  - Market potential analysis                      │  │   │
│  │  │  - Technical risk assessment                      │  │   │
│  │  │  - Competition scoring                            │  │   │
│  │  │  - Composite viability score                      │  │   │
│  │  │                                                  │  │   │
│  │  │ Code Analysis Engine:                             │  │   │
│  │  │  - Prompt enhancement                             │  │   │
│  │  │  - Tech stack detection                           │  │   │
│  │  │  - Code quality analysis                          │  │   │
│  │  │  - Auto-fix suggestions                           │  │   │
│  │  │  - Test generation                                │  │   │
│  │  │  - Documentation generation                       │  │   │
│  │  │                                                  │  │   │
│  │  │ Data Analysis:                                    │  │   │
│  │  │  - Market trends                                  │  │   │
│  │  │  - Competition intelligence                       │  │   │
│  │  │  - Semantic analysis (SentenceTransformer)        │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ AI Model Orchestration Layer                     │  │   │
│  │  │                                                  │  │   │
│  │  │ Primary Models:                                   │  │   │
│  │  │  - Groq (llama-3.3-70b) [Ultra-fast]            │  │   │
│  │  │  - Google Gemini [Balanced]                       │  │   │
│  │  │                                                  │  │   │
│  │  │ Secondary Models (Fallback):                      │  │   │
│  │  │  - Perplexity API [Alternative]                  │  │   │
│  │  │  - DeepSeek [Backup]                             │  │   │
│  │  │                                                  │  │   │
│  │  │ Model Selection Logic:                            │  │   │
│  │  │  1. Check task type (fast vs complex)             │  │   │
│  │  │  2. Select optimal model                          │  │   │
│  │  │  3. Use fallback if primary fails                 │  │   │
│  │  │  4. Track usage for billing                       │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ External Data Integration                        │  │   │
│  │  │                                                  │  │   │
│  │  │ Trend Analysis:                                  │  │   │
│  │  │  - Google Trends API                             │  │   │
│  │  │  - Reddit API (PRAW)                             │  │   │
│  │  │  - News API                                      │  │   │
│  │  │                                                  │  │   │
│  │  │ Repository Data:                                 │  │   │
│  │  │  - GitHub API                                    │  │   │
│  │  │  - Denodo adapter (optional)                      │  │   │
│  │  │                                                  │  │   │
│  │  │ Curated Datasets:                                │  │   │
│  │  │  - Financial data (Data/financial.json)          │  │   │
│  │  │  - Tech trends (Data/tech.json)                  │  │   │
│  │  │  - Market signals (Data/esg_data.json)           │  │   │
│  │  │  - Mental health data (Data/mental_health.json)  │  │   │
│  │  │  - Other sectors (movies, gk, etc.)              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────────────────────────────────────────┐  │   │
│  │  │ Local Storage Layer                              │  │   │
│  │  │                                                  │  │   │
│  │  │ SQLite Admin Database:                           │  │   │
│  │  │  - ideas (validation records)                     │  │   │
│  │  │  - idea_mutations (variations)                    │  │   │
│  │  │  - website_generations (code output)             │  │   │
│  │  │  - api_calls (usage logging)                      │  │   │
│  │  │  - chat_logs (session history)                    │  │   │
│  │  │  - llm_usage (model tracking)                     │  │   │
│  │  │                                                  │  │   │
│  │  │ Optional Caching:                                │  │   │
│  │  │  - Redis (if configured)                         │  │   │
│  │  │  - TTL: 1200 seconds (configurable)              │  │   │
│  │  └──────────────────────────────────────────────────┘  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  Configuration:                                               │
│  - Auto-scaling: 1-100 instances                              │
│  - Memory: 2GB per instance                                   │
│  - CPU: 2 CPUs per instance                                   │
│  - Timeout: 300 seconds                                       │
│  - Regional: us-central1                                      │
│                                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture (React + Vite + TypeScript)

```
┌────────────────────────────────────────────────────────────────────┐
│                    React Single-Page Application                   │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Entry Point: src/main.tsx                                   │ │
│  │  ├─ React Root                                               │ │
│  │  ├─ React Router (BrowserRouter)                             │ │
│  │  ├─ Routes Configuration                                     │ │
│  │  └─ Firebase Initialization                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                           │                                       │
│  ┌────────────────────────▼──────────────────────────────────────┐ │
│  │  Main Router (src/main.tsx)                                   │ │
│  │                                                              │ │
│  │  Routes:                                                    │ │
│  │   /splash          → Splash Component                       │ │
│  │   /landing         → Landing Page                           │ │
│  │   /login           → Login Page                             │ │
│  │   /main (protected)→ Main App (App.tsx)                     │ │
│  │   /chat            → Chat Interface                         │ │
│  │   /profile         → User Profile                           │ │
│  │   /projects        → Projects List                          │ │
│  │                                                              │ │
│  └────────────────────┬───────────────────────────────────────┘ │
│                       │                                         │
│  ┌────────────────────▼──────────────────────────────────────────┐ │
│  │  Core Components                                              │ │
│  │                                                              │ │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Authentication      │  │ UI Components                │  │ │
│  │  │ ├─ LoginNew.tsx     │  │ ├─ Splash.tsx               │  │ │
│  │  │ ├─ Protected Route  │  │ ├─ WaveLanding.tsx          │  │ │
│  │  │ ├─ ProtectedRoute   │  │ ├─ PageTransition.tsx       │  │ │
│  │  │ │  (HOC)            │  │ ├─ Popup.tsx                │  │ │
│  │  │ └─ Firebase Auth    │  │ └─ Sidebar.tsx              │  │ │
│  │  └─────────────────────┘  └──────────────────────────────┘  │ │
│  │                                                              │ │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Feature Components  │  │ WaveCodeGen Sub-app          │  │ │
│  │  │ ├─ Chat.tsx         │  │ ├─ Separate Vite instance    │  │ │
│  │  │ ├─ Projects.tsx     │  │ ├─ React component library   │  │ │
│  │  │ ├─ Profile.tsx      │  │ └─ Code generation UI        │  │ │
│  │  │ ├─ App.tsx (Main)   │  │                              │  │ │
│  │  │ └─ History.tsx      │  │                              │  │ │
│  │  └─────────────────────┘  └──────────────────────────────┘  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Firebase Services Layer (src/firebase/)                      │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │ config.ts    │  │ auth.ts      │  │ db.ts            │  │ │
│  │  │              │  │              │  │                  │  │ │
│  │  │ - Firebase   │  │ - Sign in    │  │ - CRUD ops       │  │ │
│  │  │   init       │  │ - Sign up    │  │ - Firestore      │  │ │
│  │  │ - Creds      │  │ - Sign out   │  │   queries        │  │ │
│  │  │ - SDK refs   │  │ - Google     │  │ - Collections    │  │ │
│  │  │              │  │   OAuth      │  │   (USERS,        │  │ │
│  │  │              │  │ - Password   │  │    CHAT,         │  │ │
│  │  │              │  │   reset      │  │    GRAVEYARD,    │  │ │
│  │  │              │  │ - Auth state │  │    PROJECTS)     │  │ │
│  │  │              │  │   listener   │  │                  │  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐                         │ │
│  │  │ types.ts     │  │ utils.ts     │                         │ │
│  │  │              │  │              │                         │ │
│  │  │ - TypeDefs   │  │ - Helpers    │                         │ │
│  │  │ - Interfaces │  │ - Validators │                         │ │
│  │  │ - Firestore  │  │ - Converters │                         │ │
│  │  │   models     │  │              │                         │ │
│  │  └──────────────┘  └──────────────┘                         │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Services Layer (src/services/)                               │ │
│  │                                                              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │  │ smartChatbot.ts  │  │ userDataService  │                │ │
│  │  │ ├─ Chat logic    │  │ ├─ User data     │                │ │
│  │  │ ├─ AI calls      │  │ ├─ Profile mgmt  │                │ │
│  │  │ ├─ Streaming     │  │ └─ Preferences   │                │ │
│  │  │ └─ Models API    │  │                  │                │ │
│  │  └──────────────────┘  └──────────────────┘                │ │
│  │                                                              │ │
│  │  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │  │ streamingService │  │ profileService   │                │ │
│  │  │ ├─ Real-time API │  │ ├─ Update creds  │                │ │
│  │  │ ├─ Response piping                     │                │ │
│  │  │ │  │ ├─ Password mgmt │                │ │
│  │  │ └─ Error handling                      │                │ │
│  │  │    └─ Photo upload   │                │ │
│  │  └──────────────────┘  └──────────────────┘                │ │
│  │                                                              │ │
│  │  ┌──────────────────┐                                       │ │
│  │  │ enhancedSupportBot                                       │ │
│  │  │ ├─ Support Q&A   │                                       │ │
│  │  │ ├─ Help system   │                                       │ │
│  │  │ └─ API fallback   │                                       │ │
│  │  └──────────────────┘                                       │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Styling & Build Configuration                              │ │
│  │                                                              │ │
│  │  ├─ Tailwind CSS (tailwind.config.js)                        │ │
│  │  ├─ PostCSS (postcss.config.js)                              │ │
│  │  ├─ Vite Config (vite.config.ts)                             │ │
│  │  ├─ TypeScript Config (tsconfig.json)                        │ │
│  │  ├─ ESLint Config (eslint.config.js)                         │ │
│  │  └─ CSS Modules:                                             │ │
│  │     ├─ App.css, landing.css, sidebar.css                     │ │
│  │     ├─ responsive.css (mobile-first design)                  │ │
│  │     └─ index.css (global styles)                             │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Build Process:                                                  │
│  - Source: src/                                                 │
│  - Bundle: npm run build                                         │
│  - Output: dist/                                                 │
│  - Hosting: Firebase Hosting CDN                                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Idea Validation Flow

```
┌──────────────┐
│  User Input  │
│  Idea Text   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Frontend (React)         │
│ Capture & Validate       │
└──────┬───────────────────┘
       │
       ├─ Enhanced Support Bot (local pre-check)
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Backend Flask (Cloud Run)                        │
│ POST /api/analyze-idea                           │
│                                                  │
│ 1. Parse input                                   │
│ 2. Load curated datasets (Data/*.json)           │
│ 3. Semantic analysis (SentenceTransformer)       │
│ 4. Market analysis:                              │
│    - Google Trends                               │
│    - Reddit sentiment (PRAW)                     │
│    - News aggregation (News API)                 │
│ 5. Tech stack analysis (GitHub APIs)             │
│ 6. Call AI models:                               │
│    - Groq (fast analysis)                        │
│    - Gemini (detailed scoring)                   │
│ 7. Generate scores:                              │
│    - Market potential                            │
│    - Technical risk                              │
│    - Competition score                           │
│    - Composite viability                         │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Database Operations                │
│                                    │
│ ├─ SQLite (Backend):              │
│ │  - Insert into ideas table       │
│ │  - Log API call usage            │
│ │  - Track LLM usage               │
│ │                                  │
│ ├─ Firestore (Frontend):           │
│ │  - Save to GRAVEYARD collection  │
│ │  - Store full validation result  │
│ │  - Update user metadata          │
│ │                                  │
│ └─ Firebase Storage:               │
│    - Save detailed JSON report     │
│                                    │
└──────┬────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Frontend Presentation                           │
│ - Display validation scores                     │
│ - Show market insights                          │
│ - Display tech recommendations                  │
│ - Show competition analysis                     │
│ - Offer mutation suggestions                    │
│ - Option to proceed to code generation          │
└──────────────────────────────────────────────────┘
```

### Code Generation Flow

```
┌──────────────────────────┐
│ User Configuration       │
│ - Tech Stack             │
│ - Requirements           │
│ - Pages/Components       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Frontend (React/Vite)                            │
│ Launch WaveCodeGen Sub-app                       │
│ - Collect detailed specs                         │
│ - Build prompt template                          │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Backend Flask (Cloud Run)                        │
│ POST /api/codegen/enhance-prompt                 │
│ - Use Groq for ultra-fast enhancement            │
│ - Refine user requirements                       │
│ - Add technical constraints                      │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Backend Flask                                    │
│ POST /api/codegen/detect-tech-stack              │
│ - Analyze requirements                           │
│ - Suggest optimal stack                          │
│ - Return architecture diagram                    │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Backend Flask                                    │
│ POST /api/codegen/generate-code                  │
│ - Use Gemini/Groq for generation                 │
│ - Create file structure                          │
│ - Generate all source files                      │
│ - Include build/deploy instructions              │
└──────┬───────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│ Database Operations                    │
│                                        │
│ ├─ SQLite:                            │
│ │  - Store generation in DB           │
│ │  - Track code generation metrics    │
│ │                                      │
│ ├─ Firestore:                         │
│ │  - Link to project                  │
│ │  - Store metadata                   │
│ │                                      │
│ └─ Firebase Storage:                  │
│    - Save generated code ZIP          │
│    - Save architecture files          │
│    - Save documentation               │
│                                        │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│ Frontend Download & Presentation                 │
│ - Download generated code ZIP                    │
│ - Display code preview                           │
│ - Show deployment instructions                   │
│ - Offer additional analysis:                     │
│   - Code explanation                             │
│   - Auto-fix suggestions                         │
│   - Test generation                              │
│   - Documentation generation                     │
│   - Language conversion                          │
└──────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ HTTPS/TLS Encryption (Transit)                        │ │
│  │ - All traffic encrypted end-to-end                    │ │
│  │ - TLS 1.3 enforced                                     │ │
│  │ - Certificate managed by Firebase/Google Cloud        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Firebase Authentication                               │ │
│  │ - Email/Password: Bcrypt hashed + salted              │ │
│  │ - Google OAuth: Industry-standard OAuth 2.0            │ │
│  │ - Session tokens: Secure, HTTP-only cookies           │ │
│  │ - Multi-auth support                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Firestore Security Rules                              │ │
│  │                                                        │ │
│  │ Collection Access Control:                            │ │
│  │ - USERS: Only owner can read/write                    │ │
│  │ - CHAT_HISTORY: Verified userId match                │ │
│  │ - GRAVEYARD: User-scoped access                       │ │
│  │ - PROJECTS: User isolation enforced                  │ │
│  │                                                        │ │
│  │ Features:                                             │ │
│  │ - Authenticated users only (except login/signup)      │ │
│  │ - Real-time validation                                │ │
│  │ - Automatic rollback on rule violation                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Backend Security                                       │ │
│  │                                                        │ │
│  │ - CORS: Whitelist allowed origins                     │ │
│  │ - Input validation: Sanitize all inputs               │ │
│  │ - Rate limiting: Prevent brute force attacks          │ │
│  │ - API key management: Environment variables only       │ │
│  │ - Error handling: No sensitive data in errors         │ │
│  │ - Logging: No passwords/keys in logs                  │ │
│  │ - Database: SQLite for admin data only                │ │
│  │ - Cloud Run: Auto-patching, managed security          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Data At Rest Encryption                               │ │
│  │ - Firestore: AES-256 automatic encryption             │ │
│  │ - Firebase Storage: AES-256 encryption                │ │
│  │ - SQLite: Optional encryption (sqlcipher)             │ │
│  │ - Backups: Encrypted snapshots                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Infrastructure Security                               │ │
│  │ - Cloud Run: DDoS protection via Google Cloud         │ │
│  │ - Firebase Hosting: Global CDN with WAF               │ │
│  │ - VPC: Isolated network (optional)                    │ │
│  │ - IAM: Role-based access control                      │ │
│  │ - Audit Logs: All activities logged                   │ │
│  │ - Compliance: GDPR, SOC 2 ready                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Production Deployment                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Google Cloud Platform                       │   │
│  │              Project: wave-ad270                         │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Cloud Run (Backend)                                │ │   │
│  │  │ - Region: us-central1                              │ │   │
│  │  │ - Memory: 2GB                                       │ │   │
│  │  │ - CPU: 2 vCPU                                       │ │   │
│  │  │ - Max instances: 100                                │ │   │
│  │  │ - Auto-scaling: 0-100 based on traffic              │ │   │
│  │  │ - Health checks: Automatic                          │ │   │
│  │  │ - Log output: Cloud Logging                         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Cloud SQL (Optional)                               │ │   │
│  │  │ - MySQL or PostgreSQL                              │ │   │
│  │  │ - Managed backups                                   │ │   │
│  │  │ - Automatic failover                                │ │   │
│  │  │ - High availability                                 │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Firestore                                          │ │   │
│  │  │ - Multi-region replication                          │ │   │
│  │  │ - Real-time sync                                    │ │   │
│  │  │ - Automatic backups                                 │ │   │
│  │  │ - Scalable to billions of documents                 │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Firebase Storage                                   │ │   │
│  │  │ - Global CDN                                        │ │   │
│  │  │ - Automatic replication                             │ │   │
│  │  │ - Backup buckets                                    │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Firebase Hosting                                   │ │   │
│  │  │ - Global CDN                                        │ │   │
│  │  │ - 150+ edge locations                               │ │   │
│  │  │ - Sub-second response times                         │ │   │
│  │  │ - Automatic HTTPS                                   │ │   │
│  │  │ - DDoS protection                                   │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CI/CD Pipeline                             │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Source: GitHub Repository                          │ │   │
│  │  │ ├─ frontend/ (React)                                │ │   │
│  │  │ ├─ backend/ (Python)                                │ │   │
│  │  │ └─ config/ (Firebase)                               │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Cloud Build (Automated)                            │ │   │
│  │  │ ├─ Run tests                                        │ │   │
│  │  │ ├─ Build Docker image (backend)                    │ │   │
│  │  │ ├─ Build frontend bundle                            │ │   │
│  │  │ └─ Deploy services                                  │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │           │                                              │   │
│  │           ▼                                              │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │ Deployment                                         │ │   │
│  │  │ ├─ Backend → Cloud Run                              │ │   │
│  │  │ ├─ Frontend → Firebase Hosting                      │ │   │
│  │  │ ├─ Functions → Cloud Functions (optional)           │ │   │
│  │  │ └─ Config → Firestore Rules                         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | React | 18.3.1 | UI framework |
| | TypeScript | 5.5.3 | Type safety |
| | Vite | 5.4.2 | Build tool |
| | Tailwind CSS | 3.4.1 | Styling |
| | Firebase SDK | 12.5.0 | BaaS |
| | React Router | 6.26.1 | Routing |
| | Framer Motion | 12.23.24 | Animations |
| **Backend** | Python | 3.9+ | Language |
| | Flask | 2.3.3 | Framework |
| | Groq API | Latest | Fast LLM |
| | Google Gemini | Latest | LLM model |
| | scikit-learn | 1.3.0 | ML library |
| | SentenceTransformer | 2.2.2 | Embeddings |
| **Database** | Firestore | - | NoSQL DB |
| | SQLite | - | Admin DB |
| **Infrastructure** | Cloud Run | - | Serverless compute |
| | Firebase Hosting | - | Frontend CDN |
| | Cloud Storage | - | File storage |
| **APIs** | Google Trends | - | Market data |
| | Reddit API | - | Sentiment analysis |
| | News API | - | News data |
| | GitHub API | - | Repo data |

