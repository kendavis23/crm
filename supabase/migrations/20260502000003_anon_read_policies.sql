-- Allow unauthenticated (anon) reads for prototyping — replace with auth later
create policy "anon can select contacts"
    on public.contacts for select
    to anon using (true);

create policy "anon can select tags"
    on public.tags for select
    to anon using (true);
