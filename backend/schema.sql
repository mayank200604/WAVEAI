-- backend/schema.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_text TEXT NOT NULL,
  user_id TEXT,
  user_metadata JSON,
  autopsy_failure_reason TEXT,
  autopsy_emotional_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  market_potential REAL,
  technical_risk REAL,
  competition_score REAL,
  composite_score REAL,
  external_data JSON,
  client_request_id TEXT
);

CREATE TABLE IF NOT EXISTS idea_mutations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER,
  mutation_text TEXT,
  mutation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mutation_viability_score REAL,
  mutation_meta JSON,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS website_generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idea_id INTEGER,
  website_id TEXT,
  files_path TEXT,
  business_model TEXT,
  branding TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS api_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,
  latency_ms INTEGER,
  success INTEGER,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  request_meta JSON
);

CREATE TABLE IF NOT EXISTS chat_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  session_id TEXT,
  question TEXT,
  answer TEXT,
  llm_model TEXT,
  chat_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS llm_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  llm_model TEXT UNIQUE,
  count INTEGER DEFAULT 0
);
