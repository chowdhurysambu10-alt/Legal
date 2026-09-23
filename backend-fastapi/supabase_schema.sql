-- ==============================================================================
-- Supabase PostgreSQL Schema for Legal AI Assistant
-- Paste this into your Supabase Dashboard > SQL Editor > New query, and click RUN
-- ==============================================================================

-- 1. Users Table (Authentication & Accounts)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Documents Table (Uploaded Contracts)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    page_count INT DEFAULT 1,
    chunk_count INT DEFAULT 0,
    status TEXT DEFAULT 'completed',
    raw_preview TEXT,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Analyses Table (AI Analysis & Risk Scores)
CREATE TABLE IF NOT EXISTS public.analyses (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL UNIQUE REFERENCES public.documents(id) ON DELETE CASCADE,
    overall_risk_score TEXT DEFAULT 'MEDIUM',
    summary TEXT NOT NULL,
    risk_flags JSONB DEFAULT '[]'::jsonb NOT NULL,
    checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
    key_clauses JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Chat Messages Table (Contract Q&A and Chat History)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON public.documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON public.analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_document_id ON public.chat_messages(document_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow access for service role and API
DROP POLICY IF EXISTS "Full access to users" ON public.users;
CREATE POLICY "Full access to users" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to documents" ON public.documents;
CREATE POLICY "Full access to documents" ON public.documents FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to analyses" ON public.analyses;
CREATE POLICY "Full access to analyses" ON public.analyses FOR ALL USING (true);

DROP POLICY IF EXISTS "Full access to chat_messages" ON public.chat_messages;
CREATE POLICY "Full access to chat_messages" ON public.chat_messages FOR ALL USING (true);

-- ==============================================================================
-- Migration for existing databases:
-- Ensures deleting a user automatically cascades to delete all their documents,
-- analyses, and chat messages in Supabase PostgreSQL!
-- ==============================================================================
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_user_id_fkey;
ALTER TABLE public.documents 
    ADD CONSTRAINT documents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

