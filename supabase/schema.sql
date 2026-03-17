-- ============================================================
-- NUR CAFÉ — Supabase Schema (idempotent — safe to re-run)
-- Run this in the Supabase SQL Editor after creating your project
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  points          INTEGER DEFAULT 0 NOT NULL,
  wallet_balance  NUMERIC(10,2) DEFAULT 0 NOT NULL,
  tier            TEXT DEFAULT 'bronze' NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  stripe_customer_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update tier based on points
CREATE OR REPLACE FUNCTION public.update_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.points >= 150 THEN
    NEW.tier := 'gold';
  ELSIF NEW.points >= 50 THEN
    NEW.tier := 'silver';
  ELSE
    NEW.tier := 'bronze';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tier_update ON public.profiles;
CREATE TRIGGER tier_update
  BEFORE UPDATE OF points ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_tier();

-- RPC to increment points atomically
CREATE OR REPLACE FUNCTION public.increment_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + points_to_add
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  category    TEXT NOT NULL,
  image_url   TEXT,
  available   BOOLEAN DEFAULT true NOT NULL,
  sort_order  INTEGER DEFAULT 0 NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  items             JSONB NOT NULL DEFAULT '[]',
  subtotal          NUMERIC(10,2) NOT NULL,
  total_points      INTEGER NOT NULL DEFAULT 0,
  status            TEXT DEFAULT 'pending' NOT NULL
                    CHECK (status IN ('pending', 'preparing', 'ready', 'complete', 'cancelled')),
  payment_intent_id TEXT,
  location_id       TEXT DEFAULT 'deansgate' NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- GIFT CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gift_cards (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code         TEXT UNIQUE NOT NULL,
  value        NUMERIC(10,2) NOT NULL,
  purchased_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at   TIMESTAMPTZ
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  order_id   UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  read       BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_cards    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles: own read"   ON public.profiles;
DROP POLICY IF EXISTS "profiles: own insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles: own update" ON public.profiles;
CREATE POLICY "profiles: own read"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: own insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles: own update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Menu items: public read, no write from client
DROP POLICY IF EXISTS "menu: public read" ON public.menu_items;
CREATE POLICY "menu: public read"    ON public.menu_items FOR SELECT USING (true);

-- Orders: users see only their own orders
DROP POLICY IF EXISTS "orders: own read"   ON public.orders;
DROP POLICY IF EXISTS "orders: own insert" ON public.orders;
CREATE POLICY "orders: own read"     ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "orders: own insert"   ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gift cards
DROP POLICY IF EXISTS "gift_cards: own" ON public.gift_cards;
CREATE POLICY "gift_cards: own"      ON public.gift_cards FOR SELECT
  USING (auth.uid() = purchased_by OR auth.uid() = redeemed_by);

-- Notifications
DROP POLICY IF EXISTS "notifications: own"        ON public.notifications;
DROP POLICY IF EXISTS "notifications: update own" ON public.notifications;
CREATE POLICY "notifications: own"   ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications: update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP (works with email confirmation)
-- Triggered after the user row is inserted into auth.users
-- Name is passed via signUp metadata: { data: { name } }
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, points, wallet_balance, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    0, 0, 'bronze'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
