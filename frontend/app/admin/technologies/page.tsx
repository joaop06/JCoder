'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { Pagination } from '@/components/pagination/Pagination';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Technology } from '@/types/entities/technology.entity';
import { TechnologiesService } from '@/services/technologies.service';
import { PaginationDto, PaginatedResponse } from '@/types/api/pagination.type';
import { CreateTechnologyDto } from '@/types/entities/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/entities/dtos/update-technology.dto';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';

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

export default function TechnologiesManagementPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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

    const toast = useToast();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchTechnologies();
    }, [isAuthenticated, pagination, filterActive]);

    const fetchTechnologies = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const queryParams: any = { ...pagination };
            if (filterActive !== 'ALL') queryParams.isActive = filterActive;

            const data = await TechnologiesService.query(queryParams);
            setTechnologies(Array.isArray(data.data) ? data.data : []);
            setPaginationMeta(data.meta);
        } catch (err: any) {
            const errorMessage = 'Failed to load technologies. Please try again.';
            toast.error(errorMessage);
            setFetchError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

    const handleCreate = async (formData: CreateTechnologyDto | UpdateTechnologyDto, imageFile?: File | null) => {
        setSubmitting(true);
        try {
            const createdTech = await TechnologiesService.create(formData as CreateTechnologyDto);

            // Upload image if provided
            if (imageFile && createdTech.id) {
                try {
                    await TechnologiesService.uploadProfileImage(createdTech.id, imageFile);
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
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create technology');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: number, formData: CreateTechnologyDto | UpdateTechnologyDto, imageFile?: File | null, deleteImage?: boolean) => {
        setSubmitting(true);
        try {
            // Update technology data
            await TechnologiesService.update(id, formData as UpdateTechnologyDto);

            // Handle image deletion
            if (deleteImage) {
                try {
                    await TechnologiesService.deleteProfileImage(id);
                } catch (delErr: any) {
                    toast.error('Technology updated but image deletion failed: ' + (delErr?.response?.data?.message || 'Unknown error'));
                    fetchTechnologies();
                    setShowEditModal(false);
                    setSelectedTechnology(null);
                    return;
                }
            }

            // Handle image upload/replacement
            if (imageFile) {
                try {
                    await TechnologiesService.uploadProfileImage(id, imageFile);
                } catch (imgErr: any) {
                    toast.error('Technology updated but image upload failed: ' + (imgErr?.response?.data?.message || 'Unknown error'));
                    fetchTechnologies();
                    setShowEditModal(false);
                    setSelectedTechnology(null);
                    return;
                }
            }

            toast.success('Technology updated successfully!');
            setShowEditModal(false);
            setSelectedTechnology(null);
            fetchTechnologies();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update technology');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = useCallback(
        async (technology: Technology) => {
            const confirmed = await toast.confirm(`Are you sure you want to delete ${technology.name}?`, {
                confirmText: 'Delete',
                cancelText: 'Cancel',
            });
            if (!confirmed) return;

            try {
                await TechnologiesService.delete(technology.id);
                toast.success(`${technology.name} successfully deleted!`);
                fetchTechnologies();
            } catch (err) {
                toast.error('Failed to delete technology.');
            }
        },
        []
    );

    const handleToggleActive = async (technology: Technology) => {
        try {
            await TechnologiesService.update(technology.id, {
                isActive: !technology.isActive,
            });
            toast.success(`Technology ${technology.isActive ? 'deactivated' : 'activated'} successfully!`);
            fetchTechnologies();
        } catch (err) {
            toast.error('Failed to update technology status.');
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
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
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
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

    const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const draggedTechnology = technologies[draggedIndex];
        const targetTechnology = technologies[dropIndex];

        try {
            await TechnologiesService.reorder(draggedTechnology.id, targetTechnology.displayOrder);
            toast.success('Technology reordered successfully!');
            fetchTechnologies();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to reorder technology');
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

    const activeTechnologies = useMemo(
        () => technologies.filter((tech) => tech.isActive).length,
        [technologies]
    );

    const formatRelativeDate = (date: Date, locale = 'en-US'): string => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHrs = Math.floor(diffMin / 60);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        if (diffHrs < 24) return `${diffHrs} hours ago`;

        return date.toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    if (!isAuthenticated) {
        return null;
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">Technologies Management</h1>
                            <p className="text-jcoder-muted">Manage technologies and tech stack for your portfolio</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>New Technology</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6">
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

                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-sm mb-1">Active</p>
                                    <p className="text-3xl font-bold text-green-500">{activeTechnologies}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-sm mb-1">Inactive</p>
                                    <p className="text-3xl font-bold text-red-500">{(paginationMeta?.total || 0) - activeTechnologies}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-jcoder-foreground mb-2">Status</label>
                                <select
                                    value={filterActive === 'ALL' ? 'ALL' : filterActive.toString()}
                                    onChange={(e) => setFilterActive(e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true')}
                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setFilterActive('ALL');
                                    }}
                                    className="px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground hover:border-jcoder-primary transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Technologies Table */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary"></div>
                            </div>
                        ) : fetchError ? (
                            <div className="text-center p-12">
                                <p className="text-red-400 mb-4">{fetchError}</p>
                                <button
                                    onClick={fetchTechnologies}
                                    className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : technologies.length === 0 ? (
                            <div className="text-center p-12">
                                <div className="text-6xl mb-4">🚀</div>
                                <p className="text-jcoder-muted text-lg mb-4">No technologies found.</p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
                                >
                                    Create your first technology
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-jcoder-secondary border-b border-jcoder">
                                            <tr>
                                                <th className="px-4 py-4 text-center text-sm font-semibold text-jcoder-foreground w-16"></th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-jcoder-foreground">Technology</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground">Order</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground">Expertise</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground">Status</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-jcoder-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-jcoder">
                                            {technologies.map((tech, index) => (
                                                <tr
                                                    key={tech.id}
                                                    onDragOver={(e) => handleDragOver(e, index)}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={(e) => handleDrop(e, index)}
                                                    className={`transition-colors ${dragOverIndex === index && draggedIndex !== index
                                                        ? 'border-t-2 border-jcoder-primary bg-jcoder-primary/10'
                                                        : 'hover:bg-jcoder-secondary/50'
                                                        }`}
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <div
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, index)}
                                                                onDragEnd={handleDragEnd}
                                                                className="p-2 text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-grab active:cursor-grabbing select-none"
                                                                title="Drag to reorder"
                                                            >
                                                                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {tech.profileImage ? (
                                                                <img
                                                                    src={TechnologiesService.getProfileImageUrl(tech.id)}
                                                                    alt={tech.name}
                                                                    className="w-10 h-10 rounded-lg object-contain bg-jcoder-secondary p-1"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/icons/technologies_and_stacks/default.png';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-jcoder-gradient flex items-center justify-center text-black font-bold">
                                                                    {tech.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-jcoder-foreground">{tech.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-jcoder-foreground font-medium">{tech.displayOrder}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getExpertiseLevelColor(tech.expertiseLevel)}`}>
                                                            {getExpertiseLevelLabel(tech.expertiseLevel)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleToggleActive(tech)}
                                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${tech.isActive
                                                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                                                }`}
                                                        >
                                                            <div className={`w-2 h-2 rounded-full ${tech.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                                            {tech.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTechnology(tech);
                                                                    setShowEditModal(true);
                                                                }}
                                                                className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(tech)}
                                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {paginationMeta && (
                                    <div className="border-t border-jcoder p-4">
                                        <Pagination
                                            meta={paginationMeta}
                                            onPageChange={handlePageChange}
                                            onLimitChange={handleLimitChange}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
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

                    {/* Profile Image Section */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-jcoder-foreground">Profile Image</label>

                        {/* Current Image (Edit Mode) */}
                        {isEditMode && technology?.profileImage && !preview && !deleteImage && (
                            <div className="flex items-center gap-4 p-4 bg-jcoder-secondary rounded-lg border border-jcoder">
                                <img
                                    src={TechnologiesService.getProfileImageUrl(technology.id)}
                                    alt={technology.name}
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