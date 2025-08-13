-- Burger Bonanza Database Setup
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    display_name text NOT NULL,
    avatar_url text,
    created_at timestamptz DEFAULT now()
);

-- Create entries table
CREATE TABLE IF NOT EXISTS public.entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    entry_date date NOT NULL,
    amount integer NOT NULL CHECK (amount > 0 AND amount <= 50),
    stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
    photo_url text,
    note text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.entries (user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries (entry_date DESC);

-- Challenge window constraint function
CREATE OR REPLACE FUNCTION public.is_within_bonanza_window(d date)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $$
    SELECT d BETWEEN date '2025-09-01' AND date '2026-08-31'
$$;

-- Add challenge window constraint
ALTER TABLE public.entries
    DROP CONSTRAINT IF EXISTS entries_date_in_window;
ALTER TABLE public.entries
    ADD CONSTRAINT entries_date_in_window CHECK (public.is_within_bonanza_window(entry_date));

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT
    u.id AS user_id,
    u.display_name,
    COALESCE(SUM(e.amount), 0) AS total,
    MIN(e.entry_date) AS first_entry,
    MAX(e.entry_date) AS last_entry
FROM public.users u
LEFT JOIN public.entries e ON e.user_id = u.id
GROUP BY u.id, u.display_name;

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users read all" ON public.users;
DROP POLICY IF EXISTS "users insert self" ON public.users;
DROP POLICY IF EXISTS "users update self" ON public.users;
DROP POLICY IF EXISTS "entries read all" ON public.entries;
DROP POLICY IF EXISTS "entries insert own" ON public.entries;
DROP POLICY IF EXISTS "entries update own" ON public.entries;
DROP POLICY IF EXISTS "entries delete own" ON public.entries;

-- Users policies: anyone can read (for leaderboard), only self can insert/update
CREATE POLICY "users read all" ON public.users 
    FOR SELECT USING (true);

CREATE POLICY "users insert self" ON public.users 
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users update self" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

-- Entries policies: anyone can read (for feed/leaderboard), only owner can write
CREATE POLICY "entries read all" ON public.entries 
    FOR SELECT USING (true);

CREATE POLICY "entries insert own" ON public.entries 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "entries update own" ON public.entries 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "entries delete own" ON public.entries 
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket (this needs to be done via Supabase UI or API, not SQL)
-- Go to Storage > Create new bucket > name: "burger-photos" > make public

-- Grant permissions for authenticated users on the bucket
-- This needs to be set up in the Supabase Storage policies UI