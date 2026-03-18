-- Storage RLS policies for makeup-images bucket
-- Allow users to read files in their own folder
CREATE POLICY "Users can read own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'makeup-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'makeup-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'makeup-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
