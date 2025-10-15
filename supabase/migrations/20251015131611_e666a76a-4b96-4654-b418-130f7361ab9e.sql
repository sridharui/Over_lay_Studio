-- Create overlays table for storing overlay settings
CREATE TABLE public.overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'logo')),
  content TEXT,
  image_url TEXT,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 100,
  font_size NUMERIC DEFAULT 16,
  color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.overlays ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own overlays"
  ON public.overlays FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own overlays"
  ON public.overlays FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own overlays"
  ON public.overlays FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own overlays"
  ON public.overlays FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_overlays_updated_at
  BEFORE UPDATE ON public.overlays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();