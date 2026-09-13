.PHONY: dev dev-api dev-web deploy deploy-api deploy-web migrate-run migrate-gen env-list env-push env-pull

dev:
	pnpm --filter @apps/api dev & pnpm --filter @apps/web dev

dev-api:
	pnpm --filter @apps/api dev

dev-web:
	pnpm --filter @apps/web dev

deploy:
	./deploy.sh all

deploy-api:
	./deploy.sh api

deploy-web:
	./deploy.sh web

migrate-run:
	pnpm --filter @apps/api migration:run

migrate-gen:
	pnpm --filter @apps/api migration:generate

# Env Vercel — APP=api|web (default: api). Contoh: make env-push APP=web
APP ?= api

env-list:
	./env.sh $(APP) list

env-push:
	./env.sh $(APP) push

env-pull:
	./env.sh $(APP) pull
