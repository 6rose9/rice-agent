-- Storage bucket for profile avatars and covers
insert into storage.buckets (id, name, public)
values ('profiles', 'profiles', true);

-- Allow authenticated users to upload to their own folder
create policy "Users can upload own profile images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = 'avatars'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);

create policy "Users can upload own cover images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profiles'
  and (storage.foldername(name))[1] = 'covers'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);

-- Allow anyone to view profile images (public bucket)
create policy "Public profile images are viewable"
on storage.objects for select
using (bucket_id = 'profiles');

-- Allow users to update their own images
create policy "Users can update own profile images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profiles'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);

-- Allow users to delete their own images
create policy "Users can delete own profile images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profiles'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);
