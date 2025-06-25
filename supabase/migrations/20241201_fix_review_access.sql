-- Enable public access to company_info and users tables for review functionality
-- This allows the review page to work even when users are not authenticated

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for company_info" ON company_info;
DROP POLICY IF EXISTS "Public read access for users" ON users;
DROP POLICY IF EXISTS "Public read access for employees" ON employees;

-- Create policies to allow public read access for review functionality
CREATE POLICY "Public read access for company_info"
ON company_info FOR SELECT
USING (true);

CREATE POLICY "Public read access for users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Public read access for employees"
ON employees FOR SELECT
USING (true);

-- Enable RLS on tables (if not already enabled)
ALTER TABLE company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
