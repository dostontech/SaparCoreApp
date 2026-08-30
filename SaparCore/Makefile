COMPOSE := docker compose --env-file docker/.env -f docker/docker-compose.yml
COMPOSE_DEV := $(COMPOSE) -f docker/docker-compose.override.yml
SHELL := /bin/bash

.PHONY: help env up up-dev up-redis down down-clean logs build rebuild-web rebuild-api smoke seed ps package backup restore

VERSION ?= 1.0.0

help:
	@echo "Targets:"
	@echo "  env              Copy docker/.env.example to docker/.env if missing"
	@echo "  up               Start lean stack (web, api, postgres)"
	@echo "  up-dev           Start with api hot-reload (binds backend source, nodemon)"
	@echo "  up-redis         Start with Redis + worker (async jobs)"
	@echo "  down             Stop containers (keep volumes)"
	@echo "  down-clean       Stop containers AND remove volumes (destroys data)"
	@echo "  logs             Tail logs for api + web"
	@echo "  build            Rebuild images without starting"
	@echo "  rebuild-web      Rebuild + restart ONLY the web container (apply frontend changes)"
	@echo "  rebuild-api      Rebuild + restart ONLY the api container (apply backend changes + migrations)"
	@echo "  backup           Create an immediate compressed backup of PostgreSQL database"
	@echo "  restore FILE=... Restore database from a compressed backup file"
	@echo "  smoke            Run scripts/smoke.sh against running stack"
	@echo "  seed             Run the Postgres baseline seed inside the api container"
	@echo "  ps               docker compose ps"
	@echo "  package          Build CodeCanyon release zips (default VERSION=1.0.0)"
	@echo "  package VERSION=x.y.z  Build release zips with specific version"

env:
	@test -f docker/.env || cp docker/.env.example docker/.env
	@echo "docker/.env ready"

up: env
	$(COMPOSE) up -d --build

up-dev: env
	$(COMPOSE_DEV) up -d --build

up-redis: env
	$(COMPOSE) --profile redis up -d --build

down:
	$(COMPOSE) down

down-clean:
	$(COMPOSE) down -v

logs:
	$(COMPOSE) logs -f --tail=200 api web

build: env
	$(COMPOSE) build

# Frontend (Vite) is compiled into the nginx web image — there is no hot-reload
# in the prod stack, so FE source changes only appear after the web image is
# rebuilt. Use this after any frontend change.
rebuild-web: env
	$(COMPOSE) up -d --build web

# Backend runs migrate deploy + seed via the entrypoint on boot, so this also
# applies any new DB migrations. Use this after any backend change.
rebuild-api: env
	$(COMPOSE) up -d --build api

smoke:
	bash scripts/smoke.sh

seed:
	# Postgres baseline seed (currencies, date/time formats, timezones, module
	# hierarchy, custom-field types). The old node seed*.js scripts targeted the
	# now-removed MongoDB and are intentionally not run here.
	$(COMPOSE) exec api npx prisma db seed

ps:
	$(COMPOSE) ps

# Backup & Restore PostgreSQL database
backup: env
	bash scripts/backup-db.sh

restore: env
	@if [ -z "$(FILE)" ]; then echo "Error: Specify backup file with FILE=path/to/backup.sql.gz"; exit 1; fi
	bash scripts/restore-db.sh "$(FILE)"

# Build CodeCanyon buyer-ready release zips.
# Produces: release/sapar-web-v$(VERSION).zip
#           release/sapar-mobile-addon-v$(VERSION).zip
# Example:  make package VERSION=2.1.0
package:
	bash scripts/package-release.sh $(VERSION)
