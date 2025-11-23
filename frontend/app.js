// Arquivo de inicialização para Passenger/cPanel - Frontend Next.js
// Este arquivo deve estar na raiz do diretório da aplicação no servidor

// Carrega as variáveis de ambiente
require('dotenv').config();

// Importa e executa o servidor Next.js standalone
// O Next.js em modo standalone cria um server.js na pasta .next/standalone/
require('./.next/standalone/server.js');

