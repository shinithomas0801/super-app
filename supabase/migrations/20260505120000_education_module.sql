-- Education module: catalog, students, applications, AI audit, cost & visa content.
-- Apply with Supabase CLI: `supabase db push` or `supabase migration up`.
-- After deploy: INSERT INTO education_admin_users (user_id) VALUES ('<auth.users.id>');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.education_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.education_set_updated_at() IS 'Sets updated_at to now() on education table updates.';

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.education_admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid REFERENCES auth.users (id) ON DELETE SET NULL
);

COMMENT ON TABLE public.education_admin_users IS 'Users allowed to manage education data via RLS.';

CREATE OR REPLACE FUNCTION public.is_education_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.education_admin_users e WHERE e.user_id = check_uid
  );
$$;

COMMENT ON FUNCTION public.is_education_admin(uuid) IS 'True when the user is granted education admin (RLS helper).';

GRANT EXECUTE ON FUNCTION public.is_education_admin(uuid) TO authenticated;

CREATE TABLE public.education_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso_code char(2) NOT NULL UNIQUE,
  name text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER education_countries_updated_at
  BEFORE UPDATE ON public.education_countries
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.education_countries (id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  website_url text,
  ranking_band text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_universities_country_id_idx ON public.education_universities (country_id);

CREATE TRIGGER education_universities_updated_at
  BEFORE UPDATE ON public.education_universities
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES public.education_universities (id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  level text NOT NULL CHECK (level IN ('foundation', 'undergraduate', 'postgraduate', 'doctoral', 'diploma', 'certificate', 'other')),
  duration_months integer CHECK (duration_months IS NULL OR duration_months >= 0),
  base_tuition_amount numeric(14, 2),
  tuition_currency char(3) NOT NULL DEFAULT 'USD',
  field_of_study text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (university_id, slug)
);

CREATE INDEX education_courses_university_id_idx ON public.education_courses (university_id);

CREATE TRIGGER education_courses_updated_at
  BEFORE UPDATE ON public.education_courses
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.education_courses (id) ON DELETE CASCADE,
  label text NOT NULL,
  starts_on date NOT NULL,
  applications_close_on date,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_intakes_course_id_idx ON public.education_intakes (course_id);

CREATE TRIGGER education_intakes_updated_at
  BEFORE UPDATE ON public.education_intakes
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_student_ref text UNIQUE,
  full_name text NOT NULL,
  email text,
  phone text,
  nationality_country_id uuid REFERENCES public.education_countries (id) ON DELETE SET NULL,
  preferred_country_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_student_profiles_email_idx ON public.education_student_profiles (email);

CREATE TRIGGER education_student_profiles_updated_at
  BEFORE UPDATE ON public.education_student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_student_academics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.education_student_profiles (id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  qualification_type text NOT NULL,
  field text,
  grade_or_gpa text,
  completed_on date,
  is_verified boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_student_academics_student_id_idx ON public.education_student_academics (student_id);

CREATE TRIGGER education_student_academics_updated_at
  BEFORE UPDATE ON public.education_student_academics
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_mark_list_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.education_student_profiles (id) ON DELETE CASCADE,
  academic_record_id uuid REFERENCES public.education_student_academics (id) ON DELETE SET NULL,
  storage_bucket text NOT NULL DEFAULT 'education-mark-lists',
  storage_object_path text NOT NULL,
  original_filename text,
  mime_type text,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'parsed', 'failed', 'archived')
  ),
  parsed_payload jsonb,
  uploaded_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (storage_bucket, storage_object_path)
);

CREATE INDEX education_mark_list_uploads_student_id_idx ON public.education_mark_list_uploads (student_id);
CREATE INDEX education_mark_list_uploads_status_idx ON public.education_mark_list_uploads (status);

