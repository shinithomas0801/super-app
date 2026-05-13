-- Education module schema (separate from public.* education tables)
-- Creates:
-- - schema: education_module
-- - core education lifecycle tables
-- - RLS policies for student/admin access
-- - progress automation from exam scores -> module progress -> course progress/enrollment status

CREATE SCHEMA IF NOT EXISTS education_module;

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION education_module.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION education_module.is_education_module_admin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = education_module, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = check_uid
      AND COALESCE(u.raw_app_meta_data ->> 'role', '') IN ('superadmin', 'base_admin', 'education_admin')
  )
  OR EXISTS (
    SELECT 1
    FROM public.admin_users a
    WHERE a.user_id = check_uid
      AND a.role IN ('superadmin', 'base_admin', 'education_admin')
  );
$$;

CREATE OR REPLACE FUNCTION education_module.is_student_owner(student_profile_id uuid, check_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = education_module, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.app_users au
    WHERE au.id = student_profile_id
      AND au.user_id = check_uid
  );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE education_module.academic_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.app_users (id) ON DELETE CASCADE,
  qualification_level text NOT NULL,
  institution_name text NOT NULL,
  board_or_university text,
  year_of_completion integer CHECK (year_of_completion BETWEEN 1900 AND 2100),
  grade text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE education_module.universities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country_id uuid NOT NULL REFERENCES public.education_countries (id) ON DELETE RESTRICT,
  city text,
  ranking integer,
  website text
);

CREATE TABLE education_module.university_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES education_module.universities (id) ON DELETE CASCADE,
  file_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false
);

CREATE TABLE education_module.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES education_module.universities (id) ON DELETE CASCADE,
  name text NOT NULL,
  degree text,
  field_of_study text,
  duration_months integer CHECK (duration_months IS NULL OR duration_months > 0),
  tuition_fee numeric(12,2),
  currency text,
  min_qualification text
);

CREATE TABLE education_module.course_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE CASCADE,
  file_path text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false
);

CREATE TABLE education_module.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL CHECK (order_index > 0),
  duration_hours integer CHECK (duration_hours IS NULL OR duration_hours > 0),
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, order_index)
);

CREATE TABLE education_module.intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE CASCADE,
  name text NOT NULL,
  application_deadline date,
  start_date date,
  seats_available integer CHECK (seats_available IS NULL OR seats_available >= 0),
  UNIQUE (course_id, name, start_date)
);

CREATE TABLE education_module.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.app_users (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE RESTRICT,
  intake_id uuid REFERENCES education_module.intakes (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'dropped')),
  enrolled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE education_module.module_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES education_module.course_modules (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  max_score numeric(10,2) NOT NULL CHECK (max_score > 0),
  pass_score numeric(10,2) NOT NULL CHECK (pass_score >= 0),
  scheduled_date date
);

CREATE TABLE education_module.exam_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES education_module.enrollments (id) ON DELETE CASCADE,
  module_exam_id uuid NOT NULL REFERENCES education_module.module_exams (id) ON DELETE CASCADE,
  score numeric(10,2) NOT NULL CHECK (score >= 0),
  attempt_no integer NOT NULL DEFAULT 1 CHECK (attempt_no > 0),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, module_exam_id, attempt_no)
);

CREATE TABLE education_module.module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES education_module.enrollments (id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES education_module.course_modules (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at timestamptz,
  UNIQUE (enrollment_id, module_id)
);

CREATE TABLE education_module.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES education_module.enrollments (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES education_module.courses (id) ON DELETE CASCADE,
  progress_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  last_accessed_at timestamptz,
  UNIQUE (enrollment_id, course_id)
);

CREATE TABLE education_module.scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid NOT NULL REFERENCES education_module.universities (id) ON DELETE CASCADE,
  course_id uuid REFERENCES education_module.courses (id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric(12,2),
  eligibility text,
  deadline date
);

CREATE TABLE education_module.visa_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES public.education_countries (id) ON DELETE CASCADE,
  document_name text NOT NULL,
  description text,
  is_mandatory boolean NOT NULL DEFAULT true
);

CREATE OR REPLACE FUNCTION education_module.is_enrollment_owner(enrollment_id_value uuid, check_uid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = education_module, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM education_module.enrollments e
    JOIN public.app_users au ON au.id = e.student_id
    WHERE e.id = enrollment_id_value
      AND au.user_id = check_uid
  );
