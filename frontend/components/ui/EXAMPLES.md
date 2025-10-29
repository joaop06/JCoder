# Exemplos de Uso - Componentes UI Otimizados

Este arquivo contém exemplos práticos de como usar os componentes UI otimizados em diferentes cenários.

## 📸 LazyImage - Casos de Uso

### 1. Lista de Cards com Imagens

```tsx
'use client';

import { LazyImage } from '@/components/ui';

interface Card {
  id: number;
  title: string;
  imageUrl: string;
}

export default function CardList({ cards }: { cards: Card[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div key={card.id} className="bg-jcoder-card rounded-lg p-4">
          <LazyImage
            src={card.imageUrl}
            alt={card.title}
            fallback={card.title}
            size="custom"
            width="w-full"
            height="h-48"
            objectFit="object-cover"
            className="mb-4"
          />
          <h3 className="text-lg font-semibold">{card.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

### 2. Lista de Usuários com Avatar

```tsx
'use client';

import { LazyImage } from '@/components/ui';

interface User {
  id: number;
  name: string;
  avatarUrl?: string;
  role: string;
}

export function UserList({ users }: { users: User[] }) {
  return (
    <ul className="space-y-4">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-4 p-4 bg-jcoder-card rounded-lg">
          <LazyImage
            src={user.avatarUrl || '/default-avatar.png'}
            alt={user.name}
            fallback={user.name}
            size="medium"
            className="ring-2 ring-jcoder-primary"
          />
          <div>
            <p className="font-semibold text-jcoder-foreground">{user.name}</p>
            <p className="text-sm text-jcoder-muted">{user.role}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

### 3. Galeria de Imagens

```tsx
'use client';

import { LazyImage } from '@/components/ui';
import { useState } from 'react';

interface GalleryImage {
  id: number;
  url: string;
  title: string;
  thumbnail: string;
}

export function ImageGallery({ images }: { images: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative aspect-square overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
          >
            <LazyImage
              src={image.thumbnail}
              alt={image.title}
              fallback={image.title}
              size="custom"
              width="w-full"
              height="h-full"
              objectFit="object-cover"
              rootMargin="100px" // Carrega antecipadamente
            />
          </button>
        ))}
      </div>

      {/* Modal de visualização */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-4 px-6 py-2 bg-white text-black rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

### 4. Feed de Posts (Similar ao Instagram)

```tsx
'use client';

import { LazyImage } from '@/components/ui';

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  caption: string;
  likes: number;
}

export function PostFeed({ posts }: { posts: Post[] }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <article key={post.id} className="bg-jcoder-card rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <LazyImage
              src={post.author.avatar}
              alt={post.author.name}
              fallback={post.author.name}
              size="small"
            />
            <span className="font-semibold">{post.author.name}</span>
          </div>

          {/* Post Image */}
          <LazyImage
            src={post.imageUrl}
            alt={post.caption}
            fallback="Post"
            size="custom"
            width="w-full"
            height="h-96"
            objectFit="object-cover"
            showSkeleton={true}
          />

          {/* Footer */}
          <div className="p-4">
            <p className="text-sm mb-2">❤️ {post.likes} curtidas</p>
            <p className="text-sm">
              <span className="font-semibold">{post.author.name}</span> {post.caption}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
```

---

## 📊 TableSkeleton - Casos de Uso

### 1. Tabela de Produtos

```tsx
'use client';

import { TableSkeleton } from '@/components/ui';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await fetch('/api/products').then(r => r.json());
    setProducts(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <TableSkeleton
        rows={8}
        mobileRows={5}
        columns={[
          { width: 'w-48', align: 'left' },    // Nome
          { width: 'w-24', align: 'right' },   // Preço
          { width: 'w-20', align: 'center' },  // Estoque
          { width: 'w-24', align: 'center' },  // Status
          { width: 'w-32', align: 'center' },  // Ações
        ]}
        headerColumns={['Produto', 'Preço', 'Estoque', 'Status', 'Ações']}
      />
    );
  }

  return (
    <table className="w-full">
      {/* ... tabela real ... */}
    </table>
  );
}
```

### 2. Tabela de Usuários com Avatar

```tsx
'use client';

import { TableSkeleton } from '@/components/ui';

export function UsersTableSkeleton() {
  return (
    <TableSkeleton
      rows={10}
      mobileRows={6}
      columns={[
        { width: 'w-12', circular: true, align: 'center' },  // Avatar circular
        { width: 'w-48', align: 'left' },                    // Nome
        { width: 'w-40', align: 'left' },                    // Email
        { width: 'w-24', align: 'center' },                  // Role
        { width: 'w-32', align: 'center' },                  // Data
        { width: 'w-24', align: 'center' },                  // Ações
      ]}
      showHeader={true}
    />
  );
}
```

### 3. Dashboard com Múltiplas Tabelas

```tsx
'use client';

