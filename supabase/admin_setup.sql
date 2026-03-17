-- ============================================================
-- NUR CAFÉ — Admin Setup Migration
-- Run this ONCE in the Supabase SQL Editor
-- ============================================================

-- 1. Add is_admin column to profiles (safe — skips if already exists)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

-- 2. Grant admin to spidxr253@gmail.com
UPDATE public.profiles
SET is_admin = true
WHERE email = 'spidxr253@gmail.com';

-- ============================================================
-- 3. RLS policies — admin can read & update ALL orders
-- ============================================================

-- Helper function: returns true if the calling user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Allow admin to read every order
DROP POLICY IF EXISTS "orders: admin read all" ON public.orders;
CREATE POLICY "orders: admin read all"
  ON public.orders FOR SELECT
  USING (public.is_admin());

-- Allow admin to update order status (pending → preparing → ready → complete / cancelled)
DROP POLICY IF EXISTS "orders: admin update status" ON public.orders;
CREATE POLICY "orders: admin update status"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- 4. RLS policies — admin can read ALL profiles (for customer names in orders)
-- ============================================================
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (public.is_admin());
