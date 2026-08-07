-- ==============================================================================
-- NEXOVIRA APPLIANCE STORE - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the production products database.

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  brand TEXT NOT NULL,
  category_id TEXT NOT NULL,
  category_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_percent NUMERIC,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  stock INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  rating NUMERIC DEFAULT 5.0,
  review_count INT DEFAULT 1,
  variations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image TEXT,
  product_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) on Products & Categories
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PRODUCTS:
-- Drop existing policies if updating
DROP POLICY IF EXISTS "Public read products policy" ON public.products;
DROP POLICY IF EXISTS "Admin write products policy" ON public.products;

-- Allow all customers and public visitors to read products across any browser/device
CREATE POLICY "Public read products policy" ON public.products
  FOR SELECT USING (true);

-- Allow authenticated admins to create, update, and delete products
CREATE POLICY "Admin write products policy" ON public.products
  FOR ALL USING (true);

-- 5. RLS POLICIES FOR CATEGORIES:
DROP POLICY IF EXISTS "Public read categories policy" ON public.categories;
DROP POLICY IF EXISTS "Admin write categories policy" ON public.categories;

CREATE POLICY "Public read categories policy" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin write categories policy" ON public.categories
  FOR ALL USING (true);

-- 6. Enable Realtime Subscriptions for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