$$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX education_module_academic_records_student_idx ON education_module.academic_records (student_id);
CREATE INDEX education_module_universities_country_idx ON education_module.universities (country_id);
CREATE INDEX education_module_courses_university_idx ON education_module.courses (university_id);
CREATE INDEX education_module_course_modules_course_idx ON education_module.course_modules (course_id);
CREATE INDEX education_module_intakes_course_idx ON education_module.intakes (course_id);
CREATE INDEX education_module_enrollments_student_idx ON education_module.enrollments (student_id);
CREATE INDEX education_module_enrollments_course_idx ON education_module.enrollments (course_id);
CREATE INDEX education_module_module_exams_course_idx ON education_module.module_exams (course_id);
CREATE INDEX education_module_module_exams_module_idx ON education_module.module_exams (module_id);
CREATE INDEX education_module_exam_scores_enrollment_idx ON education_module.exam_scores (enrollment_id);
CREATE INDEX education_module_exam_scores_module_exam_idx ON education_module.exam_scores (module_exam_id);
CREATE INDEX education_module_module_progress_enrollment_idx ON education_module.module_progress (enrollment_id);
CREATE INDEX education_module_module_progress_module_idx ON education_module.module_progress (module_id);
CREATE INDEX education_module_course_progress_enrollment_idx ON education_module.course_progress (enrollment_id);
CREATE INDEX education_module_course_progress_course_idx ON education_module.course_progress (course_id);
CREATE INDEX education_module_scholarships_university_idx ON education_module.scholarships (university_id);
CREATE INDEX education_module_scholarships_course_idx ON education_module.scholarships (course_id);
CREATE INDEX education_module_visa_country_idx ON education_module.visa_checklists (country_id);

-- ---------------------------------------------------------------------------
-- Progress automation
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION education_module.recompute_module_progress_from_exam_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = education_module, public
AS $$
DECLARE
  v_enrollment_id uuid;
  v_module_exam_id uuid;
  v_module_id uuid;
  v_exam_count integer;
  v_best_score numeric(10,2);
  v_max_score numeric(10,2);
  v_pass_score numeric(10,2);
  v_status text;
  v_progress numeric(5,2);
BEGIN
  v_enrollment_id := COALESCE(NEW.enrollment_id, OLD.enrollment_id);
  v_module_exam_id := COALESCE(NEW.module_exam_id, OLD.module_exam_id);

  SELECT me.module_id
  INTO v_module_id
  FROM education_module.module_exams me
  WHERE me.id = v_module_exam_id;

  IF v_enrollment_id IS NULL OR v_module_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT
    COUNT(es.id),
    COALESCE(MAX(es.score), 0),
    COALESCE(MAX(me.max_score), 0),
    COALESCE(MAX(me.pass_score), 0)
  INTO v_exam_count, v_best_score, v_max_score, v_pass_score
  FROM education_module.exam_scores es
  JOIN education_module.module_exams me ON me.id = es.module_exam_id
  WHERE es.enrollment_id = v_enrollment_id
    AND me.module_id = v_module_id;

  IF v_exam_count = 0 THEN
    v_status := 'not_started';
    v_progress := 0;
  ELSIF v_best_score >= v_pass_score THEN
    v_status := 'completed';
    v_progress := 100;
  ELSE
    v_status := 'in_progress';
    v_progress := CASE
      WHEN v_max_score > 0 THEN LEAST(100, GREATEST(0, (v_best_score / v_max_score) * 100))
      ELSE 0
    END;
  END IF;

  INSERT INTO education_module.module_progress (
    enrollment_id,
    module_id,
    status,
    progress_percentage,
    completed_at
  )
  VALUES (
    v_enrollment_id,
    v_module_id,
    v_status,
    v_progress,
    CASE WHEN v_status = 'completed' THEN now() ELSE NULL END
  )
  ON CONFLICT (enrollment_id, module_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    progress_percentage = EXCLUDED.progress_percentage,
    completed_at = CASE
      WHEN EXCLUDED.status = 'completed' THEN COALESCE(education_module.module_progress.completed_at, now())
      ELSE NULL
    END;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION education_module.recompute_course_progress_from_module_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = education_module, public
AS $$
DECLARE
  v_enrollment_id uuid;
  v_course_id uuid;
  v_total_modules integer;
  v_completed_modules integer;
  v_touched_modules integer;
  v_status text;
  v_progress numeric(5,2);
BEGIN
  v_enrollment_id := COALESCE(NEW.enrollment_id, OLD.enrollment_id);

  SELECT e.course_id
  INTO v_course_id
  FROM education_module.enrollments e
  WHERE e.id = v_enrollment_id;

  IF v_enrollment_id IS NULL OR v_course_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT COUNT(*)
  INTO v_total_modules
  FROM education_module.course_modules cm
  WHERE cm.course_id = v_course_id;

  SELECT COUNT(*)
  INTO v_completed_modules
  FROM education_module.module_progress mp
  JOIN education_module.course_modules cm ON cm.id = mp.module_id
  WHERE mp.enrollment_id = v_enrollment_id
    AND cm.course_id = v_course_id
    AND mp.status = 'completed';

  SELECT COUNT(*)
  INTO v_touched_modules
  FROM education_module.module_progress mp
  JOIN education_module.course_modules cm ON cm.id = mp.module_id
  WHERE mp.enrollment_id = v_enrollment_id
    AND cm.course_id = v_course_id;

  IF v_total_modules = 0 THEN
    v_status := 'not_started';
    v_progress := 0;
  ELSIF v_completed_modules = v_total_modules THEN
    v_status := 'completed';
    v_progress := 100;
  ELSIF v_touched_modules > 0 THEN
    v_status := 'in_progress';
    v_progress := (v_completed_modules::numeric / v_total_modules::numeric) * 100;
  ELSE
    v_status := 'not_started';
    v_progress := 0;
  END IF;

  INSERT INTO education_module.course_progress (
    enrollment_id,
    course_id,
    progress_percentage,
    status,
    last_accessed_at
  )
  VALUES (
    v_enrollment_id,
    v_course_id,
    v_progress,
    v_status,
    now()
  )
  ON CONFLICT (enrollment_id, course_id)
  DO UPDATE SET
    progress_percentage = EXCLUDED.progress_percentage,
    status = EXCLUDED.status,
    last_accessed_at = now();

  UPDATE education_module.enrollments e
  SET
    status = CASE
      WHEN v_status = 'completed' THEN 'completed'
      WHEN e.status = 'completed' THEN 'active'
      ELSE e.status
    END,
    completed_at = CASE
      WHEN v_status = 'completed' THEN COALESCE(e.completed_at, now())
      WHEN e.status = 'completed' THEN NULL
      ELSE e.completed_at
    END
  WHERE e.id = v_enrollment_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS education_module_exam_scores_progress_trg ON education_module.exam_scores;
CREATE TRIGGER education_module_exam_scores_progress_trg
  AFTER INSERT OR UPDATE OR DELETE ON education_module.exam_scores
  FOR EACH ROW
  EXECUTE FUNCTION education_module.recompute_module_progress_from_exam_score();

DROP TRIGGER IF EXISTS education_module_module_progress_course_trg ON education_module.module_progress;
CREATE TRIGGER education_module_module_progress_course_trg
  AFTER INSERT OR UPDATE OR DELETE ON education_module.module_progress
  FOR EACH ROW
  EXECUTE FUNCTION education_module.recompute_course_progress_from_module_progress();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE education_module.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.university_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.course_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.module_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_module.visa_checklists ENABLE ROW LEVEL SECURITY;

-- Academic records: user self create/edit/read + admin full access.
CREATE POLICY education_module_academic_records_select ON education_module.academic_records
  FOR SELECT TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  );

