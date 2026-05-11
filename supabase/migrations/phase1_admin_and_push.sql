-- ============================================================
-- Phase 1 Migration — Run in Supabase SQL Editor
-- Safe to re-run (all statements use IF NOT EXISTS / OR REPLACE)
-- ============================================================

-- ------------------------------------------------------------
-- 1. is_admin column on profiles
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- Grant admin to the cafe owner account
UPDATE public.profiles
SET is_admin = true
WHERE email = 'spidxr253@gmail.com';

-- ------------------------------------------------------------
-- 2. push_token column on profiles (Expo push notification token)
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS push_token TEXT;

-- ------------------------------------------------------------
-- 3. Helper function: returns true if calling user is admin
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------
-- 4. RLS — orders: admin can read and update all orders
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "orders: admin read all" ON public.orders;
CREATE POLICY "orders: admin read all"
  ON public.orders FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "orders: admin update status" ON public.orders;
CREATE POLICY "orders: admin update status"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ------------------------------------------------------------
-- 5. RLS — profiles: admin can read all profiles
--    (needed to display customer names on order cards)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- ------------------------------------------------------------
-- 6. RLS — notifications: admin can insert notifications
--    (needed when marking orders ready/preparing)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "notifications: admin insert" ON public.notifications;
CREATE POLICY "notifications: admin insert"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- 7. Discount columns on orders (if not already applied)
-- ------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS final_total        NUMERIC,
  ADD COLUMN IF NOT EXISTS discount_points    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_gc_code   TEXT,
  ADD COLUMN IF NOT EXISTS discount_gc_amount NUMERIC DEFAULT 0;

-- Back-fill: set final_total = subtotal for any orders without it
UPDATE public.orders
SET final_total = subtotal
WHERE final_total IS NULL;
