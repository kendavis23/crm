create table public.bd_pursuits (
    contact_id uuid not null references public.contacts(id) on delete cascade,
    pursuit text not null,
    primary key (contact_id, pursuit)
);

create index idx_bd_pursuits_contact on public.bd_pursuits(contact_id);
create index idx_bd_pursuits_pursuit on public.bd_pursuits(pursuit);

alter table public.bd_pursuits enable row level security;

create policy "anon can select bd_pursuits"
    on public.bd_pursuits for select
    to anon using (true);

create policy "auth all bd_pursuits"
    on public.bd_pursuits for all
    to authenticated using (true);
