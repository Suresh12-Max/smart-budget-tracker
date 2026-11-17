-- Run this once in your own Supabase project's SQL Editor.
-- This migration is designed for a fresh project, and does not create demo users.
-- Do NOT enter any service_role key in the React frontend.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('income','expense')),
  category text not null check (char_length(category) between 1 and 40),
  amount numeric(12,2) not null check (amount > 0 and amount <= 99999999.99),
  note text not null default '' check (char_length(note) <= 160),
  transaction_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  limit_amount numeric(12,2) not null check (limit_amount >= 0 and limit_amount <= 99999999.99),
  created_at timestamptz not null default now(),
  unique(user_id, month)
);

create index if not exists transactions_user_date_idx on public.transactions(user_id,transaction_date desc);
create index if not exists budgets_user_month_idx on public.budgets(user_id,month);

alter table public.transactions enable row level security;
alter table public.budgets enable row level security;

revoke all on public.transactions from anon;
revoke all on public.budgets from anon;
grant select, insert, update, delete on public.transactions to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "transactions_insert_own" on public.transactions;
create policy "transactions_insert_own" on public.transactions for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_update_own" on public.transactions;
create policy "transactions_update_own" on public.transactions for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "transactions_delete_own" on public.transactions;
create policy "transactions_delete_own" on public.transactions for delete to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own" on public.budgets for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own" on public.budgets for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own" on public.budgets for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own" on public.budgets for delete to authenticated
using ((select auth.uid()) = user_id);
