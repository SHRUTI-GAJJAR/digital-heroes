create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text not null check (provider = 'payu'),
  transaction_id text not null unique,
  provider_payment_id text,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'verification_pending', 'success', 'failed', 'cancelled')),
  response_data jsonb not null default '{}'::jsonb,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

create unique index if not exists donations_one_subscription_contribution
  on public.donations (subscription_id)
  where subscription_id is not null and donation_type = 'subscription';

create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_subscription_id_idx on public.payments (subscription_id);
create index if not exists payments_status_idx on public.payments (status);
