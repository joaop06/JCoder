# Step 1: Dependences
FROM node:20-alpine AS deps
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Copy only the manifests for better caching
COPY frontend/package.json ./package.json
COPY frontend/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with pnpm (respects the lockfile)
RUN pnpm install --frozen-lockfile

# Step 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Copy node_modules from the deps step
COPY --from=deps /app/node_modules ./node_modules

# Copy the frontend code (without node_modules from the host)
COPY frontend/ ./

# If you need build envs (NEXT_PUBLIC_*), define them with ARG/ENV.
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=${NEXT_PUBLIC_BACKEND_BASE_URL}

# Build
RUN pnpm run build

# Step 3: Runtime (standalone)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80

# Copy standalone artifacts
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Next server listening on port 80 and at 0.0.0.0
EXPOSE 80
CMD ["node", "server.js"]
