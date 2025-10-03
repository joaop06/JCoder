FROM node:23.11.1
WORKDIR /app

# Copia os arquivos do backend (ajuste conforme seu projeto)
COPY backend/package*.json ./
RUN npm ci

COPY backend ./

RUN npm install
RUN npm run build

# Copia o .env da raiz para dentro da imagem (ex: /app/.env)
COPY .env .env

CMD ["npm", "run", "start:prod"]
