-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Contacts
create table public.contacts (
    id               uuid primary key default gen_random_uuid(),
    name             text not null,
    company          text,
    line_of_business text,
    title            text,
    rel_type         text,
    email            text,
    phone            text,
    linkedin         text,
    notes            text,
    last_contacted   date,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

-- Tags
create table public.tags (
    contact_id uuid not null references public.contacts(id) on delete cascade,
    tag        text not null,
    primary key (contact_id, tag)
);

-- Indexes
create index idx_contacts_company on public.contacts(company);
create index idx_tags_contact     on public.tags(contact_id);
create index idx_tags_tag         on public.tags(tag);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger contacts_updated_at
    before update on public.contacts
    for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.contacts enable row level security;
alter table public.tags     enable row level security;

-- Policies: authenticated users can read/write their own data
-- (update these once you add auth — for now, allow all authenticated users)
create policy "authenticated users can select contacts"
    on public.contacts for select
    to authenticated using (true);

create policy "authenticated users can insert contacts"
    on public.contacts for insert
    to authenticated with check (true);

create policy "authenticated users can update contacts"
    on public.contacts for update
    to authenticated using (true);

create policy "authenticated users can delete contacts"
    on public.contacts for delete
    to authenticated using (true);

create policy "authenticated users can select tags"
    on public.tags for select
    to authenticated using (true);

create policy "authenticated users can insert tags"
    on public.tags for insert
    to authenticated with check (true);

create policy "authenticated users can delete tags"
    on public.tags for delete
    to authenticated using (true);
