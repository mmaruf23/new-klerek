.PHONY: dev dev-api dev-web deploy deploy-api deploy-web migrate-run migrate-gen

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
