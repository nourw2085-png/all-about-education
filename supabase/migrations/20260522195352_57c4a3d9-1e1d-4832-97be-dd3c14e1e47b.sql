
-- ENUMS
DO $$ BEGIN
  CREATE TYPE public.message_status AS ENUM ('sent','delivered','read');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.point_kind AS ENUM ('question_answered','assignment_graded','quiz_graded','quality_bonus');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLES first
CREATE TABLE IF NOT EXISTS public.parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  student_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_parent_links_parent ON public.parent_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_links_student ON public.parent_links(student_id);

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  assistant_id uuid NOT NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, assistant_id)
);
CREATE INDEX IF NOT EXISTS idx_conv_student ON public.conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_conv_assistant ON public.conversations(assistant_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  attachment_url text,
  attachment_type text,
  status public.message_status NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON public.messages(conversation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid NOT NULL,
  kind public.point_kind NOT NULL,
  points integer NOT NULL,
  ref_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_points_assistant ON public.point_events(assistant_id, created_at DESC);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_teacher(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'teacher');
$$;

CREATE OR REPLACE FUNCTION public.is_assistant(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _uid AND role = 'assistant');
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of(_parent uuid, _student uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.parent_links WHERE parent_id = _parent AND student_id = _student);
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_member(_uid uuid, _conv uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conv AND (student_id = _uid OR assistant_id = _uid)
  );
$$;

-- RLS
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Parents view own links" ON public.parent_links;
CREATE POLICY "Parents view own links" ON public.parent_links
  FOR SELECT TO authenticated USING (auth.uid() = parent_id OR public.is_teacher(auth.uid()));
DROP POLICY IF EXISTS "Parents insert own links" ON public.parent_links;
CREATE POLICY "Parents insert own links" ON public.parent_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_id);
DROP POLICY IF EXISTS "Parents delete own links" ON public.parent_links;
CREATE POLICY "Parents delete own links" ON public.parent_links
  FOR DELETE TO authenticated USING (auth.uid() = parent_id);

DROP POLICY IF EXISTS "View conversations" ON public.conversations;
CREATE POLICY "View conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = assistant_id OR public.is_teacher(auth.uid()));
DROP POLICY IF EXISTS "Create conversations" ON public.conversations;
CREATE POLICY "Create conversations" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id OR auth.uid() = assistant_id);
DROP POLICY IF EXISTS "Update conversations" ON public.conversations;
CREATE POLICY "Update conversations" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = assistant_id);

DROP POLICY IF EXISTS "View messages" ON public.messages;
CREATE POLICY "View messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.is_conversation_member(auth.uid(), conversation_id) OR public.is_teacher(auth.uid()));
DROP POLICY IF EXISTS "Send messages" ON public.messages;
CREATE POLICY "Send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_member(auth.uid(), conversation_id));
DROP POLICY IF EXISTS "Update message status" ON public.messages;
CREATE POLICY "Update message status" ON public.messages
  FOR UPDATE TO authenticated
  USING (public.is_conversation_member(auth.uid(), conversation_id) AND auth.uid() <> sender_id);

DROP POLICY IF EXISTS "View point events" ON public.point_events;
CREATE POLICY "View point events" ON public.point_events
  FOR SELECT TO authenticated
  USING (auth.uid() = assistant_id OR public.is_teacher(auth.uid()));
DROP POLICY IF EXISTS "Teachers grant bonuses" ON public.point_events;
CREATE POLICY "Teachers grant bonuses" ON public.point_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_teacher(auth.uid()) AND kind = 'quality_bonus');

-- Triggers
CREATE OR REPLACE FUNCTION public.on_message_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_assistant uuid;
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  SELECT assistant_id INTO v_assistant FROM public.conversations WHERE id = NEW.conversation_id;
  IF NEW.sender_id = v_assistant THEN
    INSERT INTO public.point_events (assistant_id, kind, points, ref_id)
    VALUES (v_assistant, 'question_answered', 5, NEW.id);
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.sync_assistant_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
    SET points = COALESCE((SELECT SUM(points) FROM public.point_events WHERE assistant_id = NEW.assistant_id), 0)
    WHERE user_id = NEW.assistant_id;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_message_inserted ON public.messages;
CREATE TRIGGER trg_message_inserted AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.on_message_inserted();

DROP TRIGGER IF EXISTS trg_points_sync ON public.point_events;
CREATE TRIGGER trg_points_sync AFTER INSERT ON public.point_events
  FOR EACH ROW EXECUTE FUNCTION public.sync_assistant_points();

-- Leaderboard view
CREATE OR REPLACE VIEW public.assistant_scores
WITH (security_invoker=on) AS
  SELECT p.user_id AS assistant_id, p.name, p.avatar_url,
    COALESCE(SUM(pe.points),0)::int AS total_points,
    COALESCE(SUM(pe.points) FILTER (WHERE pe.created_at >= now() - interval '7 days'),0)::int AS weekly_points,
    COUNT(pe.id) FILTER (WHERE pe.kind='question_answered') AS answers,
    COUNT(pe.id) FILTER (WHERE pe.kind='assignment_graded') AS assignments_graded,
    COUNT(pe.id) FILTER (WHERE pe.kind='quiz_graded') AS quizzes_graded
  FROM public.profiles p
  JOIN public.user_roles r ON r.user_id = p.user_id AND r.role='assistant'
  LEFT JOIN public.point_events pe ON pe.assistant_id = p.user_id
  GROUP BY p.user_id, p.name, p.avatar_url;

-- Tighten profiles visibility
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Restricted profile visibility" ON public.profiles;
CREATE POLICY "Restricted profile visibility" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_teacher(auth.uid())
    OR public.is_assistant(auth.uid())
    OR public.is_parent_of(auth.uid(), user_id)
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE (c.student_id = profiles.user_id AND c.assistant_id = auth.uid())
         OR (c.assistant_id = profiles.user_id AND c.student_id = auth.uid())
    )
  );

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments','chat-attachments',false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Chat attach upload" ON storage.objects;
CREATE POLICY "Chat attach upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id='chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Chat attach read" ON storage.objects;
CREATE POLICY "Chat attach read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id='chat-attachments');
DROP POLICY IF EXISTS "Chat attach delete" ON storage.objects;
CREATE POLICY "Chat attach delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id='chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
