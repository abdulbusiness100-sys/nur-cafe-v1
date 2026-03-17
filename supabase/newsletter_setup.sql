-- ============================================================
-- NŪR CAFÉ — Newsletter Subscribers
-- Run in Supabase SQL Editor to enable email capture on HomeScreen
-- ============================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  source     TEXT DEFAULT 'app' NOT NULL,   -- 'app' | 'website' etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert only — no reads from client)
DROP POLICY IF EXISTS "newsletter: subscribe" ON public.newsletter_subscribers;
CREATE POLICY "newsletter: subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Only admins can read the full subscriber list
DROP POLICY IF EXISTS "newsletter: admin read" ON public.newsletter_subscribers;
CREATE POLICY "newsletter: admin read"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.is_admin());