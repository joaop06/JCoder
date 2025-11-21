# Resume Template System

This module provides an extensible system for creating and generating resume PDFs with multiple predefined templates.

## Structure

```
components/resume/
├── Resume.tsx                    # Main component
├── types.ts                      # Types and interfaces
├── utils.ts                      # Shared helper functions
├── index.ts                      # Public exports
└── templates/
    ├── index.ts                  # Template registry
    └── classic/
        └── ClassicTemplate.tsx   # Classic template
```

## Basic Usage

### Render a resume

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


## Creating a New Template

### 1. Add the type to the enum

In `types.ts`:

```typescript
export enum ResumeTemplateType {
  CLASSIC = 'classic',
  MODERN = 'modern',  // New template
}
```

### 2. Create the template component

Create `templates/modern/ModernTemplate.tsx`:

```tsx
'use client';

import { ResumeTemplateProps } from '../../types';
import { formatDate, formatDateRange, stripHtml } from '../../utils';

export default function ModernTemplate({ data }: ResumeTemplateProps) {
  const { user, aboutMe, educations, experiences, references, technologies } = data;

  return (
    <div id="resume-content-modern" className="resume-pdf modern-template" style={{
      // Your custom layout here
    }}>
      {/* Template content */}
    </div>
  );
}
```

### 3. Register the template

In `templates/index.ts`:

```typescript
import ModernTemplate from './modern/ModernTemplate';

export const resumeTemplates: Record<ResumeTemplateType, ResumeTemplate> = {
  // ... existing templates
  [ResumeTemplateType.MODERN]: {
    metadata: {
      id: ResumeTemplateType.MODERN,
      name: 'Modern',
      description: 'Modern and minimalist layout',
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

### 4. Use the new template

```tsx
<Resume
  // ... props
  templateType={ResumeTemplateType.MODERN}
/>
```

## Template Characteristics

Each template must:

1. **Have a unique ID**: The root element must have a unique `id` that matches the one returned by `getResumeElementId`
2. **Be optimized for PDF**: Use `mm` units and colors that work well in printing
3. **Be content responsive**: Adapt when sections are empty
4. **Use shared helpers**: Use functions from `utils.ts` for formatting

## Available Helper Functions

- `formatDate(date)`: Formats a date
- `formatDateRange(start, end, isCurrent)`: Formats a date range
- `getExpertiseLevelLabel(level)`: Returns the expertise level label
- `stripHtml(html)`: Removes HTML tags from a string
- `getSkillBarWidth(level)`: Calculates the skill bar width

## Complete Template Example

See `templates/classic/ClassicTemplate.tsx` for a complete implementation example.

