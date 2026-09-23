-- ==============================================================================
-- Cloudflare D1 Database Schema for Legal AI
-- Database: legal (073ec7c6-6c8b-4764-a0ef-bdd9d8b1445e)
-- Tip: In Cloudflare Studio, press Cmd+A to select all before running!
-- ==============================================================================

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    page_count INTEGER DEFAULT 1,
    chunk_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed',
    raw_preview TEXT,
    upload_date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL UNIQUE,
    overall_risk_score TEXT DEFAULT 'MEDIUM',
    summary TEXT NOT NULL,
    risk_flags TEXT NOT NULL,
    checklist TEXT NOT NULL,
    key_clauses TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    sources TEXT DEFAULT '[]',
    created_at TEXT NOT NULL
);
