FROM node:23.11.1
WORKDIR /app

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

RUN npm run migration:run

CMD ["pnpm", "run", "start:prod"]
