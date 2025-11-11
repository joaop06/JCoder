'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { PaginationDto } from '@/types/api/pagination.dto';
import { useState, useEffect, useMemo, useCallback, memo, Suspense, useRef } from 'react';
import { Application } from '@/types/api/applications/application.entity';
import { LazyImage, TableSkeleton, ManagementTable } from '@/components/ui';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

// Memoized Application Row Component (Desktop)
interface ApplicationRowProps {
    app: Application;
    index: number;
    draggedIndex: number | null;
    dragOverIndex: number | null;
    onEdit: (app: Application) => void;
    onDelete: (app: Application) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLTableRowElement>) => void;
    onDrop: (e: React.DragEvent<HTMLTableRowElement>, index: number) => void;
}

const ApplicationRow = memo(({
    app,
    index,
    draggedIndex,
    dragOverIndex,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: ApplicationRowProps) => {
    return (
        <tr
            onDragOver={(e) => onDragOver(e, index)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, index)}
            className={`group relative transition-all duration-200 ${
                dragOverIndex === index && draggedIndex !== index
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
                        onClick={() => onEdit(app)}
                        className="p-2 text-blue-500 hover:bg-blue-500/15 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-md hover:shadow-blue-500/20"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(app)}
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
                    {app.profileImage ? (
                        <LazyImage
                            src={(() => {
                                const userSession = UsersService.getUserSession();
                                const username = userSession?.user?.username || '';
                                return username ? ImagesService.getApplicationProfileImageUrl(username, app.id) : '';
                            })()}
                            alt={app.name}
                            fallback={app.name}
                            className="bg-jcoder-secondary p-1 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
                            size="small"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105">
                            {app.name?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-jcoder-foreground truncate group-hover:text-jcoder-primary transition-colors duration-200">{app.name}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-5 text-center">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-jcoder-foreground bg-jcoder-secondary/50 border border-jcoder/30 whitespace-nowrap group-hover:bg-jcoder-secondary group-hover:border-jcoder-primary/30 transition-all duration-200">
                    {app.applicationType}
                </span>
            </td>
            <td className="px-4 py-5 text-center">
                {app.githubUrl ? (
                    <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jcoder-primary hover:text-jcoder-accent transition-all duration-200 inline-flex items-center gap-1.5 text-sm font-medium hover:underline group/link"
                        title={app.githubUrl}
                    >
                        <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        GitHub
                    </a>
                ) : (
                    <span className="text-jcoder-muted/50 text-sm">—</span>
                )}
            </td>
            <td className="px-4 py-5">
                <p className="text-sm text-jcoder-muted truncate max-w-xs group-hover:text-jcoder-foreground/70 transition-colors duration-200">{app.description}</p>
            </td>
            <td className="px-4 py-5 text-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-sm transition-all duration-200 ${
                    app.isActive
                        ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-500 border border-green-500/30 group-hover:from-green-500/30 group-hover:to-green-500/20 group-hover:shadow-green-500/20'
                        : 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-500 border border-red-500/30 group-hover:from-red-500/30 group-hover:to-red-500/20 group-hover:shadow-red-500/20'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${app.isActive ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
                    {app.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
        </tr>
    );
});

ApplicationRow.displayName = 'ApplicationRow';

// Memoized Application Card Component (Mobile)
interface ApplicationCardProps {
    app: Application;
    index: number;
    draggedIndex: number | null;
    dragOverIndex: number | null;
    onEdit: (app: Application) => void;
    onDelete: (app: Application) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
}

const ApplicationCard = memo(({
    app,
    index,
    draggedIndex,
    dragOverIndex,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
}: ApplicationCardProps) => {
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

                {/* Image/Avatar */}
                {app.profileImage ? (
                    <LazyImage
                        src={(() => {
                            const userSession = UsersService.getUserSession();
                            const username = userSession?.user?.username || '';
                            return username ? ImagesService.getApplicationProfileImageUrl(username, app.id) : '';
                        })()}
                        alt={app.name}
                        fallback={app.name}
                        className="bg-jcoder-secondary p-1 object-cover rounded-lg"
                        size="custom"
                        width="w-14"
                        height="h-14"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold flex-shrink-0 text-lg">
                        {app.name?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>
                )}

                {/* Name and Type - Main Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-jcoder-foreground truncate mb-1">{app.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-jcoder-muted bg-jcoder-secondary px-2 py-0.5 rounded-md">
                            {app.applicationType}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${app.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-red-500/20 text-red-500'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${app.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {app.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Description - Collapsed by default, expandable */}
            {app.description && (
                <p className="text-sm text-jcoder-muted mb-3 line-clamp-2 px-1">{app.description}</p>
            )}

            {/* Footer - Actions and Links */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-jcoder/50">
                {/* GitHub Link */}
                {app.githubUrl ? (
                    <a
                        href={app.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jcoder-primary hover:text-jcoder-accent transition-colors inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium"
                        title={app.githubUrl}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        GitHub
                    </a>
                ) : (
                    <span className="text-jcoder-muted/60 text-xs">No link</span>
                )}

                {/* Action Buttons - More compact */}
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(app)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors active:scale-95"
                        title="Edit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(app)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors active:scale-95"
                        title="Delete"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
});

ApplicationCard.displayName = 'ApplicationCard';

export default function ApplicationsManagementPage() {
    const router = useRouter();

    const params = useParams();
    const username = useMemo(() => {
        const raw = params?.username;
        return Array.isArray(raw) ? raw[0] : raw || '';
    }, [params]);

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [pagination, setPagination] = useState<PaginationDto>({
        page: 1,
        limit: 10,
        sortOrder: 'ASC',
        sortBy: 'displayOrder',
    });
    const [paginationMeta, setPaginationMeta] = useState<any>(null);

    // Drag and drop states
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [tempApplications, setTempApplications] = useState<Application[]>([]);
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
    const displayApplications = isDragging ? tempApplications : applications;

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
                if (username) {
                    const userProfile = await UsersService.getProfile(username);
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
    }, [router, username]);

    const fetchStats = useCallback(async () => {
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const stats = await ApplicationService.getStats(userSession.user.username);
            setTotalActive(stats.active);
            setTotalInactive(stats.inactive);
        } catch (err: any) {
            // Silently fail for stats, don't show error to user
            console.error('Failed to fetch application stats:', err);
        }
    }, []);

    const fetchApplications = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const data = await ApplicationService.findAll(userSession.user.username, pagination);
            setApplications(Array.isArray(data.data) ? data.data : []);
            setPaginationMeta(data.meta);
        } catch (err: any) {
            const errorMessage = 'The applications could not be loaded. Please try again.';
            toast.error(errorMessage);
            setFetchError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [pagination, toast]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchApplications();
        fetchStats();
    }, [isAuthenticated, fetchApplications, fetchStats]);

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

    const handleDelete = useCallback(
        async (application: Application) => {
            const confirmed = await toast.confirm(`Are you sure you want to delete ${application.name}?`, {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            });
            if (!confirmed) return;

            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                await ApplicationService.delete(userSession.user.username, application.id);
                toast.success(`${application.name} successfully deleted!`);
                fetchApplications();
                fetchStats();
            } catch (err) {
                toast.error('The application could not be deleted.');
            }
        },
        [toast, fetchApplications, fetchStats]
    );

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        setIsDragging(true);
        setTempApplications([...applications]);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());

        // Find the parent row and add opacity
        const row = e.currentTarget.closest('tr');
        if (row) {
            row.style.opacity = '0.5';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        // Find the parent row and restore opacity
        const row = e.currentTarget.closest('tr');
        if (row) {
            row.style.opacity = '1';
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
        setTempApplications([]);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && dragOverIndex !== index) {
            setDragOverIndex(index);

            // Reorganize array visually during drag
            const newArray = [...applications];
            const draggedItem = newArray[draggedIndex];
            newArray.splice(draggedIndex, 1);
            newArray.splice(index, 0, draggedItem);

            setTempApplications(newArray);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>) => {
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
    };

    const handleDrop = useCallback(async (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            setTempApplications([]);
            return;
        }

        // Get the items from the original array
        const draggedApplication = applications[draggedIndex];
        const targetApplication = applications[dropIndex];

        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await ApplicationService.reorder(userSession.user.username, draggedApplication.id, (targetApplication as any).displayOrder || 1);
            toast.success('Application reordered successfully!');

            // Update local state with the new order instead of reloading
            const newArray = [...applications];
            const draggedItem = newArray[draggedIndex];
            newArray.splice(draggedIndex, 1);
            newArray.splice(dropIndex, 0, draggedItem);
            setApplications(newArray);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to reorder application');
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            setTempApplications([]);
        }
    }, [draggedIndex, applications, toast]);

    const formatRelativeDate = (date: Date, locale = 'en-US'): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHrs / 24);

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
    }

    const parseToDate = (value: string | number | Date | null | undefined): Date | null => {
        if (!value) return null;
        const d = value instanceof Date ? value : new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }

    const lastUpdate = useMemo(() => {
        if (!applications?.length) return 'Never';

        // For each application, we took the most recent one between updatedAt and createdAt
        const latestDates: Date[] = applications
            .map((app: Application) => {
                const created = parseToDate(app.createdAt);
                const updated = parseToDate(app.updatedAt);
                if (created && updated) return updated > created ? updated : created;
                return updated ?? created ?? null;
            })
            .filter((d): d is Date => d !== null);

        if (!latestDates.length) return 'Never';

        // Select the most recent date from all of them
        const mostRecent = latestDates.reduce((a, b) => (a > b ? a : b));

        return formatRelativeDate(mostRecent, 'en-US');
    }, [applications]);

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
                            <div className="h-8 sm:h-10 w-48 sm:w-64 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
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
                <Footer user={user} username={username || user?.username} />
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
                                <button onClick={() => router.push(`/${username}/admin`)} className="hover:text-jcoder-primary transition-colors group">
                                    <span className="group-hover:underline">Admin</span>
                                </button>
                            </li>
                            <li>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </li>
                            <li className="text-jcoder-foreground font-medium">Applications</li>
                        </ol>
                    </nav>

                    {/* Page Header */}
                    <div className="mb-4 sm:mb-6 md:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
                            Applications Management
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-jcoder-muted">Create, update, and delete portfolio applications</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                        {/* Total Applications Card */}
                        <div
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
                            style={{
                                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-xs sm:text-sm mb-1">Total Applications</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-jcoder-foreground">{paginationMeta?.total || 0}</p>
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center transform-gpu hover:scale-110 transition-transform flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
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
                            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1"
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

                    {/* Applications Table */}
                    <ManagementTable
                        title="Applications"
                        subtitle="Manage all portfolio applications"
                        actionButton={{
                            label: 'New Application',
                            icon: (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            ),
                            onClick: () => router.push(`/${username}/admin/applications/new`),
                        }}
                        columns={[
                            { label: '', className: 'px-2 py-4 text-center text-sm font-semibold text-jcoder-foreground w-12' },
                            { label: 'Actions', className: 'px-3 py-4 text-center text-sm font-semibold text-jcoder-foreground w-24' },
                            { label: 'Name', className: 'px-4 py-4 text-left text-sm font-semibold text-jcoder-foreground' },
                            { label: 'Type', className: 'px-3 py-4 text-center text-sm font-semibold text-jcoder-foreground w-28' },
                            { label: 'URL (GitHub)', className: 'px-3 py-4 text-center text-sm font-semibold text-jcoder-foreground w-28' },
                            { label: 'Description', className: 'px-4 py-4 text-left text-sm font-semibold text-jcoder-foreground' },
                            { label: 'Status', className: 'px-3 py-4 text-center text-sm font-semibold text-jcoder-foreground w-28' },
                        ]}
                        data={displayApplications}
                        loading={loading}
                        error={fetchError}
                        renderDesktopRow={(app, index) => (
                            <ApplicationRow
                                key={app.id}
                                app={app}
                                index={index}
                                draggedIndex={draggedIndex}
                                dragOverIndex={dragOverIndex}
                                onEdit={(app) => router.push(`/${username}/admin/applications/${app.id}/edit`)}
                                onDelete={handleDelete}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            />
                        )}
                        renderMobileCard={(app, index) => (
                            <ApplicationCard
                                key={app.id}
                                app={app}
                                index={index}
                                draggedIndex={draggedIndex}
                                dragOverIndex={dragOverIndex}
                                onEdit={(app) => router.push(`/${username}/admin/applications/${app.id}/edit`)}
                                onDelete={handleDelete}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            />
                        )}
                        emptyState={{
                            icon: '📱',
                            message: 'No applications found.',
                        }}
                        paginationMeta={paginationMeta}
                        onPageChange={handlePageChange}
                        onLimitChange={handleLimitChange}
                        onRetry={fetchApplications}
                    />
                </div>
            </main>

            <Footer user={user} username={username || user?.username} />

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

