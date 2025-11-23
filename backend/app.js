// Arquivo de inicialização para Passenger/cPanel
// Este arquivo deve estar na raiz do diretório da aplicação no servidor

// Carrega as variáveis de ambiente
require('dotenv').config();

// Importa e executa o arquivo principal compilado
require('./dist/main.js');

