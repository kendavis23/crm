-- Folders: top-level context containers for contacts
create table public.folders (
    id         uuid primary key default gen_random_uuid(),
    name       text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger folders_updated_at
    before update on public.folders
    for each row execute function public.set_updated_at();

-- Link contacts to a folder (nullable so existing contacts are unaffected)
alter table public.contacts
    add column folder_id uuid references public.folders(id) on delete set null;

create index idx_contacts_folder on public.contacts(folder_id);

-- RLS
alter table public.folders enable row level security;

create policy "authenticated users can select folders"
    on public.folders for select to authenticated using (true);

create policy "authenticated users can insert folders"
    on public.folders for insert to authenticated with check (true);

create policy "authenticated users can update folders"
    on public.folders for update to authenticated using (true);

create policy "authenticated users can delete folders"
    on public.folders for delete to authenticated using (true);

create policy "anon can select folders"
    on public.folders for select to anon using (true);
