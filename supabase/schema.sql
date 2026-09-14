-- Mulecraft Office Reports schema
-- Run in the Supabase SQL Editor or via `supabase db push`.

create extension if not exists "pgcrypto";

-- Employees
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique not null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  department text,
  designation text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  date_of_joining date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Employment details
create table if not exists public.employment_details (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  employment_type text check (employment_type in ('full-time', 'part-time', 'contract', 'intern')),
  contract_start date,
  contract_end date,
  probation_end date,
  work_location text,
  manager_name text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Wages
create table if not exists public.wages (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  effective_from date,
  basic_pay numeric(12, 2),
  hra numeric(12, 2),
  allowances numeric(12, 2),
  deductions numeric(12, 2),
  gross_pay numeric(12, 2),
  net_pay numeric(12, 2),
  pay_frequency text check (pay_frequency in ('monthly', 'bi-weekly', 'weekly')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Attendance
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'leave', 'half-day', 'holiday')),
  check_in time,
  check_out time,
  hours_worked numeric(5, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, date)
);

-- Working hours
create table if not exists public.working_hours (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  period_start date,
  period_end date,
  total_hours numeric(6, 2),
  overtime_hours numeric(6, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leaves
create table if not exists public.leaves (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text check (leave_type in ('casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity')),
  start_date date,
  end_date date,
  days numeric(4, 1),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  applied_on date,
  reviewed_by text,
  reviewed_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Statutory
create table if not exists public.statutory (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  pan text,
  aadhaar text,
  uan text,
  pf_number text,
  esi_number text,
  bank_name text,
  bank_account text,
  ifsc text,
  tax_regime text check (tax_regime in ('old', 'new')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Monthly reports
create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  month date,
  days_present int,
  days_absent int,
  days_leave int,
  total_hours numeric(6, 2),
  overtime_hours numeric(6, 2),
  gross_pay numeric(12, 2),
  net_pay numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['employees', 'employment_details', 'wages', 'attendance', 'working_hours', 'leaves', 'statutory', 'monthly_reports']
  loop
    execute format('create trigger if not exists set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Enable RLS on all tables
alter table public.employees enable row level security;
alter table public.employment_details enable row level security;
alter table public.wages enable row level security;
alter table public.attendance enable row level security;
alter table public.working_hours enable row level security;
alter table public.leaves enable row level security;
alter table public.statutory enable row level security;
alter table public.monthly_reports enable row level security;

-- RLS policies: authenticated users can manage all rows (HR portal)
create policy "authenticated can select employees" on public.employees for select to authenticated using (true);
create policy "authenticated can insert employees" on public.employees for insert to authenticated with check (true);
create policy "authenticated can update employees" on public.employees for update to authenticated using (true) with check (true);
create policy "authenticated can delete employees" on public.employees for delete to authenticated using (true);

create policy "authenticated can select employment_details" on public.employment_details for select to authenticated using (true);
create policy "authenticated can insert employment_details" on public.employment_details for insert to authenticated with check (true);
create policy "authenticated can update employment_details" on public.employment_details for update to authenticated using (true) with check (true);
create policy "authenticated can delete employment_details" on public.employment_details for delete to authenticated using (true);

create policy "authenticated can select wages" on public.wages for select to authenticated using (true);
create policy "authenticated can insert wages" on public.wages for insert to authenticated with check (true);
create policy "authenticated can update wages" on public.wages for update to authenticated using (true) with check (true);
create policy "authenticated can delete wages" on public.wages for delete to authenticated using (true);

create policy "authenticated can select attendance" on public.attendance for select to authenticated using (true);
create policy "authenticated can insert attendance" on public.attendance for insert to authenticated with check (true);
create policy "authenticated can update attendance" on public.attendance for update to authenticated using (true) with check (true);
create policy "authenticated can delete attendance" on public.attendance for delete to authenticated using (true);

create policy "authenticated can select working_hours" on public.working_hours for select to authenticated using (true);
create policy "authenticated can insert working_hours" on public.working_hours for insert to authenticated with check (true);
create policy "authenticated can update working_hours" on public.working_hours for update to authenticated using (true) with check (true);
create policy "authenticated can delete working_hours" on public.working_hours for delete to authenticated using (true);

create policy "authenticated can select leaves" on public.leaves for select to authenticated using (true);
create policy "authenticated can insert leaves" on public.leaves for insert to authenticated with check (true);
create policy "authenticated can update leaves" on public.leaves for update to authenticated using (true) with check (true);
create policy "authenticated can delete leaves" on public.leaves for delete to authenticated using (true);

create policy "authenticated can select statutory" on public.statutory for select to authenticated using (true);
create policy "authenticated can insert statutory" on public.statutory for insert to authenticated with check (true);
create policy "authenticated can update statutory" on public.statutory for update to authenticated using (true) with check (true);
create policy "authenticated can delete statutory" on public.statutory for delete to authenticated using (true);

create policy "authenticated can select monthly_reports" on public.monthly_reports for select to authenticated using (true);
create policy "authenticated can insert monthly_reports" on public.monthly_reports for insert to authenticated with check (true);
create policy "authenticated can update monthly_reports" on public.monthly_reports for update to authenticated using (true) with check (true);
create policy "authenticated can delete monthly_reports" on public.monthly_reports for delete to authenticated using (true);
