# UI Components - Optimized for Mobile Performance

Esta pasta contém componentes UI otimizados e reutilizáveis, projetados especialmente para aplicações mobile-first.

## 📦 Componentes Disponíveis

### 1. LazyImage

Componente de imagem otimizado com lazy loading usando Intersection Observer.

#### Características
- ✅ Carrega imagens apenas quando próximas do viewport
- ✅ Exibe skeleton/placeholder durante carregamento
- ✅ Fallback automático em caso de erro
- ✅ Transição suave (fade-in)
- ✅ Otimizações nativas (`loading="lazy"`, `decoding="async"`)
- ✅ Totalmente customizável

#### Uso Básico

```tsx
import { LazyImage } from '@/components/ui';

// Exemplo simples
<LazyImage
  src="/path/to/image.jpg"
  alt="Descrição da imagem"
  fallback="Nome para avatar"
  size="medium"
/>
```

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `src` | `string` | - | URL da imagem (obrigatório) |
| `alt` | `string` | - | Texto alternativo (obrigatório) |
| `fallback` | `string` | - | Texto para avatar fallback (obrigatório) |
| `size` | `'small' \| 'medium' \| 'large' \| 'custom'` | `'medium'` | Tamanho predefinido |
| `width` | `string` | - | Classe de largura (apenas com `size="custom"`) |
| `height` | `string` | - | Classe de altura (apenas com `size="custom"`) |
| `className` | `string` | `''` | Classes CSS adicionais |
| `rootMargin` | `string` | `'50px'` | Distância antes do viewport para começar a carregar |
| `threshold` | `number` | `0.01` | Threshold do Intersection Observer |
| `fallbackBg` | `string` | `'bg-jcoder-gradient'` | Background do fallback avatar |
| `fallbackTextColor` | `string` | `'text-black'` | Cor do texto do fallback |
| `showSkeleton` | `boolean` | `true` | Exibir skeleton durante carregamento |
| `rounded` | `string` | `'rounded-lg'` | Classe de border-radius |
| `objectFit` | `string` | `'object-contain'` | Classe de object-fit |

#### Exemplos Avançados

```tsx
// Tamanho pequeno
<LazyImage
  src={imageUrl}
  alt="Tech logo"
  fallback="React"
  size="small"
  className="bg-white p-2"
/>

// Tamanho customizado
<LazyImage
  src={imageUrl}
  alt="Banner"
  fallback="Banner"
  size="custom"
  width="w-full"
  height="h-48"
  objectFit="object-cover"
/>

// Sem skeleton
<LazyImage
  src={imageUrl}
  alt="Avatar"
  fallback="John Doe"
  size="medium"
  showSkeleton={false}
/>

// Carregamento antecipado
<LazyImage
  src={imageUrl}
  alt="Hero image"
  fallback="Hero"
  rootMargin="200px" // Começa a carregar 200px antes
/>
```

---

### 2. TableSkeleton

Skeleton loader genérico para tabelas com suporte responsivo.

#### Características
- ✅ Versões separadas para desktop e mobile
- ✅ Configuração customizável de colunas
- ✅ Animação de pulse suave
- ✅ Totalmente responsivo

#### Uso Básico

```tsx
import { TableSkeleton } from '@/components/ui';

// Exemplo simples
<TableSkeleton rows={5} />
```

#### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `rows` | `number` | `5` | Número de linhas no skeleton (desktop) |
| `mobileRows` | `number` | `rows` | Número de linhas no mobile |
| `columns` | `TableSkeletonColumn[]` | - | Configuração das colunas |
| `headerColumns` | `string[]` | - | Labels do cabeçalho (opcional) |
| `showHeader` | `boolean` | `true` | Exibir cabeçalho da tabela |
| `containerClass` | `string` | `''` | Classes CSS adicionais |

#### Column Configuration

```typescript
interface TableSkeletonColumn {
  width: string;           // Classe de largura (ex: 'w-32')
  align?: 'left' | 'center' | 'right';
  height?: string;         // Classe de altura customizada
  circular?: boolean;      // Skeleton circular (para avatares)
}
```

#### Exemplos Avançados

```tsx
// Skeleton customizado
<TableSkeleton
  rows={10}
  mobileRows={5}
  columns={[
    { width: 'w-12', align: 'center', circular: true }, // Avatar
    { width: 'w-40', align: 'left', height: 'h-6' },   // Nome
    { width: 'w-24', align: 'center' },                 // Status
    { width: 'w-32', align: 'right' },                  // Data
  ]}
  headerColumns={['Avatar', 'Nome', 'Status', 'Data']}
/>

// Sem cabeçalho
<TableSkeleton
  rows={3}
  showHeader={false}
/>
```

