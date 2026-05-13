-- Remove legacy public education module objects replaced by education_module schema.
-- Keep public.education_countries temporarily; replaced by public.countries in a later migration.

DROP TABLE IF EXISTS public.education_ai_chat_messages CASCADE;
DROP TABLE IF EXISTS public.education_ai_chat_sessions CASCADE;
DROP TABLE IF EXISTS public.education_ai_document_analyses CASCADE;
DROP TABLE IF EXISTS public.education_ai_recommendation_runs CASCADE;
DROP TABLE IF EXISTS public.education_ai_eligibility_runs CASCADE;
DROP TABLE IF EXISTS public.education_saved_filters CASCADE;
DROP TABLE IF EXISTS public.education_applications CASCADE;
DROP TABLE IF EXISTS public.education_eligibility_rules CASCADE;
DROP TABLE IF EXISTS public.education_eligibility_rulesets CASCADE;
DROP TABLE IF EXISTS public.education_cost_benchmarks CASCADE;
DROP TABLE IF EXISTS public.education_visa_checklist_items CASCADE;
DROP TABLE IF EXISTS public.education_scholarships CASCADE;
DROP TABLE IF EXISTS public.education_exam_scores CASCADE;
DROP TABLE IF EXISTS public.education_mark_list_uploads CASCADE;
DROP TABLE IF EXISTS public.education_student_academics CASCADE;
DROP TABLE IF EXISTS public.education_student_profiles CASCADE;
DROP TABLE IF EXISTS public.education_intakes CASCADE;
DROP TABLE IF EXISTS public.education_courses CASCADE;
DROP TABLE IF EXISTS public.education_universities CASCADE;
DROP TABLE IF EXISTS public.education_admin_users CASCADE;
DROP TABLE IF EXISTS public.education_ranking_bands CASCADE;

ALTER TABLE IF EXISTS public.education_countries
  DROP COLUMN IF EXISTS sort_order;

DROP POLICY IF EXISTS education_countries_rw ON public.education_countries;
DROP POLICY IF EXISTS education_mark_lists_select ON storage.objects;
DROP POLICY IF EXISTS education_mark_lists_insert ON storage.objects;
DROP POLICY IF EXISTS education_mark_lists_update ON storage.objects;
DROP POLICY IF EXISTS education_mark_lists_delete ON storage.objects;

DROP TRIGGER IF EXISTS education_countries_updated_at ON public.education_countries;

DROP FUNCTION IF EXISTS public.is_education_admin(uuid);
DROP FUNCTION IF EXISTS public.education_set_updated_at();