CREATE POLICY education_module_academic_records_insert ON education_module.academic_records
  FOR INSERT TO authenticated
  WITH CHECK (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  );

CREATE POLICY education_module_academic_records_update ON education_module.academic_records
  FOR UPDATE TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  )
  WITH CHECK (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  );

CREATE POLICY education_module_academic_records_delete ON education_module.academic_records
  FOR DELETE TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()));

-- Catalog tables: all authenticated users can read; admins manage.
CREATE POLICY education_module_universities_read ON education_module.universities
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_universities_write ON education_module.universities
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_university_images_read ON education_module.university_images
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_university_images_write ON education_module.university_images
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_courses_read ON education_module.courses
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_courses_write ON education_module.courses
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_course_images_read ON education_module.course_images
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_course_images_write ON education_module.course_images
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_course_modules_read ON education_module.course_modules
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_course_modules_write ON education_module.course_modules
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_intakes_read ON education_module.intakes
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_intakes_write ON education_module.intakes
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_module_exams_read ON education_module.module_exams
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_module_exams_write ON education_module.module_exams
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_scholarships_read ON education_module.scholarships
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_scholarships_write ON education_module.scholarships
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_visa_checklists_read ON education_module.visa_checklists
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY education_module_visa_checklists_write ON education_module.visa_checklists
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

-- Enrollments: user can read/create own enrollment; admins full access.
CREATE POLICY education_module_enrollments_select ON education_module.enrollments
  FOR SELECT TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  );

CREATE POLICY education_module_enrollments_insert ON education_module.enrollments
  FOR INSERT TO authenticated
  WITH CHECK (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_student_owner(student_id, auth.uid())
  );

CREATE POLICY education_module_enrollments_update ON education_module.enrollments
  FOR UPDATE TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_enrollments_delete ON education_module.enrollments
  FOR DELETE TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()));

-- Exam scores: users can view own scores; admins manage.
CREATE POLICY education_module_exam_scores_select ON education_module.exam_scores
  FOR SELECT TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_enrollment_owner(enrollment_id, auth.uid())
  );

CREATE POLICY education_module_exam_scores_write ON education_module.exam_scores
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

-- Progress tables: users can view own progress; admins manage.
CREATE POLICY education_module_module_progress_select ON education_module.module_progress
  FOR SELECT TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_enrollment_owner(enrollment_id, auth.uid())
  );

CREATE POLICY education_module_module_progress_write ON education_module.module_progress
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

CREATE POLICY education_module_course_progress_select ON education_module.course_progress
  FOR SELECT TO authenticated
  USING (
    education_module.is_education_module_admin(auth.uid())
    OR education_module.is_enrollment_owner(enrollment_id, auth.uid())
  );

CREATE POLICY education_module_course_progress_write ON education_module.course_progress
  FOR ALL TO authenticated
  USING (education_module.is_education_module_admin(auth.uid()))
  WITH CHECK (education_module.is_education_module_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Grants for Data API access (RLS still applies)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA education_module TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA education_module TO authenticated;
GRANT EXECUTE ON FUNCTION education_module.is_education_module_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION education_module.is_student_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION education_module.is_enrollment_owner(uuid, uuid) TO authenticated;
