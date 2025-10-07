# JDock Portfolio - Frontend Next.js

## 📋 Sobre o Projeto

**JDock Portfolio** é uma aplicação frontend desenvolvida em **Next.js 15** com **TypeScript** e **Tailwind CSS**, projetada para gerenciar e exibir um portfólio de aplicações de forma minimalista e profissional.

O projeto foi desenvolvido com base na estrutura de entidades do backend (NestJS + TypeORM) e nas interfaces visuais fornecidas, seguindo princípios de design minimalista com foco em simplicidade, clareza e usabilidade.

## 🎯 Funcionalidades Implementadas

### Páginas Públicas
- **Home (`/`)**: Listagem de aplicações com busca e paginação
- **Detalhes da Aplicação (`/applications/[id]`)**: Visualização completa de uma aplicação com seus módulos (API, Frontend, Mobile, Library)
- **Login (`/login`)**: Autenticação para administradores

### Páginas Administrativas
- **Painel Admin (`/admin`)**: Dashboard com estatísticas e gerenciamento de aplicações
  - Total de aplicações
  - Aplicações ativas
  - Última atualização
  - Tabela com CRUD de aplicações

## 🏗️ Estrutura do Projeto

```
jdock-portfolio/
├── app/
│   ├── page.tsx                      # Home - Listagem de aplicações
│   ├── login/
│   │   └── page.tsx                  # Página de login
│   ├── applications/
│   │   └── [id]/
│   │       └── page.tsx              # Detalhes da aplicação
│   ├── admin/
│   │   └── page.tsx                  # Painel administrativo
│   ├── globals.css                   # Estilos globais
│   └── layout.tsx                    # Layout principal
├── components/
│   ├── Header.tsx                    # Componente de cabeçalho
│   ├── Footer.tsx                    # Componente de rodapé
│   └── ApplicationCard.tsx           # Card de aplicação
├── types/
│   └── index.ts                      # Definições TypeScript
└── public/                           # Arquivos estáticos
```

## 🎨 Design System

### Paleta de Cores
- **Background**: `#ffffff` (Branco)
- **Foreground**: `#000000` (Preto)
- **Accent**: `#22c55e` (Verde)
- **Secondary**: `#f5f5f5` (Cinza claro)
- **Border**: `#e5e5e5` (Cinza borda)

### Tipografia
- Fonte: System fonts (San Francisco, Segoe UI, Roboto)
- Estilo: Clean, minimalista, alta legibilidade

### Componentes
- Bordas arredondadas sutis (`rounded-lg`)
- Sombras suaves para elevação
- Transições suaves em hover states
- Ícones SVG inline

## 🔧 Tecnologias Utilizadas

- **Next.js 15.5.4**: Framework React com App Router
- **React 19**: Biblioteca para construção de interfaces
- **TypeScript 5.9**: Tipagem estática
- **Tailwind CSS 4.1**: Framework CSS utility-first
- **pnpm**: Gerenciador de pacotes

## 📦 Estrutura de Dados

O projeto utiliza as seguintes entidades principais:

### User
```typescript
interface User {
  id: number;
  email: string;
  role: RoleEnum;
  applications?: Application[];
}
```

### Application
```typescript
interface Application {
  id: number;
  name: string;
  description: string;
  applicationType: ApplicationTypeEnum;
  githubUrl?: string;
  isActive: boolean;
  // Componentes opcionais
  applicationComponentApi?: ApplicationComponentApi;
  applicationComponentFrontend?: ApplicationComponentFrontend;
  applicationComponentMobile?: ApplicationComponentMobile;
  applicationComponentLibrary?: ApplicationComponentLibrary;
}
```

### Tipos de Aplicação Suportados
- **Fullstack**: API + Frontend
- **API**: Apenas backend/API
- **Frontend**: Apenas frontend
- **Mobile**: Aplicativo móvel (Android/iOS)
- **Library**: Biblioteca/Package

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- pnpm instalado (`npm install -g pnpm`)

### Instalação

```bash
# Navegar para o diretório do projeto
cd jdock-portfolio

# Instalar dependências
pnpm install

# Executar em modo de desenvolvimento
pnpm run dev
```

O projeto estará disponível em: **http://localhost:3000**

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Executar versão de produção
pnpm run start

# Linting
pnpm run lint
```

## 🔐 Autenticação

Atualmente, o projeto utiliza autenticação mock com localStorage. Para fazer login como administrador:

1. Acesse `/login`
2. Digite qualquer email e senha
3. Você será redirecionado para `/admin`

**Nota**: Em produção, isso deve ser substituído por autenticação real com JWT/OAuth.

## 📝 Próximos Passos

### Funcionalidades a Implementar
1. **Integração com API Backend**
   - Substituir dados mock por chamadas reais à API
   - Implementar autenticação JWT
   - Adicionar interceptors para tratamento de erros

2. **CRUD Completo de Aplicações**
   - Página de criação de aplicação
   - Página de edição de aplicação
   - Upload de screenshots
   - Validação de formulários

3. **Paginação Real**
   - Implementar paginação server-side
   - Adicionar controles de navegação
   - Mostrar total de páginas

4. **Filtros Avançados**
   - Filtrar por tipo de aplicação
   - Filtrar por status (ativo/inativo)
   - Ordenação customizada

5. **Melhorias de UX**
   - Loading states
   - Error boundaries
   - Toast notifications
   - Confirmações de ações

6. **SEO e Performance**
   - Meta tags dinâmicas
   - Open Graph tags
   - Otimização de imagens
   - Lazy loading

## 🎯 Decisões de Design

### Por que Next.js?
- **SSR/SSG**: Melhor SEO e performance inicial
- **App Router**: Roteamento moderno e intuitivo
- **TypeScript**: Segurança de tipos
- **Turbopack**: Build mais rápido

### Por que Tailwind CSS?
- **Utility-first**: Desenvolvimento rápido
- **Customização**: Fácil de adaptar ao design system
- **Performance**: CSS otimizado automaticamente
- **Responsividade**: Classes responsivas built-in

### Arquitetura de Componentes
- **Componentes reutilizáveis**: Header, Footer, ApplicationCard
- **Separação de concerns**: Lógica separada da apresentação
- **Client Components**: Para interatividade (useState, useEffect)
- **Tipagem forte**: Todas as props e estados tipados

## 📄 Licença

Este projeto foi desenvolvido como exemplo de portfólio de aplicações.

## 👨‍💻 Autor

Desenvolvido com base nas especificações e designs fornecidos.

---

**Última atualização**: Outubro 2025
