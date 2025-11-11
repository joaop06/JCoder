'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { PaginationDto } from '@/types/api/pagination.dto';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import { Technology } from '@/types/api/technologies/technology.entity';
import { useState, useEffect, useMemo, useCallback, memo, Suspense, useRef } from 'react';
import { LazyImage, TableSkeleton, ManagementTable } from '@/components/ui';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { CreateTechnologyDto } from '@/types/api/technologies/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/api/technologies/dtos/update-technology.dto';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

// Helper to get expertise level label
const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
    const labels: Record<ExpertiseLevel, string> = {
        [ExpertiseLevel.BASIC]: 'Basic',
        [ExpertiseLevel.EXPERT]: 'Expert',
        [ExpertiseLevel.ADVANCED]: 'Advanced',
        [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
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
            className={`group relative transition-all duration-200 ${dragOverIndex === index && draggedIndex !== index
                ? 'border-l-4 border-jcoder-primary bg-gradient-to-r from-jcoder-primary/10 via-jcoder-primary/5 to-transparent shadow-lg shadow-jcoder-primary/10'
                : 'hover:bg-gradient-to-r hover:from-jcoder-secondary/30 hover:via-jcoder-secondary/20 hover:to-transparent hover:shadow-sm'
                }`}
        >
            {/* Subtle left border on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-jcoder-primary/0 group-hover:bg-jcoder-primary/50 transition-all duration-200" />

            <td className="px-3 py-5">
                <div className="flex items-center justify-center">
                    <div
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragEnd={onDragEnd}
                        className="p-1.5 text-jcoder-muted/60 hover:text-jcoder-primary transition-all duration-200 cursor-grab active:cursor-grabbing select-none rounded-md hover:bg-jcoder-secondary/50"
                        title="Drag to reorder"
                    >
                        <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                </div>
            </td>
            <td className="px-3 py-5">
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        onClick={() => onEdit(tech)}
                        className="p-2 text-blue-500 hover:bg-blue-500/15 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md hover:shadow-blue-500/20"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(tech)}
                        className="p-2 text-red-500 hover:bg-red-500/15 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md hover:shadow-red-500/20"
                        title="Delete"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
            <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                    {tech.profileImage ? (
                        <LazyImage
                            src={(() => {
                                const userSession = UsersService.getUserSession();
                                const username = userSession?.user?.username || '';
                                return username ? ImagesService.getTechnologyProfileImageUrl(username, tech.id) : '';
                            })()}
                            alt={tech.name}
                            fallback={tech.name}
                            className="bg-jcoder-secondary p-1 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                            size="small"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                            {tech.name.charAt(0)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-jcoder-foreground truncate group-hover:text-jcoder-primary transition-colors duration-200">{tech.name}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-5 text-center">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm transition-all duration-200 ${getExpertiseLevelColor(tech.expertiseLevel)} group-hover:shadow-md`}>
                    {getExpertiseLevelLabel(tech.expertiseLevel)}
                </span>
            </td>
            <td className="px-4 py-5 text-center">
                <button
                    onClick={() => onToggleActive(tech)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap shadow-sm ${tech.isActive
                        ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-500 border border-green-500/30 hover:from-green-500/30 hover:to-green-500/20 hover:shadow-green-500/20'
                        : 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 border border-red-500/30 hover:from-red-500/30 hover:to-red-500/20 hover:shadow-red-500/20'
                        }`}
                >
                    <div className={`w-2 h-2 rounded-full ${tech.isActive ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
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
            className={`bg-jcoder-card/50 border border-jcoder rounded-xl p-4 transition-all duration-200 ${dragOverIndex === index && draggedIndex !== index
                ? 'border-jcoder-primary bg-jcoder-primary/10 shadow-lg shadow-jcoder-primary/20'
                : 'hover:border-jcoder-primary/50 hover:bg-jcoder-card'
                }`}
        >
            {/* Main Content Row */}
            <div className="flex items-center gap-3 mb-3">
                {/* Drag Handle - Smaller and less prominent */}
                <div
                    draggable
                    onDragStart={(e) => onDragStart(e, index)}
                    onDragEnd={onDragEnd}
                    className="p-1.5 text-jcoder-muted/60 hover:text-jcoder-primary transition-colors cursor-grab active:cursor-grabbing select-none flex-shrink-0"
                    title="Drag to reorder"
                >
                    <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                </div>

                {/* Technology Image/Avatar */}
                {tech.profileImage ? (
                    <LazyImage
                        src={(() => {
                            const userSession = UsersService.getUserSession();
                            const username = userSession?.user?.username || '';
                            return username ? ImagesService.getTechnologyProfileImageUrl(username, tech.id) : '';
                        })()}
                        alt={tech.name}
                        fallback={tech.name}
                        className="bg-jcoder-secondary p-1 rounded-lg"
                        size="custom"
                        width="w-14"
                        height="h-14"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0 text-lg">
                        {tech.name.charAt(0)}
                    </div>
                )}

                {/* Name and Info - Main Content */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-jcoder-foreground truncate mb-1">{tech.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getExpertiseLevelColor(tech.expertiseLevel)}`}>
                            {getExpertiseLevelLabel(tech.expertiseLevel)}
                        </span>
                        <button
                            onClick={() => onToggleActive(tech)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${tech.isActive
                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                }`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {tech.isActive ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer - Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-jcoder/50">
                <button
                    onClick={() => onEdit(tech)}
                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors active:scale-95"
                    title="Edit"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button
                    onClick={() => onDelete(tech)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95"
                    title="Delete"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
});

TechnologyCard.displayName = 'TechnologyCard';

export default function TechnologiesManagementPage() {
    const router = useRouter();
    const params = useParams();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [pagination, setPagination] = useState<PaginationDto>({
        page: 1,
        limit: 10,
        sortOrder: 'ASC',
        sortBy: 'displayOrder',
    });
    const [paginationMeta, setPaginationMeta] = useState<any>(null);

    // Get username from URL params
    const urlUsername = useMemo(() => {
        const raw = params?.username;
        return Array.isArray(raw) ? raw[0] : raw || '';
    }, [params]);

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

    // WebGL and animation states
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
    const [isVisible, setIsVisible] = useState(false);

    // Refs for mouse position throttling
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    const toast = useToast();

    // Use temp array during drag, otherwise use the original
    const displayTechnologies = isDragging ? tempTechnologies : technologies;

    useEffect(() => {
        setIsVisible(true);

        // Update window size
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('resize', updateWindowSize);
        return () => window.removeEventListener('resize', updateWindowSize);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Update ref immediately
            mousePositionRef.current = { x: e.clientX, y: e.clientY };

            // Throttle state updates using requestAnimationFrame
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(() => {
                    setMousePosition(mousePositionRef.current);
                    rafRef.current = null;
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/sign-in');
            return;
        }

        // Load user profile data for footer
        const loadUserProfile = async () => {
            try {
                if (urlUsername) {
                    const userProfile = await UsersService.getProfile(urlUsername);
                    setUser(userProfile);
                } else {
                    const userSession = UsersService.getUserSession();
                    if (userSession?.user) {
                        setUser(userSession.user);
                    }
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                // Fallback to session data if API call fails
                const userSession = UsersService.getUserSession();
                if (userSession?.user) {
                    setUser(userSession.user);
                }
            }
        };

        setIsAuthenticated(true);
        setCheckingAuth(false);
        loadUserProfile();
    }, [router, urlUsername]);

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
            <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
                {/* WebGL Background - Animated 3D mesh - Hidden on mobile for performance */}
                <div className="hidden md:block">
                    <Suspense fallback={null}>
                        <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                    </Suspense>
                </div>

                {/* Animated Background - CSS layers for depth */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Gradient Orbs - Smaller on mobile */}
                    <div
                        className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                        style={{
                            left: `${mousePosition.x / 20}px`,
                            top: `${mousePosition.y / 20}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />
                    <div
                        className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                        style={{
                            right: `${mousePosition.x / 25}px`,
                            bottom: `${mousePosition.y / 25}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />

                    {/* Grid Pattern - Smaller on mobile */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
                </div>

                <Header isAdmin={true} onLogout={handleLogout} />
                <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6 sm:mb-8">
                            <div className="h-8 sm:h-10 w-48 sm:w-72 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-3 sm:h-4 w-64 sm:w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-jcoder-card border border-jcoder rounded-lg p-4 sm:p-6">
                                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-jcoder-secondary rounded mb-2 animate-pulse"></div>
                                    <div className="h-8 sm:h-10 w-16 sm:w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-4 sm:p-6">
                            <TableSkeleton />
                        </div>
                    </div>
                </main>
                <Footer user={user} username={urlUsername || user?.username} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
            {/* WebGL Background - Animated 3D mesh - Hidden on mobile for performance */}
            <div className="hidden md:block">
                <Suspense fallback={null}>
                    <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                </Suspense>
            </div>

            {/* Animated Background - CSS layers for depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Gradient Orbs - Smaller on mobile */}
                <div
                    className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: `${mousePosition.x / 20}px`,
                        top: `${mousePosition.y / 20}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />
                <div
                    className="absolute w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                    style={{
                        right: `${mousePosition.x / 25}px`,
                        bottom: `${mousePosition.y / 25}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />

                {/* Grid Pattern - Smaller on mobile */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
            </div>

            <Header isAdmin={true} onLogout={handleLogout} />

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
                {/* 3D Particles in Background - Hidden on mobile for performance */}
                <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
                    <Suspense fallback={null}>
                        <Canvas
                            camera={{ position: [0, 0, 5], fov: 75 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <FloatingParticles3D />
                        </Canvas>
                    </Suspense>
                </div>

                {/* 3D Logo Element (optional, subtle) - Desktop only */}
                <div className="absolute top-20 right-10 w-32 h-32 pointer-events-none opacity-20 hidden lg:block">
                    <Suspense fallback={null}>
                        <Canvas
                            camera={{ position: [0, 0, 3], fov: 75 }}
                            gl={{ alpha: true, antialias: true }}
                            style={{ width: '100%', height: '100%' }}
                        >
                            <Hero3D mouse={mousePosition} windowSize={windowSize} />
                        </Canvas>
                    </Suspense>
                </div>

                <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Breadcrumb */}
                    <nav className="mb-3 sm:mb-4 md:mb-6">
                        <ol className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-jcoder-muted">
                            <li>
                                <button onClick={() => router.push(`/${urlUsername}/admin`)} className="hover:text-jcoder-primary transition-colors group">
                                    <span className="group-hover:underline">Admin</span>
                                </button>
                            </li>
                            <li>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li className="text-jcoder-foreground font-medium">Technologies</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
                            Technologies Management
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-jcoder-muted">Manage technologies and tech stack for your portfolio</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                        {/* Total Technologies Card */}
                        <div
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
                            style={{
                                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-xs sm:text-sm mb-1">Total Technologies</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-jcoder-foreground">{paginationMeta?.total || 0}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center transform-gpu hover:scale-110 transition-transform flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
                            style={{
                                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
                            }}
                        >
                            <div>
                                <p className="text-jcoder-muted text-xs sm:text-sm mb-2 sm:mb-3">Status</p>
                                <div className="flex items-center justify-between gap-2 sm:gap-4">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-jcoder-muted">Active</p>
                                            <p className="text-xl sm:text-2xl font-bold text-green-500">{totalActive}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 sm:h-12 bg-jcoder"></div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-jcoder-muted">Inactive</p>
                                            <p className="text-xl sm:text-2xl font-bold text-red-500">{totalInactive}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Last Update Card */}
                        <div
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
                            style={{
                                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-jcoder-muted text-xs sm:text-sm mb-1">Last Update</p>
                                    <p className="text-lg sm:text-2xl md:text-3xl font-bold text-jcoder-foreground truncate">{lastUpdate}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center transform-gpu hover:scale-110 transition-transform flex-shrink-0 ml-2">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <Footer user={user} username={urlUsername || user?.username} />

            <style jsx>{`
                @keyframes gradient {
                    0%, 100% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
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

    // Get mouse position and window size from parent component context or use defaults
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });

    // Refs for mouse position throttling
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Update ref immediately
            mousePositionRef.current = { x: e.clientX, y: e.clientY };

            // Throttle state updates using requestAnimationFrame
            if (rafRef.current === null) {
                rafRef.current = requestAnimationFrame(() => {
                    setMousePosition(mousePositionRef.current);
                    rafRef.current = null;
                });
            }
        };
        const updateWindowSize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };
        updateWindowSize();
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('resize', updateWindowSize);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateWindowSize);
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className="bg-jcoder-card/95 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl shadow-jcoder-primary/20 transform-gpu transition-all duration-300"
                style={{
                    transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)` : 'none',
                }}
            >
                <div className="p-4 sm:p-6 border-b border-jcoder">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 hover:bg-jcoder-secondary rounded-lg transition-all duration-200 group"
                            disabled={submitting}
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-jcoder-muted group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent transition-all duration-200 hover:border-jcoder-primary/50"
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
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent transition-all duration-200 hover:border-jcoder-primary/50"
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-jcoder-secondary border border-jcoder rounded-lg">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-jcoder-foreground mb-1">
                                    Status
                                </label>
                                <p className="text-xs sm:text-sm text-jcoder-muted">
                                    {formData.isActive ? 'Technology is visible on the public site' : 'Technology is hidden from the public site'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:ring-offset-2 focus:ring-offset-jcoder-card flex-shrink-0 ${formData.isActive ? 'bg-green-500' : 'bg-gray-600'
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

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="w-full sm:w-auto flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors disabled:opacity-50 text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 font-semibold transform-gpu md:hover:scale-105 md:hover:shadow-lg md:hover:shadow-jcoder-primary/50 active:scale-95 disabled:transform-none flex items-center justify-center gap-2 group text-sm sm:text-base"
                        >
                            {submitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {technology ? 'Update' : 'Create'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}