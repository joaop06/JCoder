down:
	docker compose down

up:
	make down && docker compose up -d --build


# Reload Backend
up.b:
	docker compose down backend && docker compose up -d --build backend

# Reload Database
up.d:
	docker compose down database && docker compose up -d --build database

# Reload Frontend
up.f:
	docker compose down frontend && docker compose up -d --build frontend
