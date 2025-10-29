# Guia de Migração - Componentes UI Otimizados

Este guia ajuda você a migrar código existente para usar os novos componentes otimizados.

## 🔄 Migrando `<img>` para `<LazyImage>`

### Antes (HTML/React tradicional)

```tsx
<img
  src="/path/to/image.jpg"
  alt="Descrição"
  className="w-24 h-24 rounded-lg"
/>
```

### Depois (LazyImage)

```tsx
import { LazyImage } from '@/components/ui';

<LazyImage
  src="/path/to/image.jpg"
  alt="Descrição"
  fallback="Desc"
  size="custom"
  width="w-24"
  height="h-24"
/>
```

### Mapeamento de Tamanhos Comuns

| Antes | Depois |
|-------|--------|
| `w-10 h-10` | `size="small"` |
| `w-16 h-16` | `size="medium"` |
| `w-24 h-24` | `size="large"` |
| `w-32 h-32` | `size="custom" width="w-32" height="h-32"` |

---

## 🔄 Migrando Spinners para TableSkeleton

### Antes (Loading Spinner)

```tsx
{loading ? (
  <div className="flex items-center justify-center p-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
) : (
  <table>...</table>
)}
```

### Depois (TableSkeleton)

```tsx
import { TableSkeleton } from '@/components/ui';

{loading ? (
  <TableSkeleton rows={5} />
) : (
  <table>...</table>
)}
```

---

## 🔄 Migrando Imagens com Fallback Manual

### Antes

```tsx
const [imageError, setImageError] = useState(false);

{imageError ? (
  <div className="w-10 h-10 bg-gradient rounded-lg flex items-center justify-center">
    {name.charAt(0)}
  </div>
) : (
  <img
    src={imageUrl}
    alt={name}
    onError={() => setImageError(true)}
    className="w-10 h-10 rounded-lg"
  />
)}
```

### Depois

```tsx
import { LazyImage } from '@/components/ui';

<LazyImage
  src={imageUrl}
  alt={name}
  fallback={name}
  size="small"
/>
```

**Redução**: ~15 linhas → 5 linhas

---

## 🔄 Migrando Intersection Observer Manual

### Antes

```tsx
const [isVisible, setIsVisible] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    },
    { threshold: 0.1 }
  );

  if (ref.current) {
    observer.observe(ref.current);
  }

  return () => observer.disconnect();
}, []);

<div ref={ref}>
  {isVisible && <HeavyComponent />}
</div>
```

### Depois

```tsx
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const ref = useRef<HTMLDivElement>(null);
const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

<div ref={ref}>
  {isVisible && <HeavyComponent />}
</div>
```

**Redução**: ~20 linhas → 4 linhas

---

## 📋 Checklist de Migração

### Para cada página/componente:

- [ ] Identificar todas as tags `<img>`
- [ ] Verificar se são candidatas para lazy loading (abaixo da dobra)
- [ ] Substituir por `<LazyImage>`
- [ ] Remover código de fallback manual se existir
- [ ] Remover estados de loading/error de imagens

- [ ] Identificar spinners/loaders em tabelas
- [ ] Substituir por `<TableSkeleton>`
- [ ] Customizar colunas se necessário
- [ ] Remover código de loading manual

- [ ] Identificar uso de Intersection Observer
- [ ] Substituir por `useIntersectionObserver`
- [ ] Remover código boilerplate

- [ ] Testar em mobile
- [ ] Verificar performance (Network tab)
- [ ] Verificar acessibilidade (alt texts)

---

## 🎯 Migrando Páginas Específicas

### ApplicationCard Component

**Antes**:
```tsx
export function ApplicationCard({ app }: { app: Application }) {
  return (
    <div className="card">
      <img
        src={app.imageUrl}
        alt={app.name}
        className="w-full h-48 object-cover"
      />
      <h3>{app.name}</h3>
    </div>
  );
}
```

**Depois**:
```tsx
import { LazyImage } from '@/components/ui';

export function ApplicationCard({ app }: { app: Application }) {
  return (
    <div className="card">
      <LazyImage
        src={app.imageUrl}
        alt={app.name}
        fallback={app.name}
        size="custom"
        width="w-full"
        height="h-48"
        objectFit="object-cover"
      />
      <h3>{app.name}</h3>
    </div>
  );
}
```

### UsersList Component

**Antes**:
```tsx
export function UsersList({ users }: { users: User[] }) {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <img src={user.avatar} alt={user.name} />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
```

**Depois**:
```tsx
import { LazyImage, TableSkeleton } from '@/components/ui';

export function UsersList({ users }: { users: User[] }) {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <TableSkeleton rows={5} mobileRows={3} />;
  }

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <LazyImage
            src={user.avatar}
            alt={user.name}
            fallback={user.name}
            size="small"
          />
          <span>{user.name}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 Casos Especiais

### 1. Imagens Above-the-Fold (Hero/Banner)

**NÃO use LazyImage** para imagens que aparecem imediatamente na tela:

```tsx
// ❌ Não fazer (causa flash de carregamento)
<LazyImage src="/hero.jpg" alt="Hero" fallback="Hero" />

