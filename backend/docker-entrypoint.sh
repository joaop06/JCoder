#!/bin/sh
set -e

echo "Aguardando banco de dados estar disponível..."

# Função para verificar se o banco está disponível
wait_for_db() {
  host="${BACKEND_DATABASE_HOST:-database}"
  port="${BACKEND_DATABASE_PORT:-3306}"
  
  # Tenta conectar usando netcat
  until nc -z "$host" "$port" 2>/dev/null; do
    echo "Aguardando banco de dados em $host:$port..."
    sleep 2
  done
  
  echo "Banco de dados está disponível!"
}

# Aguarda o banco estar disponível
wait_for_db

# Define NODE_ENV como production para usar migrations compiladas
export NODE_ENV=production

# Executa as migrations
echo "Executando migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/@common/database/data-source.js

echo "Migrations executadas com sucesso!"

# Executa o comando passado como argumento
exec "$@"

