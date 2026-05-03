.PHONY: dev build start lint migrate-new migrate-push migrate-list migrate-repair types

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# Usage: make migrate-new name=add_my_column
migrate-new:
	supabase migration new $(name)

migrate-push:
	supabase db push

migrate-list:
	supabase migration list

# Usage: make migrate-repair id=20260502000000
migrate-repair:
	supabase migration repair --status applied $(id)

types:
	supabase gen types typescript --project-id dncqoferdgudlqwemida > lib/supabase/types.ts
