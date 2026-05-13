-- Users module: app user profiles + admin assignments.
-- Apply with Supabase CLI: `supabase db push` or `supabase migration up`.
--
-- Notes:
-- - `auth.users` stores authentication credentials (email/password hash). Do not duplicate passwords here.
-- - `public.app_users` is the user-editable profile.
-- - `public.admin_users` is managed by superadmins only (RLS enforced).
-- Superadmin checks rely on `auth.users.raw_app_meta_data.role = 'superadmin'`.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.users_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.users_set_updated_at() IS 'Sets updated_at to now() on users tables.';

CREATE OR REPLACE FUNCTION public.is_superadmin(check_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = check_uid
      AND COALESCE(u.raw_app_meta_data ->> 'role', '') = 'superadmin'
  );
$$;

COMMENT ON FUNCTION public.is_superadmin(uuid) IS 'True when the user has superadmin role (RLS helper).';

-- This is safe to expose; it only returns a boolean.
GRANT EXECUTE ON FUNCTION public.is_superadmin(uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  country_id uuid REFERENCES public.education_countries (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.app_users IS 'User-editable profile linked 1:1 to auth.users.';

CREATE INDEX app_users_user_id_idx ON public.app_users (user_id);
CREATE INDEX app_users_country_id_idx ON public.app_users (country_id);

CREATE TRIGGER app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.users_set_updated_at();

CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('superadmin', 'base_admin', 'education_admin', 'health_admin')),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.admin_users IS 'Admin role assignments; writable only by superadmins.';

CREATE INDEX admin_users_user_id_idx ON public.admin_users (user_id);
CREATE INDEX admin_users_role_idx ON public.admin_users (role);
CREATE UNIQUE INDEX admin_users_email_uniq ON public.admin_users (lower(email));

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.users_set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth → app_users sync (create profile row on new signup)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_users (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Creates app_users row when auth.users row is created.';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- app_users: users manage only their own profile.
CREATE POLICY app_users_self_select ON public.app_users
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY app_users_self_insert ON public.app_users
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY app_users_self_update ON public.app_users
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- admin_users: only superadmins can write; allow admins to read their own row.
CREATE POLICY admin_users_superadmin_select ON public.admin_users
  FOR SELECT TO authenticated
  USING (public.is_superadmin(auth.uid()) OR user_id = auth.uid());

CREATE POLICY admin_users_superadmin_write ON public.admin_users
  FOR INSERT TO authenticated
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY admin_users_superadmin_update ON public.admin_users
  FOR UPDATE TO authenticated
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

CREATE POLICY admin_users_superadmin_delete ON public.admin_users
  FOR DELETE TO authenticated
  USING (public.is_superadmin(auth.uid()));

