'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { PaginationDto } from '@/types/api/pagination.dto';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import { Technology } from '@/types/api/technologies/technology.entity';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { LazyImage, TableSkeleton, ManagementTable } from '@/components/ui';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { CreateTechnologyDto } from '@/types/api/technologies/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/api/technologies/dtos/update-technology.dto';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';

// Helper to get expertise level label
const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
    const labels: Record<ExpertiseLevel, string> = {
        [ExpertiseLevel.BASIC]: 'Basic',
        [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
        [ExpertiseLevel.ADVANCED]: 'Advanced',
        [ExpertiseLevel.EXPERT]: 'Expert',
    };
    return labels[level];
};

// Helper to get expertise level color
const getExpertiseLevelColor = (level: ExpertiseLevel): string => {
    const colors: Record<ExpertiseLevel, string> = {
        [ExpertiseLevel.BASIC]: 'bg-gray-500/20 text-gray-400',
        [ExpertiseLevel.INTERMEDIATE]: 'bg-blue-500/20 text-blue-400',
        [ExpertiseLevel.ADVANCED]: 'bg-purple-500/20 text-purple-400',
        [ExpertiseLevel.EXPERT]: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[level];
};

// Memoized Technology Row Component (Desktop)
interface TechnologyRowProps {
    tech: Technology;
    index: number;
    draggedIndex: number | null;
    dragOverIndex: number | null;
    onEdit: (tech: Technology) => void;
    onDelete: (tech: Technology) => void;
    onToggleActive: (tech: Technology) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLTableRowElement>) => void;
    onDrop: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
}

