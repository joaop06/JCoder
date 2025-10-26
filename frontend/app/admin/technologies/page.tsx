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
import { TechnologyCategoryEnum, TechnologyCategoryLabels } from '@/types/enums/technology-category.enum';
import { CreateTechnologyDto } from '@/types/entities/dtos/create-technology.dto';
import { UpdateTechnologyDto } from '@/types/entities/dtos/update-technology.dto';

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
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Filter states
    const [filterCategory, setFilterCategory] = useState<TechnologyCategoryEnum | 'ALL'>('ALL');
    const [filterActive, setFilterActive] = useState<boolean | 'ALL'>('ALL');

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
    }, [isAuthenticated, pagination, filterCategory, filterActive]);

    const fetchTechnologies = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const queryParams: any = { ...pagination };
            if (filterCategory !== 'ALL') queryParams.category = filterCategory;
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

    const handleCreate = async (formData: CreateTechnologyDto) => {
        setSubmitting(true);
        try {
            await TechnologiesService.create(formData);
            toast.success('Technology created successfully!');
            setShowCreateModal(false);
            fetchTechnologies();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create technology');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: number, formData: UpdateTechnologyDto) => {
        setSubmitting(true);
        try {
            await TechnologiesService.update(id, formData);
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

    const handleUploadImage = async (id: number, file: File) => {
        setSubmitting(true);
        try {
            await TechnologiesService.uploadProfileImage(id, file);
            toast.success('Profile image uploaded successfully!');
            setShowImageModal(false);
            setSelectedTechnology(null);
            fetchTechnologies();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to upload image');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteImage = async (id: number) => {
        const confirmed = await toast.confirm('Are you sure you want to delete the profile image?', {
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!confirmed) return;

        try {
            await TechnologiesService.deleteProfileImage(id);
            toast.success('Profile image deleted successfully!');
            fetchTechnologies();
        } catch (err) {
            toast.error('Failed to delete profile image.');
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

                        <div className="bg-jcoder-card border border-jcoder rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-jcoder-muted text-sm mb-1">Categories</p>
                                    <p className="text-3xl font-bold text-jcoder-primary">
                                        {Object.keys(TechnologyCategoryEnum).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-jcoder-primary/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-jcoder-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-jcoder-foreground mb-2">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value as any)}
                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                                >
                                    <option value="ALL">All Categories</option>
                                    {Object.entries(TechnologyCategoryEnum).map(([key, value]) => (
                                        <option key={key} value={value}>
                                            {TechnologyCategoryLabels[value]}
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                                        setFilterCategory('ALL');
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
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-jcoder-foreground">Technology</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-jcoder-foreground">Category</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground">Order</th>
                                                <th className="px-6 py-4 text-center text-sm font-semibold text-jcoder-foreground">Status</th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-jcoder-foreground">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-jcoder">
                                            {technologies.map((tech) => (
                                                <tr key={tech.id} className="hover:bg-jcoder-secondary/50 transition-colors">
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
                                                                {tech.description && (
                                                                    <p className="text-sm text-jcoder-muted truncate max-w-xs">
                                                                        {tech.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-jcoder-primary/20 text-jcoder-primary">
                                                            {TechnologyCategoryLabels[tech.category]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-jcoder-foreground font-medium">{tech.displayOrder}</span>
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
                                                                    setShowImageModal(true);
                                                                }}
                                                                className="p-2 text-jcoder-primary hover:bg-jcoder-primary/10 rounded-lg transition-colors"
                                                                title="Manage Image"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
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
                                            currentPage={paginationMeta.page}
                                            totalPages={paginationMeta.totalPages}
                                            onPageChange={handlePageChange}
                                            itemsPerPage={pagination.limit || 10}
                                            onItemsPerPageChange={handleLimitChange}
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
                    onSubmit={(data) => handleUpdate(selectedTechnology.id, data)}
                    submitting={submitting}
                />
            )}

            {/* Image Modal */}
            {showImageModal && selectedTechnology && (
                <ImageUploadModal
                    technology={selectedTechnology}
                    onClose={() => {
                        setShowImageModal(false);
                        setSelectedTechnology(null);
                    }}
                    onUpload={(file) => handleUploadImage(selectedTechnology.id, file)}
                    onDelete={() => handleDeleteImage(selectedTechnology.id)}
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
    onSubmit: (data: CreateTechnologyDto | UpdateTechnologyDto) => void;
    submitting: boolean;
}

function TechnologyFormModal({ title, technology, onClose, onSubmit, submitting }: TechnologyFormModalProps) {
    const [formData, setFormData] = useState({
        name: technology?.name || '',
        description: technology?.description || '',
        category: technology?.category || TechnologyCategoryEnum.BACKEND,
        displayOrder: technology?.displayOrder || 999,
        officialUrl: technology?.officialUrl || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
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
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary resize-none"
                            placeholder="Brief description of the technology"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value as TechnologyCategoryEnum })}
                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                            >
                                {Object.entries(TechnologyCategoryEnum).map(([key, value]) => (
                                    <option key={key} value={value}>
                                        {TechnologyCategoryLabels[value]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-jcoder-foreground mb-2">Display Order</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">Official Website URL</label>
                        <input
                            type="url"
                            value={formData.officialUrl}
                            onChange={(e) => setFormData({ ...formData, officialUrl: e.target.value })}
                            className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:border-jcoder-primary"
                            placeholder="https://example.com"
                        />
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

// Image Upload Modal Component
interface ImageUploadModalProps {
    technology: Technology;
    onClose: () => void;
    onUpload: (file: File) => void;
    onDelete: () => void;
    submitting: boolean;
}

function ImageUploadModal({ technology, onClose, onUpload, onDelete, submitting }: ImageUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            onUpload(selectedFile);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-jcoder-card border border-jcoder rounded-lg max-w-lg w-full">
                <div className="p-6 border-b border-jcoder">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-jcoder-foreground">Manage Profile Image</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-jcoder-secondary rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-jcoder-muted mt-2">{technology.name}</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Image */}
                    {technology.profileImage && !preview && (
                        <div>
                            <label className="block text-sm font-medium text-jcoder-foreground mb-2">Current Image</label>
                            <div className="flex items-center gap-4">
                                <img
                                    src={TechnologiesService.getProfileImageUrl(technology.id)}
                                    alt={technology.name}
                                    className="w-24 h-24 rounded-lg object-contain bg-jcoder-secondary p-2"
                                />
                                <button
                                    onClick={onDelete}
                                    disabled={submitting}
                                    className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                >
                                    Delete Image
                                </button>
                            </div>
                        </div>
                    )}

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                            {technology.profileImage ? 'Replace Image' : 'Upload Image'}
                        </label>
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

                    {/* Preview */}
                    {preview && (
                        <div>
                            <label className="block text-sm font-medium text-jcoder-foreground mb-2">Preview</label>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-48 rounded-lg object-contain bg-jcoder-secondary p-4"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 border border-jcoder text-jcoder-foreground rounded-lg hover:border-jcoder-primary transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        {selectedFile && (
                            <button
                                onClick={handleUpload}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
                            >
                                {submitting ? 'Uploading...' : 'Upload'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
