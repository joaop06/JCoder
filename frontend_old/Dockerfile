FROM node:23.11.1 as builder
WORKDIR /app

# Copia os arquivos do backend (ajuste conforme seu projeto)
COPY frontend/package*.json ./
# RUN npm ci

COPY frontend ./

RUN npm install --legacy-peer-deps
RUN npm run build

# Copia o .env da raiz para dentro da imagem (ex: /app/.env)
COPY .env .env

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