const TechnologyRow = memo(({
    tech,
    index,
    draggedIndex,
    dragOverIndex,
    onEdit,
    onDelete,
    onToggleActive,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: TechnologyRowProps) => {
    return (
        <tr
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className={`transition-colors ${dragOverIndex === index && draggedIndex !== index
                ? 'border-t-2 border-jcoder-primary bg-jcoder-primary/10'
                : 'hover:bg-jcoder-secondary/50'
                }`}
        >
            <td className="px-2 py-4">
                <div className="flex items-center justify-center">
                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnd={onDragEnd}
                        className="p-1 text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-grab active:cursor-grabbing select-none"
                        title="Drag to reorder"
                    >
                        <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </div>
                </div>
            </td>
            <td className="px-3 py-4">
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={() => onEdit(tech)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(tech)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                    {tech.profileImage ? (
                        <LazyImage
                            src={(() => {
                                const userSession = UsersService.getUserSession();
                                const username = userSession?.user?.username || '';
                                return username ? ImagesService.getTechnologyProfileImageUrl(username, tech.id) : '';
                            })()}
                            alt={tech.name}
                            fallback={tech.name}
                            className="bg-jcoder-secondary p-1"
                            size="small"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0">
                            {tech.name.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-medium text-jcoder-foreground truncate">{tech.name}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getExpertiseLevelColor(tech.expertiseLevel)}`}>
                    {getExpertiseLevelLabel(tech.expertiseLevel)}
                </span>
            </td>
            <td className="px-4 py-4 text-center">
                <button
                    onClick={() => onToggleActive(tech)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${tech.isActive
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {tech.isActive ? 'Active' : 'Inactive'}
                </button>
            </td>
        </tr>
    );
});

TechnologyRow.displayName = 'TechnologyRow';

// Memoized Technology Card Component (Mobile)
interface TechnologyCardProps {
    tech: Technology;
    index: number;
    draggedIndex: number | null;
    dragOverIndex: number | null;
    onEdit: (tech: Technology) => void;
    onDelete: (tech: Technology) => void;
    onToggleActive: (tech: Technology) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

const TechnologyCard = memo(({
    tech,
    index,
    draggedIndex,
    dragOverIndex,
    onEdit,
    onDelete,
    onToggleActive,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: TechnologyCardProps) => {
    return (
        <div
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className={`p-4 transition-colors ${dragOverIndex === index && draggedIndex !== index
                ? 'border-t-2 border-jcoder-primary bg-jcoder-primary/10'
                : ''
                }`}
        >
            {/* Header with Drag Handle and Actions */}
            <div className="flex items-start gap-3 mb-3">
                {/* Drag Handle */}
                <div
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragEnd={onDragEnd}
                    className="p-2 text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-grab active:cursor-grabbing select-none"
                    title="Drag to reorder"
                >
                    <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                </div>

                {/* Technology Info */}
                <div className="flex items-center gap-3 flex-1">
                    {tech.profileImage ? (
                        <LazyImage
                            src={(() => {
                                const userSession = UsersService.getUserSession();
                                const username = userSession?.user?.username || '';
                                return username ? ImagesService.getTechnologyProfileImageUrl(username, tech.id) : '';
                            })()}
                            alt={tech.name}
                            fallback={tech.name}
                            className="bg-jcoder-secondary p-1"
                            size="custom"
                            width="w-12"
                            height="h-12"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0">
                            {tech.name.charAt(0)}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-jcoder-foreground truncate">{tech.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getExpertiseLevelColor(tech.expertiseLevel)}`}>
                                {getExpertiseLevelLabel(tech.expertiseLevel)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(tech)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(tech)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Status Toggle */}
            <div className="ml-10">
                <button
                    onClick={() => onToggleActive(tech)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${tech.isActive
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {tech.isActive ? 'Active' : 'Inactive'}
                </button>
            </div>
        </div>
    );
});

TechnologyCard.displayName = 'TechnologyCard';

export default function TechnologiesManagementPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [pagination, setPagination] = useState<PaginationDto>({
        page: 1,
        limit: 10,
        sortOrder: 'ASC',
        sortBy: 'displayOrder',
    });
    const [paginationMeta, setPaginationMeta] = useState<any>(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [filterActive, setFilterActive] = useState<boolean | 'ALL'>('ALL');

    // Drag and drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [tempTechnologies, setTempTechnologies] = useState<Technology[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Stats states
    const [totalActive, setTotalActive] = useState<number>(0);
    const [totalInactive, setTotalInactive] = useState<number>(0);

    const toast = useToast();

    // Use temp array during drag, otherwise use the original
    const displayTechnologies = isDragging ? tempTechnologies : technologies;

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
        setCheckingAuth(false);
    }, [router]);

    const fetchStats = useCallback(async () => {
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const stats = await TechnologiesService.getStats(userSession.user.username);
            setTotalActive(stats.active);
            setTotalInactive(stats.inactive);
        } catch (err: any) {
            // Silently fail for stats, don't show error to user
            console.error('Failed to fetch technology stats:', err);
        }
    }, []);

    const fetchTechnologies = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const queryParams: any = { ...pagination };
            if (filterActive !== 'ALL') queryParams.isActive = filterActive;

            const data = await TechnologiesService.findAll(userSession.user.username, queryParams);
            setTechnologies(Array.isArray(data.data) ? data.data : []);
            setPaginationMeta(data.meta);
        } catch (err: any) {
            const errorMessage = 'Failed to load technologies. Please try again.';
            toast.error(errorMessage);
            setFetchError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [pagination, filterActive, toast]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchTechnologies();
        fetchStats();
    }, [isAuthenticated, fetchTechnologies, fetchStats]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        router.push('/');
    }, [router]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const handleLimitChange = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
    }, []);

    const handleCreate = useCallback(async (formData: CreateTechnologyDto | UpdateTechnologyDto, imageFile?: File | null) => {
        setSubmitting(true);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const createdTech = await TechnologiesService.create(userSession.user.username, {
                name: formData.name,
                expertiseLevel: formData.expertiseLevel,
            } as CreateTechnologyDto);

            // Upload image if provided
            if (imageFile && createdTech.id) {
                try {
                    await ImagesService.uploadTechnologyProfileImage(userSession.user.username, createdTech.id, imageFile);
                } catch (imgErr: any) {
                    toast.error('Technology created but image upload failed: ' + (imgErr?.response?.data?.message || 'Unknown error'));
                    fetchTechnologies();
                    setShowCreateModal(false);
                    return;
                }
            }

            toast.success('Technology created successfully!');
            setShowCreateModal(false);
            fetchTechnologies();
            fetchStats();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create technology');
        } finally {
            setSubmitting(false);
        }
    }, [toast, fetchTechnologies, fetchStats]);

    const handleUpdate = useCallback(async (id: number, formData: CreateTechnologyDto | UpdateTechnologyDto, imageFile?: File | null, deleteImage?: boolean) => {
        setSubmitting(true);
        try {
            // Update technology data
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await TechnologiesService.update(userSession.user.username, id, formData as UpdateTechnologyDto);

            // Handle image deletion
            if (deleteImage) {
                try {
                    await ImagesService.deleteTechnologyProfileImage(userSession.user.username, id);
                } catch (delErr: any) {
                    toast.error('Technology updated but image deletion failed: ' + (delErr?.response?.data?.message || 'Unknown error'));
                    fetchTechnologies();
                    fetchStats();
                    setShowEditModal(false);
                    setSelectedTechnology(null);
                    return;
                }
            }

            // Handle image upload/replacement
            if (imageFile) {
                try {
                    await ImagesService.uploadTechnologyProfileImage(userSession.user.username, id, imageFile);
                } catch (imgErr: any) {
                    toast.error('Technology updated but image upload failed: ' + (imgErr?.response?.data?.message || 'Unknown error'));
                    fetchTechnologies();
                    fetchStats();
                    setShowEditModal(false);
                    setSelectedTechnology(null);
                    return;
                }
            }

            toast.success('Technology updated successfully!');
            setShowEditModal(false);
            setSelectedTechnology(null);
            fetchTechnologies();
            fetchStats();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update technology');
        } finally {
            setSubmitting(false);
        }
    }, [toast, fetchTechnologies, fetchStats]);

    const handleDelete = useCallback(
        async (technology: Technology) => {
            const confirmed = await toast.confirm(`Are you sure you want to delete ${technology.name}?`, {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            });
            if (!confirmed) return;

            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                await TechnologiesService.delete(userSession.user.username, technology.id);
                toast.success(`${technology.name} successfully deleted!`);
                fetchTechnologies();
                fetchStats();
            } catch (err) {
                toast.error('Failed to delete technology.');
            }
        },
        [toast, fetchTechnologies, fetchStats]
    );

    const handleToggleActive = useCallback(async (technology: Technology) => {
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await TechnologiesService.update(userSession.user.username, technology.id, {
                isActive: !technology.isActive,
            });
            toast.success(`Technology ${technology.isActive ? 'deactivated' : 'activated'} successfully!`);
            fetchTechnologies();
            fetchStats();
        } catch (err) {
            toast.error('Failed to update technology status.');
        }
    }, [toast, fetchTechnologies, fetchStats]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        setIsDragging(true);
        setTempTechnologies([...technologies]);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        // Find the parent row and add opacity
        const row = e.currentTarget.closest('tr');
        if (row) {
            row.style.opacity = '0.5';
        }
    }, [technologies]);

    const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        // Find the parent row and restore opacity
        const row = e.currentTarget.closest('tr');
        if (row) {
            row.style.opacity = '1';
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
        setTempTechnologies([]);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && dragOverIndex !== index) {
            setDragOverIndex(index);

            // Reorganize array visually during drag
            const newArray = [...technologies];
            const draggedItem = newArray[draggedIndex];
            newArray.splice(draggedIndex, 1);
            newArray.splice(index, 0, draggedItem);

            setTempTechnologies(newArray);
        }
    }, [draggedIndex, dragOverIndex, technologies]);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>) => {
        // Only clear if we're actually leaving the row
        const rect = e.currentTarget.getBoundingClientRect();
        if (
            e.clientY < rect.top ||
            e.clientY >= rect.bottom ||
            e.clientX < rect.left ||
            e.clientX >= rect.right
        ) {
            setDragOverIndex(null);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            setTempTechnologies([]);
            return;
        }

        // Get the items from the original array
        const draggedTechnology = technologies[draggedIndex];
        const targetTechnology = technologies[dropIndex];

        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await TechnologiesService.reorder(userSession.user.username, draggedTechnology.id, targetTechnology.displayOrder);
            toast.success('Technology reordered successfully!');

            // Update local state with the new order instead of reloading
            const newArray = [...technologies];
            const draggedItem = newArray[draggedIndex];
            newArray.splice(draggedIndex, 1);
            newArray.splice(dropIndex, 0, draggedItem);
            setTechnologies(newArray);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to reorder technology');
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            setTempTechnologies([]);
        }
    }, [draggedIndex, technologies, toast]);

    const formatRelativeDate = (date: Date, locale = 'en-US'): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHrs < 24) return `${diffHrs} hours ago`;

        // Same date of the current day -> "Today HH:mm"
        const sameDay =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        if (sameDay) {
            return `Today ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
        }

        // Yesterday
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            date.getFullYear() === yesterday.getFullYear() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getDate() === yesterday.getDate();
        if (isYesterday) {
            return `Yesterday ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
        }

        return date.toLocaleString(locale, {
            day: '2-digit',
            hour: '2-digit',
            year: 'numeric',
            month: '2-digit',
            minute: '2-digit',
        });
    };

    const parseToDate = (value: string | number | Date | null | undefined): Date | null => {
        if (!value) return null;
        const d = value instanceof Date ? value : new Date(value);
        return isNaN(d.getTime()) ? null : d;
    };

    const lastUpdate = useMemo(() => {
        if (!technologies?.length) return 'Never';

        // For each technology, we took the most recent one between updatedAt and createdAt
        const latestDates: Date[] = technologies
            .map((tech: Technology) => {
                const created = parseToDate(tech.createdAt);
                const updated = parseToDate(tech.updatedAt);
                if (created && updated) return updated > created ? updated : created;
                return updated ?? created ?? null;
            })
            .filter((d): d is Date => d !== null);

        if (!latestDates.length) return 'Never';

        // Select the most recent date from all of them
        const mostRecent = latestDates.reduce((a, b) => (a > b ? a : b));

        return formatRelativeDate(mostRecent, 'en-US');
    }, [technologies]);

    if (checkingAuth || !isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <div className="h-10 w-72 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-jcoder-card border border-jcoder rounded-lg p-6">
                                    <div className="h-4 w-32 bg-jcoder-secondary rounded mb-2 animate-pulse"></div>
                                    <div className="h-10 w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6">
                            <TableSkeleton />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <ol className="flex items-center gap-2 text-sm text-jcoder-muted">
                            <li>
                                <button onClick={() => router.push('/admin')} className="hover:text-jcoder-primary transition-colors">
                                    Admin
                                </button>
                            </li>
                            <li>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li className="text-jcoder-foreground font-medium">Technologies</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">Technologies Management</h1>
                        <p className="text-jcoder-muted">Manage technologies and tech stack for your portfolio</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Technologies Card */}
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 hover:border-jcoder-primary transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-sm mb-1">Total Technologies</p>
                                    <p className="text-3xl font-bold text-jcoder-foreground">{paginationMeta?.total || 0}</p>
                                </div>
                                <div className="w-12 h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 hover:border-jcoder-primary transition-colors">
                            <div>
                                <p className="text-jcoder-muted text-sm mb-3">Status</p>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-jcoder-muted">Active</p>
                                            <p className="text-2xl font-bold text-green-500">{totalActive}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-jcoder"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-jcoder-muted">Inactive</p>
                                            <p className="text-2xl font-bold text-red-500">{totalInactive}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Last Update Card */}
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 hover:border-jcoder-primary transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-sm mb-1">Last Update</p>
                                    <p className="text-3xl font-bold text-jcoder-foreground">{lastUpdate}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technologies Table */}
                    <ManagementTable
                        title="Technologies"
                        subtitle="Manage technologies and tech stack for your portfolio"
                        actionButton={{
                            label: 'New Technology',
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            ),
                            onClick: () => setShowCreateModal(true),
                        }}
                        columns={[
                            { label: '', className: 'px-2 py-4 text-center text-sm font-semibold text-jcoder-foreground w-12' },
                            { label: 'Actions', className: 'px-3 py-4 text-center text-sm font-semibold text-jcoder-foreground w-24' },
                            { label: 'Technology', className: 'px-4 py-4 text-left text-sm font-semibold text-jcoder-foreground' },
                            { label: 'Expertise', className: 'px-4 py-4 text-center text-sm font-semibold text-jcoder-foreground w-32' },
                            { label: 'Status', className: 'px-4 py-4 text-center text-sm font-semibold text-jcoder-foreground w-32' },
                        ]}
                        data={displayTechnologies}
                        loading={loading}
                        error={fetchError}
                        renderDesktopRow={(tech, index) => (
                            <TechnologyRow
                                key={tech.id}
                                tech={tech}
                                index={index}
                                draggedIndex={draggedIndex}
                                dragOverIndex={dragOverIndex}
                                onEdit={(tech) => {
                                    setSelectedTechnology(tech);
                                    setShowEditModal(true);
                                }}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            />
                        )}
                        renderMobileCard={(tech, index) => (
                            <TechnologyCard
                                key={tech.id}
                                tech={tech}
                                index={index}
                                draggedIndex={draggedIndex}
                                dragOverIndex={dragOverIndex}
                                onEdit={(tech) => {
                                    setSelectedTechnology(tech);
                                    setShowEditModal(true);
                                }}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            />
                        )}
                        emptyState={{
                            icon: '🚀',
                            message: 'No technologies found.',
                            actionButton: {
                                label: 'Create your first technology',
                                onClick: () => setShowCreateModal(true),
                            },
                        }}
                        paginationMeta={paginationMeta}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                        onRetry={fetchTechnologies}
                    />
                </div>
            </main>

            {/* Create Modal */}
            {showCreateModal && (
                <TechnologyFormModal
                    title="Create New Technology"
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreate}
                    submitting={submitting}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && selectedTechnology && (
                <TechnologyFormModal
                    title="Edit Technology"
                    technology={selectedTechnology}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedTechnology(null);
                    }}
                    onSubmit={(data, imageFile, deleteImage) => handleUpdate(selectedTechnology.id, data, imageFile, deleteImage)}
                    submitting={submitting}
                />
            )}

            <Footer />
        </div>
    );
}