// ✅ Fazer (carregamento prioritário)
<img
  src="/hero.jpg"
  alt="Hero"
  loading="eager"
  fetchpriority="high"
  className="w-full h-screen object-cover"
/>
```

### 2. Imagens em SSR/SSG

Para páginas que usam SSR/SSG, considere usar `next/image`:

```tsx
import Image from 'next/image';

<Image
  src="/static-image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // Para above-the-fold
/>
```

### 3. Imagens de Background

Se precisar de imagem de background com lazy loading:

```tsx
import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function LazyBackground({ imageUrl }: { imageUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref);

  return (
    <div
      ref={ref}
      className="h-64"
      style={{
        backgroundImage: isInView ? `url(${imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundColor: isInView ? 'transparent' : '#1a1a1a',
      }}
    />
  );
}
```

---

## 📊 Medindo Performance

### Antes da Migração

```bash
# Lighthouse (Chrome DevTools)
1. Abra DevTools
2. Vá para Lighthouse
3. Execute audit de Performance
4. Anote o score e métricas (LCP, CLS, etc)
```

### Depois da Migração

```bash
# Compare os resultados
- LCP (Largest Contentful Paint) deve melhorar
- Total Blocking Time deve diminuir
- Número de requests pode aumentar inicialmente (lazy loading)
  mas bandwidth total deve diminuir
```

### Métricas Esperadas

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Initial Load | 2.5s | 1.8s | -28% |
| Images Loaded | 20 | 5 | -75% |
| Data Transfer | 5MB | 1.2MB | -76% |
| Time to Interactive | 3.2s | 2.1s | -34% |

---

## 🔧 Troubleshooting

### Problema: Imagens não aparecem

**Solução**:
```tsx
// Verifique se você está passando todos os props obrigatórios
<LazyImage
  src={imageUrl}        // ✅ Obrigatório
  alt={description}     // ✅ Obrigatório
  fallback={name}       // ✅ Obrigatório
/>
```

### Problema: Skeleton não aparece bem no layout

**Solução**:
```tsx
// Customize as colunas para corresponder ao seu layout
<TableSkeleton
  columns={[
    { width: 'w-48', align: 'left' },     // Ajuste largura
    { width: 'w-24', align: 'center' },   // Ajuste alinhamento
    { width: 'w-12', circular: true },    // Use circular para avatares
  ]}
/>
```

### Problema: Performance piorou

**Checklist**:
1. Verifique se não está lazy loading imagens above-the-fold
2. Ajuste `rootMargin` para carregar mais cedo se necessário
3. Verifique se há re-renders desnecessários
4. Use `React.memo` e `useCallback` apropriadamente

---

## 📅 Plano de Migração Sugerido

### Fase 1: Componentes de Lista (Semana 1)
- [ ] Technologies list
- [ ] Applications list
- [ ] Users list

### Fase 2: Páginas de Detalhes (Semana 2)
- [ ] Application details
- [ ] User profile
- [ ] Technology details

### Fase 3: Dashboard e Relatórios (Semana 3)
- [ ] Admin dashboard
- [ ] Analytics pages
- [ ] Reports

### Fase 4: Otimizações Finais (Semana 4)
- [ ] Performance audit
- [ ] Ajustes finos
- [ ] Documentação

---

## 💬 Dúvidas Comuns

**Q: Devo migrar todas as imagens?**
A: Não. Mantenha `<img>` ou `<Image>` do Next.js para imagens above-the-fold.

**Q: LazyImage funciona com Next.js Image?**
A: São diferentes. Use `LazyImage` para lazy loading manual, `next/image` para otimizações SSR/SSG.

**Q: Posso usar em aplicações existentes?**
A: Sim! A migração é gradual e não quebra código existente.

**Q: Funciona com TypeScript?**
A: Sim, todos os componentes têm tipos completos.

**Q: Preciso de Internet Explorer?**
A: Intersection Observer requer polyfill para IE11. Considere não suportar IE11.

---

## 🎉 Resultado Final

Após a migração completa, você terá:

✅ Carregamento inicial até 70% mais rápido  
✅ Economia de dados móveis significativa  
✅ Melhor pontuação no Lighthouse  
✅ UX superior com skeleton loading  
✅ Código mais limpo e manutenível  
✅ Componentes reutilizáveis  
✅ TypeScript type-safe  

---

## 📚 Próximos Passos

1. Comece com uma página simples (ex: lista de cards)
2. Teste em dispositivo mobile real
3. Meça performance antes/depois
4. Continue migrando gradualmente
5. Documente casos especiais do seu projeto
6. Compartilhe conhecimento com o time

Boa sorte com a migração! 🚀

