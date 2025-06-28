CREATE OR REPLACE FUNCTION public.increment_review_count(employee_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.employees 
  SET review_count = COALESCE(review_count, 0) + 1
  WHERE id = employee_id;
END;
$$;