// Technology Form Modal Component
interface TechnologyFormModalProps {
    title: string;
    technology?: Technology;
    onClose: () => void;
    onSubmit: (data: CreateTechnologyDto | UpdateTechnologyDto, imageFile?: File | null, deleteImage?: boolean) => void | Promise<void>;
    submitting: boolean;
}

function TechnologyFormModal({ title, technology, onClose, onSubmit, submitting }: TechnologyFormModalProps) {
    const isEditMode = !!technology;
    const toast = useToast();

    const [formData, setFormData] = useState({
        name: technology?.name || '',
        expertiseLevel: technology?.expertiseLevel || ExpertiseLevel.INTERMEDIATE,
        displayOrder: technology?.displayOrder || 1,
        isActive: technology?.isActive ?? true,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [deleteImage, setDeleteImage] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
            if (!validTypes.includes(file.type)) {
                toast.error('Invalid file type. Please upload PNG, JPEG, WebP, or SVG.');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size exceeds 5MB. Please choose a smaller file.');
                return;
            }

            setSelectedFile(file);
            setDeleteImage(false);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveSelectedFile = () => {
        setSelectedFile(null);
        setPreview(null);
    };

    const handleDeleteCurrentImage = () => {
        setDeleteImage(true);
        setSelectedFile(null);
        setPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Remove displayOrder from payload (backend manages it automatically)
        // When creating: backend assigns displayOrder = 1
        // When updating: displayOrder is managed by separate reorder endpoint
        const payload = { ...formData };
        delete (payload as any).displayOrder;

        onSubmit(payload, selectedFile, deleteImage);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-jcoder-card border border-jcoder rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-jcoder">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-jcoder-foreground">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-jcoder-secondary rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                            placeholder="e.g., Node.js"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                            Expertise Level <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={formData.expertiseLevel}
                            onChange={(e) => setFormData({ ...formData, expertiseLevel: e.target.value as ExpertiseLevel })}
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                        >
                            <option value={ExpertiseLevel.BASIC}>Basic</option>
                            <option value={ExpertiseLevel.INTERMEDIATE}>Intermediate</option>
                            <option value={ExpertiseLevel.ADVANCED}>Advanced</option>
                            <option value={ExpertiseLevel.EXPERT}>Expert</option>
                        </select>
                        <p className="text-sm text-jcoder-muted mt-2">
                            Select your proficiency level with this technology
                        </p>
                    </div>

                    {/* Status Toggle (Edit Mode Only) */}
                    {isEditMode && (
                        <div className="flex items-center justify-between p-4 bg-jcoder-secondary border border-jcoder rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-jcoder-foreground mb-1">
                                    Status
                                </label>
                                <p className="text-sm text-jcoder-muted">
                                    {formData.isActive ? 'Technology is visible on the public site' : 'Technology is hidden from the public site'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:ring-offset-2 focus:ring-offset-jcoder-card ${formData.isActive ? 'bg-green-500' : 'bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Profile Image Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-jcoder-foreground">Profile Image</label>

                        {/* Current Image (Edit Mode) */}
                        {isEditMode && technology?.profileImage && !preview && !deleteImage && (
                            <div className="flex items-center gap-4 p-4 bg-jcoder-secondary rounded-lg border border-jcoder">
                                <img
                                    src={(() => {
                                        const userSession = UsersService.getUserSession();
                                        const username = userSession?.user?.username || '';
                                        return username ? ImagesService.getTechnologyProfileImageUrl(username, technology.id) : '';
                                    })()}
                                    alt={technology.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-20 h-20 rounded-lg object-contain bg-jcoder-card p-2"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-jcoder-foreground">Current image</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleDeleteCurrentImage}
                                    className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        )}

                        {/* Image marked for deletion */}
                        {deleteImage && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <p className="text-sm text-red-400">The current image will be deleted when you save.</p>
                            </div>
                        )}

                        {/* Preview New Image */}
                        {preview && (
                            <div className="flex items-center gap-4 p-4 bg-jcoder-secondary rounded-lg border border-jcoder-primary">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-20 h-20 rounded-lg object-contain bg-jcoder-card p-2"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-jcoder-foreground">New image preview</p>
                                    <p className="text-xs text-jcoder-muted">{selectedFile?.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveSelectedFile}
                                    className="px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors text-sm text-jcoder-foreground"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {/* Upload Input */}
                        <div>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-jcoder-gradient file:text-black file:font-medium hover:file:opacity-90"
                            />
                            <p className="text-sm text-jcoder-muted mt-2">
                                Accepted formats: PNG, JPEG, WebP, SVG (max 5MB)
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                        >
                            {submitting ? 'Saving...' : technology ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}