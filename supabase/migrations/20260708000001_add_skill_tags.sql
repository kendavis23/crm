-- Skill tags: a second, independent level of tagging alongside the existing
-- role-oriented `tags` table. Same shape and behaviour.
create table public.skill_tags (
    contact_id uuid not null references public.contacts(id) on delete cascade,
    tag        text not null,
    primary key (contact_id, tag)
);

create index idx_skill_tags_contact on public.skill_tags(contact_id);
create index idx_skill_tags_tag     on public.skill_tags(tag);

alter table public.skill_tags enable row level security;

create policy "anon can select skill_tags"
    on public.skill_tags for select
    to anon using (true);

create policy "auth all skill_tags"
    on public.skill_tags for all
    to authenticated using (true);
