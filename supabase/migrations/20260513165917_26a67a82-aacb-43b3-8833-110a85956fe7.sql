-- Enums
CREATE TYPE public.app_role AS ENUM ('student', 'assistant', 'teacher', 'parent');
CREATE TYPE public.user_gender AS ENUM ('male', 'female');

-- Profiles table (no FK to auth.users per guidelines)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  gender public.user_gender NOT NULL,
  papers TEXT[] NOT NULL DEFAULT '{}',
  bank_number TEXT,
  student_code TEXT UNIQUE,
  linked_student_codes TEXT[] NOT NULL DEFAULT '{}',
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup using raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_gender public.user_gender;
  v_name TEXT;
  v_papers TEXT[];
  v_bank TEXT;
  v_student_code TEXT;
  v_linked TEXT[];
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'::public.app_role);
  v_gender := COALESCE((NEW.raw_user_meta_data->>'gender')::public.user_gender, 'male'::public.user_gender);

  IF NEW.raw_user_meta_data ? 'papers' THEN
    SELECT array_agg(value::text) INTO v_papers
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'papers');
  END IF;
  v_papers := COALESCE(v_papers, '{}');

  IF NEW.raw_user_meta_data ? 'linked_student_codes' THEN
    SELECT array_agg(value::text) INTO v_linked
    FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'linked_student_codes');
  END IF;
  v_linked := COALESCE(v_linked, '{}');

  v_bank := NEW.raw_user_meta_data->>'bank_number';
  v_student_code := NEW.raw_user_meta_data->>'student_code';
  IF v_role = 'student' AND (v_student_code IS NULL OR v_student_code = '') THEN
    v_student_code := 'S-' || lpad(floor(random()*100000)::text, 5, '0');
  END IF;

  INSERT INTO public.profiles (user_id, name, email, gender, papers, bank_number, student_code, linked_student_codes)
  VALUES (NEW.id, v_name, NEW.email, v_gender, v_papers, v_bank, v_student_code, v_linked);

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies — profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS policies — user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
