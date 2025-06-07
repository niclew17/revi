ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  customer_name TEXT,
  review_text TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  platforms TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reviews for their employees" ON public.reviews;
CREATE POLICY "Users can view reviews for their employees"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = reviews.employee_id 
      AND employees.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

alter publication supabase_realtime add table reviews;