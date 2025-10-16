# Sistema de Temas JCoder

Este diretório contém a implementação completa do sistema de temas para a aplicação JCoder, permitindo alternar entre tema escuro e claro com total consistência visual.

## 🎨 Características dos Temas

### Tema Escuro (Padrão)
- **Background**: Gradientes azuis escuros com efeitos radiais
- **Cores primárias**: Ciano (#00e5ff) e Azul claro (#00ffff)
- **Cards**: Fundo escuro (#0f0f0f) com bordas sutis
- **Texto**: Branco (#ffffff) com variações de cinza para hierarquia
- **Baseado na identidade visual original da logo JCoder**

### Tema Claro
- **Background**: Gradientes azuis claros sobre branco
- **Cores primárias**: Azul (#0066cc) e Azul escuro (#0052a3)
- **Cards**: Fundo claro (#f9fafb) com bordas definidas
- **Texto**: Cinza escuro (#111827) com boa legibilidade
- **Mantém a identidade visual com contraste adequado**

## 🧩 Componentes

### ThemeContext.tsx
Contexto React que gerencia o estado global do tema:
- ✅ Detecta preferência do sistema operacional
- ✅ Persiste a escolha do usuário no localStorage
- ✅ Fornece função para alternar entre temas
- ✅ Evita problemas de hidratação com SSR
- ✅ Transições suaves entre temas

### ThemeToggle.tsx
Componente de botão para alternar entre temas:
- ✅ Ícones animados (sol/lua) com transições suaves
- ✅ Suporte a diferentes tamanhos (sm, md, lg)
- ✅ Acessibilidade completa com ARIA labels
- ✅ Estados visuais para hover e focus
- ✅ Integração perfeita com o design system

## 🎯 Uso

```tsx
import { ThemeProvider, useTheme, ThemeToggle } from '@/components/theme';

// No layout principal
<ThemeProvider>
  <App />
</ThemeProvider>

// Em qualquer componente
const { theme, toggleTheme } = useTheme();

// Botão de alternar tema
<ThemeToggle size="sm" showLabel={true} />
```

## 🎨 CSS Variables

O sistema utiliza CSS custom properties que são automaticamente atualizadas:

### Variáveis Principais
```css
:root {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --card: #0f0f0f;
  --primary: #00e5ff;
  --secondary: #1a1a1a;
  --border: #333333;
  /* ... outras variáveis */
}

[data-theme="light"] {
  --background: #ffffff;
  --foreground: #111827;
  --card: #f9fafb;
  --primary: #0066cc;
  --secondary: #f3f4f6;
  --border: #d1d5db;
  /* ... variáveis do tema claro */
}
```

### Variáveis Adicionais
- `--text-white` / `--text-black`: Cores de texto adaptáveis
- `--text-gray-*`: Tons de cinza para hierarquia
- `--bg-gray-*`: Cores de fundo para elementos
- `--border-gray-*`: Cores de borda
- `--shadow-color` / `--shadow-primary`: Sombras adaptáveis

## 🔧 Classes Utilitárias

### Backgrounds
- `.bg-jcoder-card`: Fundo de cards
- `.bg-jcoder-secondary`: Fundo secundário
- `.bg-jcoder-gradient`: Gradiente primário

### Textos
- `.text-jcoder-primary`: Cor primária
- `.text-jcoder-accent`: Cor de destaque
- `.text-jcoder-muted`: Texto secundário
- `.text-white` / `.text-black`: Cores adaptáveis

### Bordas e Efeitos
- `.border-jcoder`: Borda padrão
- `.border-jcoder-primary`: Borda primária
- `.shadow-jcoder-primary`: Sombra primária
- `.hover:shadow-jcoder-primary`: Sombra no hover

## 📱 Integração

O tema está integrado em:
- ✅ **Header**: Botão de alternar tema disponível para todos os usuários
- ✅ **Layout**: Provider configurado no layout principal
- ✅ **Estilos globais**: Transições suaves entre temas
- ✅ **Componentes**: Todos os componentes usam variáveis CSS
- ✅ **Responsivo**: Funciona perfeitamente em desktop e mobile

## 🚀 Funcionalidades Técnicas

- **Persistência**: A escolha do tema é salva no localStorage
- **Detecção Automática**: Respeita a preferência do sistema operacional
- **Transições Suaves**: Animações de 300ms entre mudanças de tema
- **SSR Compatible**: Evita problemas de hidratação
- **Acessível**: Labels ARIA e suporte a navegação por teclado
- **Performance**: Mudanças de tema são instantâneas

## 🎯 Consistência Visual

O sistema garante que todos os elementos visuais sejam adequadamente ajustados:
- ✅ **Legibilidade**: Contraste adequado em ambos os temas
- ✅ **Hierarquia**: Diferentes tons para diferentes níveis de informação
- ✅ **Identidade**: Mantém a identidade visual da marca JCoder
- ✅ **Acessibilidade**: Atende padrões de contraste WCAG
- ✅ **Experiência**: Transições suaves e naturais