import { TableSkeleton } from '@/components/ui';

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-jcoder-card p-6 rounded-lg animate-pulse">
            <div className="h-4 bg-jcoder-secondary rounded w-24 mb-4" />
            <div className="h-8 bg-jcoder-secondary rounded w-16" />
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-jcoder-card rounded-lg p-6">
        <div className="h-6 bg-jcoder-secondary rounded w-48 mb-4 animate-pulse" />
        <TableSkeleton
          rows={5}
          columns={[
            { width: 'w-32' },
            { width: 'w-40' },
            { width: 'w-24' },
            { width: 'w-24' },
          ]}
          showHeader={false}
        />
      </div>

      {/* Recent Customers Table */}
      <div className="bg-jcoder-card rounded-lg p-6">
        <div className="h-6 bg-jcoder-secondary rounded w-48 mb-4 animate-pulse" />
        <TableSkeleton
          rows={5}
          columns={[
            { width: 'w-12', circular: true },
            { width: 'w-48' },
            { width: 'w-32' },
          ]}
          showHeader={false}
        />
      </div>
    </div>
  );
}
```

---

## 🎣 useIntersectionObserver - Casos de Uso

### 1. Animação ao Entrar na Viewport

```tsx
'use client';

import { useRef } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function AnimatedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, {
    threshold: 0.3,
    once: true,
  });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
}
```

### 2. Lazy Loading de Componente Pesado

```tsx
'use client';

import { useRef, lazy, Suspense } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const HeavyChart = lazy(() => import('./HeavyChart'));

export function LazyChart() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, {
    rootMargin: '200px', // Carrega 200px antes
    once: true,
  });

  return (
    <div ref={ref} className="h-96">
      {isInView ? (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      ) : (
        <ChartSkeleton />
      )}
    </div>
  );
}
```

### 3. Contador Animado ao Entrar na View

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function AnimatedCounter({ target }: { target: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useIntersectionObserver(ref, { threshold: 0.5, once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-4xl font-bold text-jcoder-primary">
      {count.toLocaleString()}+
    </div>
  );
}
```

### 4. Infinite Scroll

```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export function InfiniteList() {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  
  const isLoaderInView = useIntersectionObserver(loaderRef, {
    threshold: 0.1,
    once: false, // Não desconecta
  });

  useEffect(() => {
    if (isLoaderInView && hasMore) {
      loadMore();
    }
  }, [isLoaderInView]);

  const loadMore = async () => {
    const newItems = await fetchItems(page);
    if (newItems.length === 0) {
      setHasMore(false);
      return;
    }
    setItems(prev => [...prev, ...newItems]);
    setPage(prev => prev + 1);
  };

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      
      {hasMore && (
        <div ref={loaderRef} className="text-center py-4">
          Carregando mais...
        </div>
      )}
    </div>
  );
}
```

---

## 🎨 Combinando Componentes

### Página Completa Otimizada

```tsx
'use client';

import { useState, useEffect } from 'react';
import { LazyImage, TableSkeleton } from '@/components/ui';

interface Technology {
  id: number;
  name: string;
  imageUrl: string;
  level: string;
  isActive: boolean;
}

export default function TechnologiesPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    setLoading(true);
    const data = await fetch('/api/technologies').then(r => r.json());
    setTechnologies(data);
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Technologies</h1>

      <div className="bg-jcoder-card rounded-lg overflow-hidden">
        {loading ? (
          <TableSkeleton
            rows={8}
            mobileRows={5}
            columns={[
              { width: 'w-12', circular: true },
              { width: 'w-40' },
              { width: 'w-24' },
              { width: 'w-24' },
            ]}
          />
        ) : (
          <div className="divide-y divide-jcoder">
            {technologies.map((tech) => (
              <div key={tech.id} className="p-4 flex items-center gap-4">
                <LazyImage
                  src={tech.imageUrl}
                  alt={tech.name}
                  fallback={tech.name}
                  size="small"
                  className="bg-white p-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{tech.name}</h3>
                  <p className="text-sm text-jcoder-muted">{tech.level}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    tech.isActive
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {tech.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 💡 Dicas de Performance

1. **Use memoização**: Combine `LazyImage` com `React.memo` para evitar re-renders
2. **Ajuste rootMargin**: Valores maiores = carregamento antecipado, valores menores = economia de banda
3. **Customize skeleton**: Adapte o skeleton para corresponder ao layout real
4. **Prefetch crítico**: Para imagens above-the-fold, não use lazy loading
5. **Otimize tamanhos**: Sirva imagens em tamanhos apropriados para cada viewport

---

## 🔍 Debugging

### Ver quais imagens estão carregando

```tsx
<LazyImage
  src={imageUrl}
  alt={name}
  fallback={name}
  onLoad={() => console.log('Loaded:', imageUrl)}
  onError={() => console.error('Failed:', imageUrl)}
/>
```

### Ver quando elementos entram na viewport

```tsx
const isInView = useIntersectionObserver(ref, {
  threshold: 0.5,
  once: false,
});

useEffect(() => {
  console.log('Element in view:', isInView);
}, [isInView]);
```

---

## 📚 Recursos Adicionais

- [Intersection Observer API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Performance Best Practices](https://web.dev/fast/)