---

## 🎣 Hooks

### useIntersectionObserver

Hook customizado para detectar quando um elemento entra no viewport.

#### Uso

```tsx
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useRef } from 'react';

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, {
    rootMargin: '100px',
    threshold: 0.5,
    once: true, // Apenas dispara uma vez
  });

  return (
    <div ref={ref}>
      {isInView ? <HeavyComponent /> : <Placeholder />}
    </div>
  );
}
```

#### Options

| Option | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `rootMargin` | `string` | `'0px'` | Margem ao redor do root |
| `threshold` | `number \| number[]` | `0` | Threshold para intersecção |
| `root` | `Element \| null` | `null` | Elemento root (viewport por padrão) |
| `once` | `boolean` | `true` | Desconectar após primeira intersecção |
| `enabled` | `boolean` | `true` | Se o hook está habilitado |

---

## 🚀 Performance Tips

### LazyImage

1. **Use `rootMargin` apropriado**: Para conexões lentas, use valores maiores (ex: `"200px"`)
2. **Tamanhos predefinidos**: Use `small`, `medium`, `large` quando possível para consistência
3. **Desative skeleton quando não necessário**: Use `showSkeleton={false}` para casos simples

### TableSkeleton

1. **Ajuste `rows` e `mobileRows`**: Menos linhas = carregamento inicial mais rápido
2. **Configure apenas colunas necessárias**: Não adicione colunas extras que não serão usadas

### Geral

1. **Combine com React.memo**: Memoize componentes que usam esses recursos
2. **Use useCallback**: Para handlers passados como props
3. **Evite re-renders**: Mantenha dados de imagem em estado estável

---

## 📱 Considerações Mobile

Estes componentes foram projetados pensando em mobile:

- **Lazy loading agressivo**: Economiza dados móveis
- **Skeleton loading**: Melhora percepção de performance
- **Transições suaves**: Melhor UX em telas touch
- **Responsive by default**: Funciona perfeitamente em todos os tamanhos

---

## 🔧 Customização

### Temas

Os componentes respeitam as variáveis CSS do projeto:

- `bg-jcoder-gradient`: Gradient principal
- `bg-jcoder-secondary`: Background secundário
- `bg-jcoder-card`: Background de cards
- `text-jcoder-foreground`: Texto principal
- `border-jcoder`: Bordas

### Tailwind Classes

Todos os componentes aceitam classes Tailwind customizadas via prop `className`.

---

## 📖 Exemplos Práticos

### Lista de Tecnologias

```tsx
{technologies.map((tech) => (
  <div key={tech.id} className="flex items-center gap-4">
    <LazyImage
      src={tech.imageUrl}
      alt={tech.name}
      fallback={tech.name}
      size="small"
      className="bg-white p-2"
    />
    <span>{tech.name}</span>
  </div>
))}
```

### Tabela de Usuários

```tsx
{loading ? (
  <TableSkeleton
    rows={10}
    columns={[
      { width: 'w-12', circular: true },
      { width: 'w-48' },
      { width: 'w-32' },
      { width: 'w-24' },
    ]}
  />
) : (
  <UsersTable data={users} />
)}
```

---

## 🐛 Troubleshooting

### Imagens não carregam

- Verifique se a URL está correta
- Verifique CORS se as imagens vêm de outro domínio
- Verifique o console para erros

### Skeleton não aparece

- Certifique-se que `showSkeleton={true}`
- Verifique se as classes Tailwind estão sendo aplicadas
- Verifique se `animate-pulse` está disponível no Tailwind

### Performance ruim

- Reduza o número de imagens visíveis simultaneamente
- Aumente `rootMargin` para carregar antecipadamente
- Use `size` predefinidos ao invés de `custom`

---

## 📝 Notas

- Estes componentes são **client-side only** (`'use client'`)
- Requerem **React 18+**
- Compatíveis com **Next.js 13+** (App Router)
- Requerem **Tailwind CSS**

---

## 🤝 Contribuindo

Ao adicionar novos componentes UI otimizados:

1. Siga o padrão de nomenclatura
2. Adicione TypeScript types completos
3. Documente com JSDoc
4. Adicione exemplos de uso
5. Teste em dispositivos móveis reais
6. Atualize este README

