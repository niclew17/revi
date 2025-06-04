-- Create company_info table
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unique_link_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for company_info
DROP POLICY IF EXISTS "Users can view their own company info" ON public.company_info;
CREATE POLICY "Users can view their own company info"
  ON public.company_info FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own company info" ON public.company_info;
CREATE POLICY "Users can insert their own company info"
  ON public.company_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own company info" ON public.company_info;
CREATE POLICY "Users can update their own company info"
  ON public.company_info FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for employees
DROP POLICY IF EXISTS "Users can view their own employees" ON public.employees;
CREATE POLICY "Users can view their own employees"
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own employees" ON public.employees;
CREATE POLICY "Users can insert their own employees"
  ON public.employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own employees" ON public.employees;
CREATE POLICY "Users can update their own employees"
  ON public.employees FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own employees" ON public.employees;
CREATE POLICY "Users can delete their own employees"
  ON public.employees FOR DELETE
  USING (auth.uid() = user_id);

-- Add public access policy for employees to allow review page access
DROP POLICY IF EXISTS "Public can view employees by unique_link_id" ON public.employees;
CREATE POLICY "Public can view employees by unique_link_id"
  ON public.employees FOR SELECT
  USING (true);

-- Enable realtime for these tables
alter publication supabase_realtime add table company_info;
alter publication supabase_realtime add table employees;