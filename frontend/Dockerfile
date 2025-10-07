# Etapa 1: Dependências
FROM node:20-alpine AS deps
WORKDIR /app

# Habilita pnpm via corepack
RUN corepack enable

# Copia apenas os manifests para melhor cache
COPY frontend/package.json ./package.json
COPY frontend/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala dependências com pnpm (respeita o lockfile)
RUN pnpm install --frozen-lockfile

# Etapa 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# Copia node_modules da etapa deps
COPY --from=deps /app/node_modules ./node_modules

# Copia o código do frontend (sem node_modules do host)
COPY frontend/ ./

# Garanta no next.config.ts:
#   export default { output: 'standalone' }
# ou em next.config.js:
#   module.exports = { output: 'standalone' }

# Se precisar de envs de build (NEXT_PUBLIC_*), defina-as com ARG/ENV
ARG NEXT_PUBLIC_BACKEND_BASE_URL
ENV NEXT_PUBLIC_BACKEND_BASE_URL=${NEXT_PUBLIC_BACKEND_BASE_URL}

# Build
RUN pnpm run build

# Etapa 3: Runtime (standalone)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80

# Copia artefatos standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 80
# Servidor do Next ouvindo na porta 80 e em 0.0.0.0
CMD ["node", "server.js"]