CREATE TRIGGER education_mark_list_uploads_updated_at
  BEFORE UPDATE ON public.education_mark_list_uploads
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_exam_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.education_student_profiles (id) ON DELETE CASCADE,
  exam_code text NOT NULL CHECK (
    exam_code IN ('IELTS', 'TOEFL', 'GRE', 'GMAT', 'SAT', 'PTE', 'DUOLINGO', 'OTHER')
  ),
  overall_score numeric(8, 2),
  section_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  tested_on date,
  expires_on date,
  verified boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_exam_scores_student_id_idx ON public.education_exam_scores (student_id);

CREATE TRIGGER education_exam_scores_updated_at
  BEFORE UPDATE ON public.education_exam_scores
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider_name text,
  country_id uuid REFERENCES public.education_countries (id) ON DELETE SET NULL,
  eligibility_summary text,
  application_url text,
  amount_min numeric(14, 2),
  amount_max numeric(14, 2),
  currency char(3) NOT NULL DEFAULT 'USD',
  deadline date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_scholarships_country_id_idx ON public.education_scholarships (country_id);

CREATE TRIGGER education_scholarships_updated_at
  BEFORE UPDATE ON public.education_scholarships
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_visa_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.education_countries (id) ON DELETE CASCADE,
  step_title text NOT NULL,
  description text,
  doc_type_hint text,
  sort_order integer NOT NULL DEFAULT 0,
  required boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_visa_checklist_items_country_id_idx ON public.education_visa_checklist_items (country_id);

CREATE TRIGGER education_visa_checklist_items_updated_at
  BEFORE UPDATE ON public.education_visa_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_cost_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.education_countries (id) ON DELETE CASCADE,
  category text NOT NULL CHECK (
    category IN ('tuition', 'living', 'visa', 'insurance', 'travel', 'other')
  ),
  amount_monthly numeric(14, 2),
  amount_yearly numeric(14, 2),
  currency char(3) NOT NULL DEFAULT 'USD',
  notes text,
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_cost_benchmarks_country_id_idx ON public.education_cost_benchmarks (country_id);

CREATE TRIGGER education_cost_benchmarks_updated_at
  BEFORE UPDATE ON public.education_cost_benchmarks
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_eligibility_rulesets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_type text NOT NULL CHECK (target_type IN ('global', 'university', 'course')),
  university_id uuid REFERENCES public.education_universities (id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.education_courses (id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (target_type = 'global' AND university_id IS NULL AND course_id IS NULL)
    OR (target_type = 'university' AND university_id IS NOT NULL AND course_id IS NULL)
    OR (target_type = 'course' AND course_id IS NOT NULL)
  )
);

CREATE TRIGGER education_eligibility_rulesets_updated_at
  BEFORE UPDATE ON public.education_eligibility_rulesets
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_id uuid NOT NULL REFERENCES public.education_eligibility_rulesets (id) ON DELETE CASCADE,
  rule_key text NOT NULL,
  operator text NOT NULL,
  value_json jsonb NOT NULL,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ruleset_id, rule_key)
);

CREATE INDEX education_eligibility_rules_ruleset_id_idx ON public.education_eligibility_rules (ruleset_id);

CREATE TRIGGER education_eligibility_rules_updated_at
  BEFORE UPDATE ON public.education_eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.education_student_profiles (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.education_courses (id) ON DELETE CASCADE,
  intake_id uuid REFERENCES public.education_intakes (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')
  ),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  admin_notes text,
  student_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id, intake_id)
);

CREATE INDEX education_applications_status_idx ON public.education_applications (status);
CREATE INDEX education_applications_student_id_idx ON public.education_applications (student_id);

CREATE TRIGGER education_applications_updated_at
  BEFORE UPDATE ON public.education_applications
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('universities', 'courses', 'students', 'applications')),
  filter_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (created_by, name, scope)
);

CREATE TRIGGER education_saved_filters_updated_at
  BEFORE UPDATE ON public.education_saved_filters
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

