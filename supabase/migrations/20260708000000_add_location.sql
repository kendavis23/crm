-- Add a free-text location to contacts (nullable so existing contacts are unaffected)
alter table public.contacts
    add column location text;
