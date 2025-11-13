FROM node:23.11.1
WORKDIR /app

# Install netcat for database health check
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Enable pnpm via corepack
RUN corepack enable

# Copy only the manifests for better caching
COPY backend/package.json ./package.json
COPY backend/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with pnpm (respects the lockfile)
RUN pnpm install --frozen-lockfile

COPY backend/ ./

# Build
RUN pnpm run build

# Copy entrypoint script
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["pnpm", "run", "start:prod"]
