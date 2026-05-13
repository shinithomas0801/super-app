-- ISO 3166-1 alpha-2 (two letters), optional for legacy rows until backfilled.
ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS iso_code text;

ALTER TABLE public.countries
  DROP CONSTRAINT IF EXISTS countries_iso_code_format;

ALTER TABLE public.countries
  ADD CONSTRAINT countries_iso_code_format
  CHECK (
    iso_code IS NULL
    OR (
      char_length(iso_code) = 2
      AND iso_code ~ '^[A-Za-z]{2}$'
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS countries_iso_code_lower_uidx
  ON public.countries (lower(iso_code))
  WHERE iso_code IS NOT NULL;
