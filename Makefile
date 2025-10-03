####################
#      DOCKER      #
####################
down:
	docker compose down
up:
	make down && docker compose up -d --build


# Reload individual das aplicações
down.b:
	docker compose down backend
up.b:
	make down.b && docker compose up -d --build backend

down.d:
	docker compose down database
up.d:
	make down.d && docker compose up -d --build database

down.d:
	docker compose down frontend
up.f:
	make down.f && docker compose up -d --build frontend


####################
#    LOCALHOST     #
####################
start.b:
	make env
	make up.d
	make down.b
	cd backend && npm run start:dev

start.f:
	make env
	make down.f
	cd frontend && npm run dev

.PHONY: env

ifeq ($(OS),Windows_NT)
env:
	@powershell -NoProfile -Command "if (-not (Test-Path '.env')) { throw '.env não encontrado' }"
	@powershell -NoProfile -Command "New-Item -ItemType Directory -Path './backend' -Force | Out-Null"
	@powershell -NoProfile -Command "New-Item -ItemType Directory -Path './frontend' -Force | Out-Null"
	@powershell -NoProfile -Command "Copy-Item -Force '.env' './backend/.env'"
	@powershell -NoProfile -Command "Copy-Item -Force '.env' './frontend/.env'"

else
env:
	@test -f .env
	@mkdir -p ./backend ./frontend
	@cp -f .env ./backend/.env
	@cp -f .env ./frontend/.env
endif