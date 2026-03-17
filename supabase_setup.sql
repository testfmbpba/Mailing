-- ============================================================
-- MailingBP - Supabase Setup SQL
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables    TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact lists
CREATE TABLE IF NOT EXISTS public.contact_lists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  file_url        TEXT,
  total_contacts  INTEGER NOT NULL DEFAULT 0,
  columns         TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id    UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  template_id      UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  contact_list_id  UUID REFERENCES public.contact_lists(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused','failed')),
  from_name        TEXT NOT NULL,
  from_email       TEXT NOT NULL,
  reply_to         TEXT,
  scheduled_at     TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count       INTEGER NOT NULL DEFAULT 0,
  opened_count     INTEGER NOT NULL DEFAULT 0,
  failed_count     INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email logs (tracking)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_id      UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  email           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','opened','failed','bounced')),
  tracking_id     TEXT UNIQUE NOT NULL,
  sent_at         TIMESTAMPTZ,
  opened_at       TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON public.email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_tracking_id ON public.email_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_contacts_list_id ON public.contacts(list_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_at ON public.campaigns(scheduled_at) WHERE status = 'scheduled';

-- ============================================================
-- 3. TRIGGERS
-- ============================================================

-- Auto-create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, active)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'user',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- 4. RPC FUNCTIONS
-- ============================================================

-- Increment opened_count atomically
CREATE OR REPLACE FUNCTION public.increment_opened_count(campaign_id UUID)
RETURNS VOID LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.campaigns
  SET opened_count = opened_count + 1
  WHERE id = campaign_id;
$$;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Helper: is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- EMAIL_TEMPLATES policies
CREATE POLICY "templates_select_own_or_admin" ON public.email_templates
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "templates_insert_own" ON public.email_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "templates_update_own" ON public.email_templates
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "templates_delete_own" ON public.email_templates
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- CONTACT_LISTS policies
CREATE POLICY "contact_lists_select_own_or_admin" ON public.contact_lists
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "contact_lists_insert_own" ON public.contact_lists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "contact_lists_update_own" ON public.contact_lists
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "contact_lists_delete_own" ON public.contact_lists
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- CONTACTS policies
CREATE POLICY "contacts_select_via_list" ON public.contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl
      WHERE cl.id = list_id AND (cl.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "contacts_insert_via_list" ON public.contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl
      WHERE cl.id = list_id AND cl.user_id = auth.uid()
    )
  );

CREATE POLICY "contacts_delete_via_list" ON public.contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.contact_lists cl
      WHERE cl.id = list_id AND (cl.user_id = auth.uid() OR public.is_admin())
    )
  );

-- CAMPAIGNS policies
CREATE POLICY "campaigns_select_own_or_admin" ON public.campaigns
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "campaigns_insert_own" ON public.campaigns
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "campaigns_update_own_or_admin" ON public.campaigns
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "campaigns_delete_own_or_admin" ON public.campaigns
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- EMAIL_LOGS policies
CREATE POLICY "logs_select_via_campaign" ON public.email_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "logs_insert_service_only" ON public.email_logs
  FOR INSERT WITH CHECK (true); -- Only service role inserts

CREATE POLICY "logs_update_service_only" ON public.email_logs
  FOR UPDATE USING (true); -- Tracking pixel uses service role

-- ============================================================
-- 6. OPTIONAL: SEED DATA (demo)
-- ============================================================
-- The first admin user must be set manually after registering:
--
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@tuempresa.com';
--
-- ============================================================
-- DONE! All tables, triggers, RLS policies and functions created.
-- ============================================================
