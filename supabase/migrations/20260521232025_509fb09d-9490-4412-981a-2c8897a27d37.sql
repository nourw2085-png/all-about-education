
-- Attach the missing trigger so every new auth user gets a profile + role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profiles + roles for any existing auth users that are missing them
INSERT INTO public.profiles (user_id, name, email, gender, papers, student_code)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE((u.raw_user_meta_data->>'gender')::public.user_gender, 'male'::public.user_gender),
  '{}'::text[],
  'S-' || lpad(floor(random()*100000)::text, 5, '0')
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT
  u.id,
  COALESCE((u.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role)
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE r.user_id IS NULL;
