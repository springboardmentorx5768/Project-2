-- Create storage bucket for shout-out images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shout-outs', 'shout-outs', true);

-- Create RLS policies for shout-outs bucket
CREATE POLICY "Anyone can view shout-out images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shout-outs');

CREATE POLICY "Authenticated users can upload shout-out images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shout-outs' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own shout-out images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shout-outs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own shout-out images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shout-outs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add image_url column to shout_outs table
ALTER TABLE public.shout_outs
ADD COLUMN image_url TEXT;

-- Add bio column to profiles table for profile settings
ALTER TABLE public.profiles
ADD COLUMN bio TEXT;