# Sistema de Templates de Currículo

Este módulo fornece um sistema extensível para criação e geração de currículos em PDF com múltiplos templates pré-definidos.

## Estrutura

```
components/resume/
├── Resume.tsx                    # Componente principal
├── types.ts                      # Tipos e interfaces
├── utils.ts                      # Funções auxiliares compartilhadas
├── index.ts                      # Exports públicos
└── templates/
    ├── index.ts                  # Registry de templates
    └── classic/
        └── ClassicTemplate.tsx   # Template clássico
```

## Uso Básico

### Renderizar um currículo

```tsx
import { Resume, ResumeTemplateType } from '@/components/resume';

<Resume
  user={user}
  aboutMe={aboutMe}
  educations={educations}
  experiences={experiences}
  certificates={certificates}
  references={references}
  technologies={technologies}
  templateType={ResumeTemplateType.CLASSIC}
/>
```


## Criando um Novo Template

### 1. Adicionar o tipo no enum

Em `types.ts`:

```typescript
export enum ResumeTemplateType {
  CLASSIC = 'classic',
  MODERN = 'modern',  // Novo template
}
```

### 2. Criar o componente do template

Criar `templates/modern/ModernTemplate.tsx`:

```tsx
'use client';

import { ResumeTemplateProps } from '../../types';
import { formatDate, formatDateRange, stripHtml } from '../../utils';

export default function ModernTemplate({ data }: ResumeTemplateProps) {
  const { user, aboutMe, educations, experiences, references, technologies } = data;

  return (
    <div id="resume-content-modern" className="resume-pdf modern-template" style={{
      // Seu layout personalizado aqui
    }}>
      {/* Conteúdo do template */}
    </div>
  );
}
```

### 3. Registrar o template

Em `templates/index.ts`:

```typescript
import ModernTemplate from './modern/ModernTemplate';

export const resumeTemplates: Record<ResumeTemplateType, ResumeTemplate> = {
  // ... templates existentes
  [ResumeTemplateType.MODERN]: {
    metadata: {
      id: ResumeTemplateType.MODERN,
      name: 'Modern',
      description: 'Layout moderno e minimalista',
    },
    Component: ModernTemplate,
    getResumeElementId: (type) => {
      if (type === ResumeTemplateType.MODERN) {
        return 'resume-content-modern';
      }
      return `resume-content-${type}`;
    },
  },
};
```

### 4. Usar o novo template

```tsx
<Resume
  // ... props
  templateType={ResumeTemplateType.MODERN}
/>
```

## Características dos Templates

Cada template deve:

1. **Ter um ID único**: O elemento raiz deve ter um `id` único que corresponda ao retornado por `getResumeElementId`
2. **Ser otimizado para PDF**: Usar unidades `mm` e cores que funcionem bem em impressão
3. **Ser responsivo ao conteúdo**: Adaptar-se quando seções estão vazias
4. **Usar helpers compartilhados**: Utilizar funções de `utils.ts` para formatação

## Funções Auxiliares Disponíveis

- `formatDate(date)`: Formata uma data
- `formatDateRange(start, end, isCurrent)`: Formata um intervalo de datas
- `getExpertiseLevelLabel(level)`: Retorna o label do nível de expertise
- `stripHtml(html)`: Remove tags HTML de uma string
- `getSkillBarWidth(level)`: Calcula a largura da barra de skill

## Exemplo Completo de Template

Veja `templates/classic/ClassicTemplate.tsx` para um exemplo completo de implementação.

