-- ============================================================
-- 0001_init.sql — TransitOps schema, enums, indexes, triggers, RLS
-- ============================================================

-- ---------- ENUMS ----------
create type vehicle_status as enum ('Available', 'On Trip', 'In Shop', 'Retired');
create type driver_status  as enum ('Available', 'On Trip', 'Off Duty', 'Suspended');
create type trip_status    as enum ('Draft', 'Dispatched', 'Completed', 'Cancelled');
create type maintenance_status as enum ('Active', 'Closed');
create type app_role as enum ('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst');

-- ---------- TABLES ----------

-- profiles: one row per Supabase auth user, holds the app role
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        app_role not null,
  created_at  timestamptz not null default now()
);

-- vehicles (Module A owns writes)
create table vehicles (
  id                   uuid primary key default gen_random_uuid(),
  registration_number  text not null unique,
  name                 text not null,
  type                 text not null,
  max_load_capacity    numeric not null check (max_load_capacity > 0),
  odometer             numeric not null default 0,
  acquisition_cost     numeric not null default 0,
  status               vehicle_status not null default 'Available',
  region               text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- drivers (Module A owns writes)
create table drivers (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  license_number   text not null unique,
  license_category text not null,
  license_expiry   date not null,
  contact_number   text,
  safety_score     numeric not null default 100,
  status           driver_status not null default 'Available',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- trips (Module B owns writes)
create table trips (
  id               uuid primary key default gen_random_uuid(),
  source           text not null,
  destination      text not null,
  vehicle_id       uuid not null references vehicles(id),
  driver_id        uuid not null references drivers(id),
  cargo_weight     numeric not null check (cargo_weight > 0),
  planned_distance numeric not null,
  actual_distance  numeric,
  fuel_consumed    numeric,
  revenue          numeric,              -- feeds Module C's ROI calc
  status           trip_status not null default 'Draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- maintenance_logs (Module C owns writes)
create table maintenance_logs (
  id           uuid primary key default gen_random_uuid(),
  vehicle_id   uuid not null references vehicles(id),
  description  text not null,
  cost         numeric not null default 0,
  status       maintenance_status not null default 'Active',
  service_date date not null default current_date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- fuel_logs (Module C owns writes)
create table fuel_logs (
  id         uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id),
  trip_id    uuid references trips(id),
  liters     numeric not null check (liters > 0),
  cost       numeric not null default 0,
  log_date   date not null default current_date,
  created_at timestamptz not null default now()
);

-- expenses (Module C owns writes)
create table expenses (
  id         uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references vehicles(id),
  trip_id    uuid references trips(id),
  type       text not null,             -- e.g. 'toll', 'misc'
  amount     numeric not null default 0,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ---------- INDEXES ----------
create index idx_vehicles_status         on vehicles(status);
create index idx_drivers_status          on drivers(status);
create index idx_trips_status            on trips(status);
create index idx_trips_vehicle_id        on trips(vehicle_id);
create index idx_trips_driver_id         on trips(driver_id);
create index idx_maintenance_vehicle_id  on maintenance_logs(vehicle_id);
create index idx_fuel_logs_vehicle_id    on fuel_logs(vehicle_id);
create index idx_expenses_vehicle_id     on expenses(vehicle_id);

-- ---------- TRIGGERS ----------

-- trg_trip_status: dispatch/complete/cancel syncs vehicle+driver status
create or replace function fn_trip_status_sync()
returns trigger as $$
begin
  if new.status = 'Dispatched' and old.status = 'Draft' then
    update vehicles set status = 'On Trip', updated_at = now() where id = new.vehicle_id;
    update drivers  set status = 'On Trip', updated_at = now() where id = new.driver_id;
  elsif new.status in ('Completed', 'Cancelled') and old.status = 'Dispatched' then
    update vehicles set status = 'Available', updated_at = now() where id = new.vehicle_id;
    update drivers  set status = 'Available', updated_at = now() where id = new.driver_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_trip_status
after update of status on trips
for each row
when (old.status is distinct from new.status)
execute function fn_trip_status_sync();

-- trg_maintenance_insert: new Active maintenance record -> vehicle In Shop
create or replace function fn_maintenance_insert_sync()
returns trigger as $$
begin
  if new.status = 'Active' then
    update vehicles set status = 'In Shop', updated_at = now() where id = new.vehicle_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_maintenance_insert
after insert on maintenance_logs
for each row
execute function fn_maintenance_insert_sync();

-- trg_maintenance_close: closing maintenance restores vehicle unless Retired
create or replace function fn_maintenance_close_sync()
returns trigger as $$
begin
  if new.status = 'Closed' and old.status = 'Active' then
    update vehicles
      set status = 'Available', updated_at = now()
      where id = new.vehicle_id and status <> 'Retired';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_maintenance_close
after update of status on maintenance_logs
for each row
when (old.status is distinct from new.status)
execute function fn_maintenance_close_sync();

-- ---------- OPERATIONAL COST RPC (Module C's single source of truth) ----------
create or replace function vehicle_operational_cost(v_id uuid)
returns numeric as $$
  select
    coalesce((select sum(cost) from fuel_logs where vehicle_id = v_id), 0) +
    coalesce((select sum(cost) from maintenance_logs where vehicle_id = v_id), 0);
$$ language sql stable;

-- ---------- ROW LEVEL SECURITY ----------
alter table profiles           enable row level security;
alter table vehicles           enable row level security;
alter table drivers            enable row level security;
alter table trips              enable row level security;
alter table maintenance_logs   enable row level security;
alter table fuel_logs          enable row level security;
alter table expenses           enable row level security;

-- helper: current user's role
create or replace function current_role_name()
returns app_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

-- profiles: a user can read their own profile
create policy profiles_select_own on profiles
  for select using (id = auth.uid());

-- vehicles: all authenticated roles can read; only fleet_manager writes
create policy vehicles_select_all on vehicles
  for select using (auth.uid() is not null);
create policy vehicles_write_fleet_manager on vehicles
  for all using (current_role_name() = 'fleet_manager')
  with check (current_role_name() = 'fleet_manager');

-- drivers: all authenticated roles can read; fleet_manager and safety_officer write
create policy drivers_select_all on drivers
  for select using (auth.uid() is not null);
create policy drivers_write_fleet_safety on drivers
  for all using (current_role_name() in ('fleet_manager', 'safety_officer'))
  with check (current_role_name() in ('fleet_manager', 'safety_officer'));

-- trips: all authenticated roles can read; dispatcher writes
create policy trips_select_all on trips
  for select using (auth.uid() is not null);
create policy trips_write_dispatcher on trips
  for all using (current_role_name() = 'dispatcher')
  with check (current_role_name() = 'dispatcher');

-- maintenance/fuel/expenses: all authenticated roles can read; fleet_manager and financial_analyst write
create policy maintenance_select_all on maintenance_logs
  for select using (auth.uid() is not null);
create policy maintenance_write on maintenance_logs
  for all using (current_role_name() in ('fleet_manager', 'financial_analyst'))
  with check (current_role_name() in ('fleet_manager', 'financial_analyst'));

create policy fuel_select_all on fuel_logs
  for select using (auth.uid() is not null);
create policy fuel_write on fuel_logs
  for all using (current_role_name() in ('fleet_manager', 'financial_analyst'))
  with check (current_role_name() in ('fleet_manager', 'financial_analyst'));

create policy expenses_select_all on expenses
  for select using (auth.uid() is not null);
create policy expenses_write on expenses
  for all using (current_role_name() in ('fleet_manager', 'financial_analyst'))
  with check (current_role_name() in ('fleet_manager', 'financial_analyst'));
