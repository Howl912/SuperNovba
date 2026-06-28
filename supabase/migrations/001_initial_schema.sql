-- SuperNovba 初始数据库 Schema
-- 在 Supabase SQL Editor 中运行此文件

-- ============================================================
-- 用户画像表（扩展 Supabase auth.users）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS：用户只能读写自己的画像
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 自动创建用户画像（注册时触发）
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', '匿名用户'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 产品表（用户输入的产品）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 登录用户：读写自己的产品
CREATE POLICY "Users can manage own products"
  ON public.products FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 匿名用户：允许插入（user_id 为空）
CREATE POLICY "Anonymous can insert products"
  ON public.products FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 生成会话表（每次点击"生成"）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  product_id UUID REFERENCES public.products,
  input_type TEXT NOT NULL DEFAULT 'text', -- 'text' 或 'image'
  input_content TEXT,
  status TEXT NOT NULL DEFAULT 'generating', -- generating, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.generation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sessions"
  ON public.generation_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can insert sessions"
  ON public.generation_sessions FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 营销卡片表
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.generation_sessions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  image_prompt TEXT,
  angle_type TEXT NOT NULL, -- emotional, data, humor, social_proof, aspirational
  angle_label TEXT NOT NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cards"
  ON public.cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can insert cards"
  ON public.cards FOR INSERT
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cards_session_id ON public.cards(session_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_is_saved ON public.cards(is_saved) WHERE is_saved = TRUE;
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);

-- ============================================================
-- Supabase Storage Buckets
-- ============================================================
-- 需要在 Supabase Dashboard → Storage 中手动创建以下 Buckets：
-- 1. product-images   — 用户上传的产品图片
-- 2. generated-images — AI 生成的营销图片
--
-- 或者运行以下 SQL（需要 storage 扩展权限）：
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);
