-- Add source tracking fields to reviews table
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS project_title TEXT,
  ADD COLUMN IF NOT EXISTS text TEXT;

-- Add unique constraint for external reviews
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_external_id ON public.reviews(source, external_id) 
  WHERE external_id IS NOT NULL;

-- Create table for Flamp settings
CREATE TABLE IF NOT EXISTS public.flamp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_flamp_url TEXT NOT NULL DEFAULT 'https://novosibirsk.flamp.ru/firm/absolyutprofremont_remontno_otdelochnaya_kompaniya-70000001020667161',
  company_id TEXT NOT NULL DEFAULT '70000001020667161',
  auto_sync_enabled BOOLEAN DEFAULT false,
  min_rating_to_import INTEGER DEFAULT 4,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.flamp_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read for Flamp settings (needed for widget on public pages)
CREATE POLICY "flamp_settings_public_read" ON public.flamp_settings FOR SELECT USING (true);

-- Allow authenticated users to update settings
CREATE POLICY "flamp_settings_auth_update" ON public.flamp_settings 
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert settings
CREATE POLICY "flamp_settings_auth_insert" ON public.flamp_settings 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create index
CREATE INDEX IF NOT EXISTS idx_reviews_source ON public.reviews(source);

-- Insert initial Flamp settings record if it doesn't exist
INSERT INTO public.flamp_settings (company_flamp_url, company_id)
VALUES (
  'https://novosibirsk.flamp.ru/firm/absolyutprofremont_remontno_otdelochnaya_kompaniya-70000001020667161',
  '70000001020667161'
)
ON CONFLICT DO NOTHING;

COMMENT ON COLUMN flamp_settings.company_id IS 'Flamp company ID for widget integration';
COMMENT ON TABLE flamp_settings IS 'Settings for Flamp widget integration';
