ALTER TABLE public.company_info 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS google_reviews_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS google_review_link TEXT;

ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS position TEXT;