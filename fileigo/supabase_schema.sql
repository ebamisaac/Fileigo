-- SUPABASE DATABASE SCHEMA FOR FILEIGO (EDUVAULT)
-- Copy and paste this script into your Supabase SQL Editor to initialize all tables, triggers, and indices.

-- ======================================================================
-- 0. JWT Helper Function (Required for role verification in policies)
-- ======================================================================
create or replace function public.jwt()
returns jsonb
language sql stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

-- ======================================================================
-- 1. Profiles (public.users) Table
-- ======================================================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  role text default 'student' check (role in ('student', 'verifier', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Create Policies for public.users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile details" on public.users
  for update using (auth.uid() = id);

create policy "Verifiers can view student profiles" on public.users
  for select using (
    (jwt()->>'role' = 'verifier' OR jwt()->>'role' = 'admin') AND role = 'student'
  );

create policy "Admins can view and manage all profiles" on public.users
  for all using (jwt()->>'role' = 'admin');

-- ======================================================================
-- 2. Auth Auto-Sync Trigger
-- ======================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ======================================================================
-- 3. Documents Table
-- ======================================================================
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text not null,
  description text,
  file_url text not null,
  file_name text not null,
  file_type text not null,
  file_size text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- Policies for public.documents
create policy "Users can manage their own documents" on public.documents
  for all using (auth.uid() = user_id);

create policy "Verifiers and Admins can view uploaded documents for review" on public.documents
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('verifier', 'admin')
    )
  );

-- ======================================================================
-- 4. Submissions Table
-- ======================================================================
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.users(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'incomplete')),
  verifier_id uuid references public.users(id) on delete set null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verification_type text not null -- e.g. 'Academic Clearance', 'Financial Verification', 'Admission Check'
);

-- Enable RLS
alter table public.submissions enable row level security;

-- Policies for public.submissions
create policy "Students can view and manage their own submissions" on public.submissions
  for all using (auth.uid() = student_id);

create policy "Verifiers can view only assigned submissions" on public.submissions
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'verifier'
    ) and verifier_id = auth.uid()
  );

create policy "Admins can view and review all submissions" on public.submissions
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- ======================================================================
-- 5. Verification Records Table
-- ======================================================================
create table if not exists public.verification_records (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  verifier_notes text,
  approval_status text check (approval_status in ('approved', 'rejected', 'incomplete')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verifier_id uuid references public.users(id) on delete set null
);

-- Enable RLS
alter table public.verification_records enable row level security;

-- Policies for public.verification_records
create policy "Students can view verification records for their submissions" on public.verification_records
  for select using (
    exists (
      select 1 from public.submissions
      where submissions.id = verification_records.submission_id and submissions.student_id = auth.uid()
    )
  );

create policy "Verifiers can manage verification records" on public.verification_records
  for all using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role in ('verifier', 'admin')
    )
  );

-- ======================================================================
-- 6. Audit Logs Table
-- ======================================================================
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  details text,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.audit_logs enable row level security;

-- Policies for public.audit_logs
create policy "Only admins can view audit logs" on public.audit_logs
  for select using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

create policy "Authenticated users can create audit logs" on public.audit_logs
  for insert with check (auth.uid() is not null);
