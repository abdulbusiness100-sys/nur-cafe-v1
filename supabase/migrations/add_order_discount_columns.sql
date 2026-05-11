-- Migration: add discount tracking columns to orders table
-- Run this in Supabase SQL editor before deploying the updated app

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS final_total        numeric,
  ADD COLUMN IF NOT EXISTS discount_points    integer  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_gc_code   text,
  ADD COLUMN IF NOT EXISTS discount_gc_amount numeric  DEFAULT 0;

-- Back-fill existing orders: final_total = subtotal (no discounts applied historically)
UPDATE public.orders
SET final_total = subtotal
WHERE final_total IS NULL;
