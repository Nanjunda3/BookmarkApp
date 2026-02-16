-- SQL query used in Supabase


-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  url         text NOT NULL CHECK (char_length(url) > 0),
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Index for fast user-scoped queries
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON public.bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: users can only SELECT their own bookmarks
CREATE POLICY "select_own" ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can INSERT bookmarks (user_id must match their UID)
CREATE POLICY "insert_own" ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can UPDATE only their own bookmarks
CREATE POLICY "update_own" ON public.bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can DELETE only their own bookmarks
CREATE POLICY "delete_own" ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

