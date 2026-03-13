# Database Schema

The following SQL was executed on the Supabase project `skofxxdyssoqnexmynqi` to set up the `resources` table, Row Level Security (RLS) policies, and the `resource_images` storage bucket.

```sql
-- Create resources table
CREATE TABLE public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    user_email TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policies for resources table
-- 1. Anyone can read resources
CREATE POLICY "Public resources are viewable by everyone." ON public.resources
    FOR SELECT USING (true);

-- 2. Authenticated users can insert their own resources
CREATE POLICY "Users can insert their own resources." ON public.resources
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Authenticated users can update their own resources
CREATE POLICY "Users can update their own resources." ON public.resources
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Authenticated users can delete their own resources
CREATE POLICY "Users can delete their own resources." ON public.resources
    FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('resource_images', 'resource_images', true);

-- Storage bucket policies
-- Viewable by everyone
CREATE POLICY "Public resource images are viewable by everyone." ON storage.objects
    FOR SELECT USING (bucket_id = 'resource_images');

-- Insert allowed for authenticated users
CREATE POLICY "Authenticated users can upload images." ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'resource_images' AND auth.role() = 'authenticated');

-- Update allowed for authenticated users
CREATE POLICY "Authenticated users can update their images." ON storage.objects
    FOR UPDATE USING (bucket_id = 'resource_images' AND auth.role() = 'authenticated');

-- Delete allowed for authenticated users
CREATE POLICY "Authenticated users can delete their images." ON storage.objects
    FOR DELETE USING (bucket_id = 'resource_images' AND auth.role() = 'authenticated');
```
