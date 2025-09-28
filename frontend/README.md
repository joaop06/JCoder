# Frontend - joaop-dock

Este é o frontend do projeto joaop-dock, um portfólio de aplicações desenvolvido em React com design moderno e clean.

## 🚀 Tecnologias Utilizadas

- **React 19** - Biblioteca para construção de interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI reutilizáveis
- **Lucide React** - Ícones
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP para API
- **Framer Motion** - Animações (pré-instalado)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn/ui
│   ├── ApplicationCard.jsx
│   ├── ApplicationForm.jsx
│   ├── EmptyState.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── LoadingSpinner.jsx
│   ├── PrivateRoute.jsx
│   └── Toast.jsx
├── contexts/           # Context API para estado global
│   ├── ApplicationContext.jsx
│   └── AuthContext.jsx
├── pages/              # Páginas da aplicação
│   ├── AdminDashboard.jsx
│   ├── ApplicationDetail.jsx
│   ├── Home.jsx
│   └── Login.jsx
├── services/           # Serviços para API
│   ├── api.js
│   ├── applicationService.js
│   └── authService.js
├── App.jsx             # Componente principal
└── main.jsx           # Ponto de entrada
```

## 🎯 Funcionalidades

### Para Usuários Públicos
- **Visualização de aplicações**: Lista todas as aplicações disponíveis no portfólio
- **Busca**: Filtro por nome ou descrição das aplicações
- **Detalhes**: Visualização detalhada de cada aplicação
- **Acesso direto**: Links para acessar as aplicações hospedadas

### Para Administradores
- **Autenticação**: Sistema de login com JWT
- **Dashboard administrativo**: Painel para gerenciar aplicações
- **CRUD de aplicações**: Criar, editar e remover aplicações
- **Gerenciamento de ícones**: Upload de ícones para as aplicações

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Instalação
```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview do build
pnpm run preview
```

### Configuração da API
O frontend está configurado para se conectar com o backend em `http://localhost:3000`. Para alterar esta configuração, edite o arquivo `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000', // Altere aqui
  // ...
});
```

## 🎨 Design System

O projeto utiliza um design system baseado em:
- **Cores**: Paleta neutra com acentos em azul
- **Tipografia**: Hierarquia clara com fontes system
- **Espaçamento**: Grid de 4px usando Tailwind
- **Componentes**: shadcn/ui para consistência
- **Ícones**: Lucide React para iconografia

### Temas
O projeto suporta tema claro e escuro através das variáveis CSS definidas no `App.css`.

## 🔐 Autenticação

O sistema de autenticação utiliza:
- **JWT Tokens**: Armazenados no localStorage
- **Context API**: Para gerenciamento de estado de autenticação
- **Rotas protegidas**: Componente `PrivateRoute` para controle de acesso
- **Interceptors**: Axios interceptors para adicionar tokens automaticamente

## 📱 Responsividade

O frontend é totalmente responsivo, funcionando em:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptado com navegação colapsável
- **Mobile**: Interface otimizada para toque

## 🚀 Deploy

Para fazer deploy da aplicação:

1. **Build da aplicação**:
   ```bash
   pnpm run build
   ```

2. **Servir arquivos estáticos**: Os arquivos gerados na pasta `dist/` podem ser servidos por qualquer servidor web (Nginx, Apache, Vercel, Netlify, etc.)

3. **Configurar variáveis de ambiente**: Certifique-se de que a URL da API esteja correta para o ambiente de produção.

## 🔧 Scripts Disponíveis

- `pnpm run dev` - Inicia o servidor de desenvolvimento
- `pnpm run build` - Gera build de produção
- `pnpm run preview` - Preview do build de produção
- `pnpm run lint` - Executa o linter

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🐛 Problemas Conhecidos

- A aplicação requer que o backend esteja rodando para funcionar completamente
- Alguns componentes shadcn/ui podem precisar de instalação adicional dependendo do uso

## 📞 Suporte

Para suporte ou dúvidas, abra uma issue no repositório do projeto.
