create table if not exists bookings (
  id text primary key,
  guest_name text not null,
  check_in date not null,
  check_out date not null,
  num_adults integer not null check (num_adults >= 1),
  num_children integer not null default 0 check (num_children >= 0),
  deposit_paid boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bookings_check_in_idx on bookings (check_in);
