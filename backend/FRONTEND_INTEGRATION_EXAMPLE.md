# Frontend Integration Example

## Overview

This document shows how to integrate the Technologies API into your Next.js frontend.

## 1. Create Technology Types

Create type definitions for the Technology entity:

**File:** `frontend/types/entities/technology.entity.ts`

```typescript
export interface Technology {
  id: number;
  name: string;
  description?: string;
  category: TechnologyCategory;
  profileImage?: string;
  displayOrder: number;
  isActive: boolean;
  officialUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum TechnologyCategory {
  BACKEND = 'BACKEND',
  FRONTEND = 'FRONTEND',
  DATABASE = 'DATABASE',
  ORM = 'ORM',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  MOBILE = 'MOBILE',
  VERSION_CONTROL = 'VERSION_CONTROL',
  OTHER = 'OTHER',
}
```

## 2. Create Technologies Service

Create a service to handle API calls:

**File:** `frontend/services/technologies.service.ts`

```typescript
import { api } from './api.service';
import { Technology, TechnologyCategory } from '@/types/entities/technology.entity';

export interface QueryTechnologiesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  category?: TechnologyCategory;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const TechnologiesService = {
  /**
   * Get all technologies
   */
  async getAll(): Promise<Technology[]> {
    const response = await api.get<Technology[]>('/technologies');
    return response.data;
  },

  /**
   * Get technologies with pagination
   */
  async getPaginated(params?: QueryTechnologiesParams): Promise<PaginatedResponse<Technology>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const response = await api.get<PaginatedResponse<Technology>>(
      `/technologies/paginated?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Query technologies with filters
   */
  async query(params?: QueryTechnologiesParams): Promise<PaginatedResponse<Technology>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const response = await api.get<PaginatedResponse<Technology>>(
      `/technologies/query?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get technology by ID
   */
  async getById(id: number): Promise<Technology> {
    const response = await api.get<Technology>(`/technologies/${id}`);
    return response.data;
  },

  /**
   * Get technology profile image URL
   */
  getProfileImageUrl(id: number): string {
    return `${process.env.NEXT_PUBLIC_API_URL}/technologies/${id}/profile-image`;
  },

  /**
   * Create a new technology (Admin only)
   */
  async create(data: {
    name: string;
    description?: string;
    category: TechnologyCategory;
    displayOrder?: number;
    officialUrl?: string;
  }): Promise<Technology> {
    const response = await api.post<Technology>('/technologies', data);
    return response.data;
  },

  /**
   * Update a technology (Admin only)
   */
  async update(id: number, data: Partial<Technology>): Promise<Technology> {
    const response = await api.put<Technology>(`/technologies/${id}`, data);
    return response.data;
  },

  /**
   * Delete a technology (Admin only)
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/technologies/${id}`);
  },

  /**
   * Upload profile image (Admin only)
   */
  async uploadProfileImage(id: number, file: File): Promise<Technology> {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await api.post<Technology>(
      `/technologies/${id}/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Delete profile image (Admin only)
   */
  async deleteProfileImage(id: number): Promise<void> {
    await api.delete(`/technologies/${id}/profile-image`);
  },
};
```

## 3. Update Page Component

Update your `frontend/app/page.tsx` to fetch technologies from the API:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Technology, TechnologyCategory } from '@/types/entities/technology.entity';
import { TechnologiesService } from '@/services/technologies.service';

export default function Home() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const toast = useToast();

  // Load technologies from API
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        setLoadingTechs(true);
        const data = await TechnologiesService.query({
          isActive: true,
          sortBy: 'displayOrder',
          sortOrder: 'ASC',
          limit: 100,
        });
        setTechnologies(data.data);
      } catch (error) {
        console.error('Failed to load technologies:', error);
        toast.error('Failed to load technologies');
      } finally {
        setLoadingTechs(false);
      }
    };

    loadTechnologies();
  }, []);

  // Group technologies by category
  const techsByCategory = technologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<TechnologyCategory, Technology[]>);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ... other sections ... */}

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
              Technologies & Stacks
            </h2>

            {loadingTechs ? (
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary"></div>
                <p className="mt-4 text-jcoder-muted">Loading technologies...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {/* Backend Technologies */}
                {techsByCategory[TechnologyCategory.BACKEND] && (
                  <TechnologySection
                    title="Backend"
                    technologies={techsByCategory[TechnologyCategory.BACKEND]}
                  />
                )}

                {/* Database Technologies */}
                {techsByCategory[TechnologyCategory.DATABASE] && (
                  <TechnologySection
                    title="Databases"
                    technologies={techsByCategory[TechnologyCategory.DATABASE]}
                  />
                )}

                {/* ORM Technologies */}
                {techsByCategory[TechnologyCategory.ORM] && (
                  <TechnologySection
                    title="ORMs"
                    technologies={techsByCategory[TechnologyCategory.ORM]}
                  />
                )}

                {/* Infrastructure Technologies */}
                {techsByCategory[TechnologyCategory.INFRASTRUCTURE] && (
                  <TechnologySection
                    title="Infrastructure"
                    technologies={techsByCategory[TechnologyCategory.INFRASTRUCTURE]}
                  />
                )}

                {/* Frontend Technologies */}
                {techsByCategory[TechnologyCategory.FRONTEND] && (
                  <TechnologySection
                    title="Frontend"
                    technologies={techsByCategory[TechnologyCategory.FRONTEND]}
                  />
                )}

                {/* Mobile Technologies */}
                {techsByCategory[TechnologyCategory.MOBILE] && (
                  <TechnologySection
                    title="Mobile"
                    technologies={techsByCategory[TechnologyCategory.MOBILE]}
                  />
                )}

                {/* Version Control */}
                {techsByCategory[TechnologyCategory.VERSION_CONTROL] && (
                  <TechnologySection
                    title="Version Control"
                    technologies={techsByCategory[TechnologyCategory.VERSION_CONTROL]}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// Technology Section Component
interface TechnologySectionProps {
  title: string;
  technologies: Technology[];
}

function TechnologySection({ title, technologies }: TechnologySectionProps) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {technologies.map((tech) => (
          <TechnologyCard key={tech.id} technology={tech} />
        ))}
      </div>
    </div>
  );
}

// Technology Card Component
interface TechnologyCardProps {
  technology: Technology;
}

function TechnologyCard({ technology }: TechnologyCardProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = TechnologiesService.getProfileImageUrl(technology.id);
  const fallbackImage = `/icons/technologies_and_stacks/${technology.name.toLowerCase().replace(/\./g, '').replace(/\s+/g, '-')}.png`;

  return (
    <a
      href={technology.officialUrl || '#'}
      target={technology.officialUrl ? '_blank' : '_self'}
      rel={technology.officialUrl ? 'noopener noreferrer' : ''}
      className="group"
      title={technology.description}
    >
      <div className="text-center group">
        <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300 p-3">
          <img
            src={imageError ? fallbackImage : imageUrl}
            alt={technology.name}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        </div>
        <h3 className="font-semibold text-jcoder-foreground group-hover:text-jcoder-primary transition-colors">
          {technology.name}
        </h3>
        {technology.description && (
          <p className="text-xs text-jcoder-muted mt-1 line-clamp-2">
            {technology.description}
          </p>
        )}
      </div>
    </a>
  );
}
```

## 4. Create Admin Management Component (Optional)

For admin users to manage technologies:

**File:** `frontend/app/admin/technologies/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Technology } from '@/types/entities/technology.entity';
import { TechnologiesService } from '@/services/technologies.service';

export default function TechnologiesManagement() {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadTechnologies();
  }, []);

  const loadTechnologies = async () => {
    try {
      setLoading(true);
      const data = await TechnologiesService.getAll();
      setTechnologies(data);
    } catch (error) {
      toast.error('Failed to load technologies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this technology?')) {
      return;
    }

    try {
      await TechnologiesService.delete(id);
      toast.success('Technology deleted successfully');
      loadTechnologies();
    } catch (error) {
      toast.error('Failed to delete technology');
    }
  };

  const handleToggleActive = async (tech: Technology) => {
    try {
      await TechnologiesService.update(tech.id, {
        isActive: !tech.isActive,
      });
      toast.success(`Technology ${tech.isActive ? 'deactivated' : 'activated'}`);
      loadTechnologies();
    } catch (error) {
      toast.error('Failed to update technology');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Technologies Management</h1>
        <button
          onClick={() => {/* Navigate to create page */}}
          className="px-4 py-2 bg-jcoder-primary text-black rounded hover:bg-jcoder-accent"
        >
          Add Technology
        </button>
      </div>

      <div className="bg-jcoder-card rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-jcoder-secondary">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {technologies.map((tech) => (
              <tr key={tech.id} className="border-t border-jcoder">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {tech.profileImage && (
                      <img
                        src={TechnologiesService.getProfileImageUrl(tech.id)}
                        alt={tech.name}
                        className="w-10 h-10 rounded object-contain"
                      />
                    )}
                    <span>{tech.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{tech.category}</td>
                <td className="px-4 py-3">{tech.displayOrder}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      tech.isActive
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {tech.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(tech)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {tech.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => {/* Navigate to edit */}}
                      className="px-3 py-1 bg-jcoder-primary text-black rounded hover:bg-jcoder-accent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tech.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## 5. Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 6. Benefits of Backend Integration

✅ **Dynamic Management** - Update technologies without code changes  
✅ **Centralized Data** - Single source of truth  
✅ **Image Optimization** - Automatic image processing  
✅ **Caching** - Improved performance  
✅ **Filtering** - Query by category, status, etc.  
✅ **Ordering** - Control display order  
✅ **API Documentation** - Swagger docs at `/docs`  
✅ **Type Safety** - TypeScript support  

## 7. Migration Strategy

### Gradual Migration

1. **Keep existing static approach** as fallback
2. **Load from API** as primary source
3. **Fallback to static** if API fails

```typescript
const loadTechnologies = async () => {
  try {
    // Try to load from API
    const data = await TechnologiesService.query({ isActive: true });
    setTechnologies(data.data);
  } catch (error) {
    // Fallback to static data
    console.warn('API failed, using static data');
    setTechnologies(STATIC_TECHNOLOGIES);
  }
};
```

### Full Migration

Once confident, remove static data and use API exclusively.

## Notes

- Images are cached for 1 year on the client
- API responses are cached for 5-10 minutes on the server
- Technologies can be filtered by category and status
- Display order controls sort order on frontend
- Profile images are automatically optimized to 400x400px

## Next Steps

1. Update API service if needed
2. Create type definitions
3. Create technologies service
4. Update page component
5. Test integration
6. Deploy

