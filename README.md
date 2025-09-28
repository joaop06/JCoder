# Planejamento da Arquitetura e Estrutura do Projeto

Este documento detalha o planejamento da arquitetura e estrutura para o projeto de portfólio de aplicações, que será composto por um backend em NestJS com arquitetura DDD, um frontend em React, e utilizará PostgreSQL como banco de dados, tudo orquestrado via Docker Compose.

## 1. Estrutura de Pastas do Projeto

A estrutura de pastas principal será organizada da seguinte forma:

```
.
├── backend/          # Aplicação NestJS (API)
├── frontend/         # Aplicação React (Interface do Usuário)
├── docker/           # Arquivos de configuração Docker (docker-compose.yml, Dockerfiles)
└── README.md         # Documentação geral do projeto
```

## 2. Backend (NestJS com Arquitetura DDD)

O backend será desenvolvido utilizando NestJS, um framework progressivo Node.js para construir aplicações eficientes, escaláveis e confiáveis. A arquitetura Domain-Driven Design (DDD) será aplicada para garantir uma separação clara de responsabilidades e facilitar a manutenção e evolução do sistema.

### 2.1. Camadas da Arquitetura DDD

- **Domínio (Domain):** Contém a lógica de negócio central, entidades, objetos de valor, agregados, repositórios (interfaces) e serviços de domínio. É independente de qualquer tecnologia de infraestrutura.
- **Aplicação (Application):** Orquestra a lógica de domínio para realizar casos de uso específicos. Contém DTOs (Data Transfer Objects) e serviços de aplicação que coordenam as operações.
- **Infraestrutura (Infrastructure):** Implementa as interfaces definidas no domínio (repositórios), lida com a persistência de dados (PostgreSQL), comunicação externa (APIs), e outras preocupações técnicas.
- **Apresentação (Presentation/API):** Camada de entrada que expõe os endpoints da API. Contém controladores (controllers) que recebem requisições HTTP, validam DTOs e chamam os serviços de aplicação.

### 2.2. Módulos Principais

Os módulos principais do backend incluirão:

- **Auth:** Gerenciamento de autenticação e autorização (login, registro, JWT).
- **Applications:** CRUD para as aplicações/serviços do portfólio.
- **Users:** Gerenciamento de usuários (especialmente o admin).

### 2.3. Autenticação e Autorização

Será implementado um sistema de autenticação baseado em JWT (JSON Web Tokens). Apenas usuários com perfil de `admin` terão permissão para cadastrar novas aplicações.

## 3. Frontend (React)

O frontend será construído com React, uma biblioteca JavaScript para construir interfaces de usuário. Será uma Single Page Application (SPA).

### 3.1. Componentes Principais

- **Página Principal (Home):** Listagem das aplicações cadastradas, semelhante a um marketplace.
- **Detalhes da Aplicação:** Exibição de informações detalhadas de uma aplicação (URL, documentação, descrição, redirecionamento).
- **Dashboard Admin:** Interface para o administrador cadastrar, editar e remover aplicações.
- **Login:** Página de login para o administrador.

### 3.2. Gerenciamento de Estado

Será utilizado o Context API ou Redux (se a complexidade justificar) para gerenciamento de estado global.

## 4. Banco de Dados (PostgreSQL)

O PostgreSQL será o banco de dados relacional utilizado para armazenar as informações das aplicações e dos usuários.

## 5. Docker Compose

O Docker Compose será utilizado para orquestrar os serviços do backend, frontend e banco de dados, facilitando o desenvolvimento, teste e implantação.

### 5.1. Serviços

- `backend`: Contêiner para a aplicação NestJS.
- `frontend`: Contêiner para a aplicação React (servindo os arquivos estáticos).
- `db`: Contêiner para o banco de dados PostgreSQL.

## 6. Próximos Passos

1. Configurar o ambiente Docker e PostgreSQL.
2. Iniciar o desenvolvimento do backend NestJS.
3. Iniciar o desenvolvimento do frontend React.
4. Integrar e testar o sistema.
5. Empacotar o projeto.