-- AI audit / observability (inputs & outputs; no raw secrets)
CREATE TABLE public.education_ai_eligibility_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.education_student_profiles (id) ON DELETE SET NULL,
  application_id uuid REFERENCES public.education_applications (id) ON DELETE SET NULL,
  ruleset_id uuid REFERENCES public.education_eligibility_rulesets (id) ON DELETE SET NULL,
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_ai_eligibility_runs_student_id_idx ON public.education_ai_eligibility_runs (student_id);

CREATE TABLE public.education_ai_recommendation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.education_student_profiles (id) ON DELETE SET NULL,
  input_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ranked_course_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  explanation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_ai_recommendation_runs_student_id_idx ON public.education_ai_recommendation_runs (student_id);

CREATE TABLE public.education_ai_document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.education_student_profiles (id) ON DELETE SET NULL,
  mark_upload_id uuid REFERENCES public.education_mark_list_uploads (id) ON DELETE SET NULL,
  storage_object_path text,
  classification text,
  extracted_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_flags text[] NOT NULL DEFAULT '{}'::text[],
  model text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.education_ai_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.education_student_profiles (id) ON DELETE SET NULL,
  admin_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER education_ai_chat_sessions_updated_at
  BEFORE UPDATE ON public.education_ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.education_set_updated_at();

CREATE TABLE public.education_ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.education_ai_chat_sessions (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX education_ai_chat_messages_session_id_idx ON public.education_ai_chat_messages (session_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.education_admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY education_admin_users_self_read
  ON public.education_admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY education_admin_users_admin_manage
  ON public.education_admin_users FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

-- Bootstrap: allow first insert via service role only; thereafter admins manage membership.

ALTER TABLE public.education_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_student_academics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_mark_list_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_visa_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_cost_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_eligibility_rulesets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_ai_eligibility_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_ai_recommendation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_ai_document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Generic policy pattern: education admins only (session user).

CREATE POLICY education_countries_rw ON public.education_countries FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_universities_rw ON public.education_universities FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_courses_rw ON public.education_courses FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_intakes_rw ON public.education_intakes FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_student_profiles_rw ON public.education_student_profiles FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_student_academics_rw ON public.education_student_academics FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_mark_list_uploads_rw ON public.education_mark_list_uploads FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_exam_scores_rw ON public.education_exam_scores FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_scholarships_rw ON public.education_scholarships FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_visa_checklist_items_rw ON public.education_visa_checklist_items FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_cost_benchmarks_rw ON public.education_cost_benchmarks FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_eligibility_rulesets_rw ON public.education_eligibility_rulesets FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_eligibility_rules_rw ON public.education_eligibility_rules FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_applications_rw ON public.education_applications FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_saved_filters_rw ON public.education_saved_filters FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()) AND created_by = auth.uid())
  WITH CHECK (public.is_education_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY education_ai_eligibility_runs_rw ON public.education_ai_eligibility_runs FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_ai_recommendation_runs_rw ON public.education_ai_recommendation_runs FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_ai_document_analyses_rw ON public.education_ai_document_analyses FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_ai_chat_sessions_rw ON public.education_ai_chat_sessions FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

CREATE POLICY education_ai_chat_messages_rw ON public.education_ai_chat_messages FOR ALL TO authenticated
  USING (public.is_education_admin(auth.uid()))
  WITH CHECK (public.is_education_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage: mark lists (private bucket)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'education-mark-lists',
  'education-mark-lists',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]::text[]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY education_mark_lists_select
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'education-mark-lists'
    AND public.is_education_admin(auth.uid())
  );

CREATE POLICY education_mark_lists_insert
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'education-mark-lists'
    AND public.is_education_admin(auth.uid())
  );

CREATE POLICY education_mark_lists_update
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'education-mark-lists'
    AND public.is_education_admin(auth.uid())
  )
  WITH CHECK (
    bucket_id = 'education-mark-lists'
    AND public.is_education_admin(auth.uid())
  );

CREATE POLICY education_mark_lists_delete
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'education-mark-lists'
    AND public.is_education_admin(auth.uid())
  );
