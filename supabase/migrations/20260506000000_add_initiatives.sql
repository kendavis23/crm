create table public.initiatives (
    contact_id uuid not null references public.contacts(id) on delete cascade,
    initiative text not null,
    primary key (contact_id, initiative)
);

create index idx_initiatives_contact on public.initiatives(contact_id);
create index idx_initiatives_initiative on public.initiatives(initiative);

alter table public.initiatives enable row level security;

create policy "anon can select initiatives"
    on public.initiatives for select
    to anon using (true);

create policy "auth all initiatives"
    on public.initiatives for all
    to authenticated using (true);
