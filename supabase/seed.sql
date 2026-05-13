-- Local dev seed for education catalog (runs after migrations on `supabase db reset`).
-- Idempotent for countries (name); fixed UUIDs for education_module rows use ON CONFLICT DO NOTHING.

-- ---------------------------------------------------------------------------
-- public.countries
-- ---------------------------------------------------------------------------
INSERT INTO public.countries (name, currency, iso_code) VALUES
  ('United States', 'USD', 'US'),
  ('United Kingdom', 'GBP', 'GB'),
  ('Canada', 'CAD', 'CA'),
  ('Australia', 'AUD', 'AU'),
  ('Germany', 'EUR', 'DE')
ON CONFLICT (name) DO UPDATE SET
  currency = excluded.currency,
  iso_code = excluded.iso_code;

-- ---------------------------------------------------------------------------
-- education_module.universities
-- ---------------------------------------------------------------------------
INSERT INTO education_module.universities (id, name, country_id, city, ranking, website)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    'Riverside Institute of Technology',
    (SELECT id FROM public.countries WHERE iso_code = 'US' LIMIT 1),
    'Boston',
    42,
    'https://example.edu/riverside'
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'Kingfisher College London',
    (SELECT id FROM public.countries WHERE iso_code = 'GB' LIMIT 1),
    'London',
    28,
    'https://example.edu/kingfisher'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.courses
-- ---------------------------------------------------------------------------
INSERT INTO education_module.courses (
  id,
  university_id,
  name,
  degree,
  field_of_study,
  duration_months,
  tuition_fee,
  currency,
  min_qualification
) VALUES
  (
    'b2000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'Computer Science',
    'BSc',
    'Computer Science',
    36,
    42000.00,
    'USD',
    'High school diploma'
  ),
  (
    'b2000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'Data Science',
    'MSc',
    'Data Science',
    24,
    38000.00,
    'USD',
    'Bachelor degree in a quantitative field'
  ),
  (
    'b2000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000002',
    'Economics',
    'BA',
    'Economics',
    36,
    28500.00,
    'GBP',
    'A-levels or equivalent'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.university_images
-- Full https URLs are used as-is by resolveUniversityImageSrc (see app code).
-- ---------------------------------------------------------------------------
INSERT INTO education_module.university_images (id, university_id, file_path, is_primary)
VALUES
  (
    'f1100000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'https://picsum.photos/seed/super-app-uni-riverside-campus/1200/800',
    true
  ),
  (
    'f1100000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'https://picsum.photos/seed/super-app-uni-riverside-library/1200/800',
    false
  ),
  (
    'f1100000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000002',
    'https://picsum.photos/seed/super-app-uni-kingfisher-quad/1200/800',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.course_images
-- ---------------------------------------------------------------------------
INSERT INTO education_module.course_images (id, course_id, file_path, is_primary)
VALUES
  (
    'f1200000-0000-4000-8000-000000000001',
    'b2000000-0000-4000-8000-000000000001',
    'https://picsum.photos/seed/super-app-course-cs-hero/1200/800',
    true
  ),
  (
    'f1200000-0000-4000-8000-000000000002',
    'b2000000-0000-4000-8000-000000000001',
    'https://picsum.photos/seed/super-app-course-cs-lab/1200/800',
    false
  ),
  (
    'f1200000-0000-4000-8000-000000000003',
    'b2000000-0000-4000-8000-000000000002',
    'https://picsum.photos/seed/super-app-course-ds-cover/1200/800',
    true
  ),
  (
    'f1200000-0000-4000-8000-000000000004',
    'b2000000-0000-4000-8000-000000000003',
    'https://picsum.photos/seed/super-app-course-econ-cover/1200/800',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.intakes
-- ---------------------------------------------------------------------------
INSERT INTO education_module.intakes (
  id,
  course_id,
  name,
  application_deadline,
  start_date,
  seats_available
) VALUES
  (
    'c3000000-0000-4000-8000-000000000001',
    'b2000000-0000-4000-8000-000000000001',
    'Fall 2025',
    '2025-06-01',
    '2025-09-01',
    120
  ),
  (
    'c3000000-0000-4000-8000-000000000002',
    'b2000000-0000-4000-8000-000000000001',
    'Spring 2026',
    '2025-11-15',
    '2026-01-15',
    80
  ),
  (
    'c3000000-0000-4000-8000-000000000003',
    'b2000000-0000-4000-8000-000000000003',
    'September 2025',
    '2025-07-01',
    '2025-09-22',
    200
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.scholarships
-- ---------------------------------------------------------------------------
INSERT INTO education_module.scholarships (
  id,
  university_id,
  course_id,
  name,
  amount,
  eligibility,
  deadline
) VALUES
  (
    'd4000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    NULL,
    'Riverside Merit Scholarship',
    10000.00,
    'First-class honours or GPA 3.7+',
    '2025-05-31'
  ),
  (
    'd4000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000001',
    'b2000000-0000-4000-8000-000000000002',
    'Women in STEM Award',
    5000.00,
    'Female-identifying applicants to Data Science MSc',
    '2025-04-30'
  ),
  (
    'd4000000-0000-4000-8000-000000000003',
    'a1000000-0000-4000-8000-000000000002',
    NULL,
    'Kingfisher International Bursary',
    3000.00,
    'Non-UK domiciled fee status',
    '2025-06-15'
  )
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- education_module.visa_checklists
-- ---------------------------------------------------------------------------
INSERT INTO education_module.visa_checklists (
  id,
  country_id,
  document_name,
  description,
  is_mandatory
) VALUES
  (
    'e5000000-0000-4000-8000-000000000001',
    (SELECT id FROM public.countries WHERE iso_code = 'US' LIMIT 1),
    'Valid passport',
    'Machine-readable; at least 6 months validity beyond intended stay.',
    true
  ),
  (
    'e5000000-0000-4000-8000-000000000002',
    (SELECT id FROM public.countries WHERE iso_code = 'US' LIMIT 1),
    'I-20 (Certificate of Eligibility)',
    'Issued by the SEVP-approved school.',
    true
  ),
  (
    'e5000000-0000-4000-8000-000000000003',
    (SELECT id FROM public.countries WHERE iso_code = 'GB' LIMIT 1),
    'CAS statement',
    'Confirmation of Acceptance for Studies from your sponsor institution.',
    true
  ),
  (
    'e5000000-0000-4000-8000-000000000004',
    (SELECT id FROM public.countries WHERE iso_code = 'GB' LIMIT 1),
    'Financial evidence',
    'Bank statements or official sponsorship letter covering tuition and living costs.',
    true
  )
ON CONFLICT (id) DO NOTHING;
