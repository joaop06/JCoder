
'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { LazyImage, TableSkeleton } from '@/components/ui';
import { useToast } from '@/components/toast/ToastContext';
import ImageUpload from '@/components/applications/ImageUpload';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import TechnologySelector from '@/components/applications/TechnologySelector';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { UpdateApplicationDto } from '@/types/api/applications/dtos/update-application.dto';

export default function EditApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState<UpdateApplicationDto>({
        name: '',
        description: '',
        applicationType: ApplicationTypeEnum.API,
        isActive: true,
    });
    const [images, setImages] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null);
    const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null);
    const [pendingProfileImageAction, setPendingProfileImageAction] = useState<'none' | 'upload' | 'update' | 'delete'>('none');

    const toast = useToast();

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/sign-in');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

    useEffect(() => {
        if (!isAuthenticated || !applicationId) return;

        const fetchApplication = async () => {
            setLoading(true);
            setFormError(null);
            try {
                const userSession = UsersService.getUserSession();
                if (!userSession?.user?.username) {
                    throw new Error('User session not found');
                }
                const data = await ApplicationService.getById(userSession.user.username, Number(applicationId));

                const updateApplicationDto: UpdateApplicationDto = {
                    name: data.name,
                    githubUrl: data.githubUrl,
                    description: data.description,
                    applicationType: data.applicationType,
                    isActive: data.isActive ?? true,
                    technologyIds: data.technologies?.map(t => t.id) || [],
                    applicationComponentMobile: data.applicationComponentMobile ? {
                        ...data.applicationComponentMobile,
                    } : undefined,
                    applicationComponentFrontend: data.applicationComponentFrontend ? {
                        ...data.applicationComponentFrontend,
                    } : undefined,
                    applicationComponentLibrary: data.applicationComponentLibrary ? {
                        ...data.applicationComponentLibrary,
                    } : undefined,
                    applicationComponentApi: data.applicationComponentApi ? {
                        ...data.applicationComponentApi,
                    } : undefined,
                };

                setFormData(updateApplicationDto);
                setImages(data.images || []);
                setProfileImage(data.profileImage || null);
                setOriginalProfileImage(data.profileImage || null);
            } catch (err: any) {
                const errorMessage = err?.response?.data?.message
                    || err.message
                    || 'Failed to load application. Please try again.';

                toast.error(errorMessage);
                setFormError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [isAuthenticated, applicationId]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);


        try {
            const payload: UpdateApplicationDto = { ...formData };

            // Clean up components based on applicationType
            switch (payload.applicationType) {
                case ApplicationTypeEnum.API:
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentLibrary;
                    delete payload.applicationComponentFrontend;
                    break;
                case ApplicationTypeEnum.FRONTEND:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentLibrary;
                    break;
                case ApplicationTypeEnum.MOBILE:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentLibrary;
                    delete payload.applicationComponentFrontend;
                    break;
                case ApplicationTypeEnum.LIBRARY:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentFrontend;
                    break;
                case ApplicationTypeEnum.FULLSTACK:
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentLibrary;
                    break;
                default:
                    break;
            }

            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            await ApplicationService.update(userSession.user.username, Number(applicationId), payload);
            toast.success(`${payload.name} successfully updated!`);

            // Apply profile image changes only after successful application update

            if (pendingProfileImageAction !== 'none') {
                try {
                    switch (pendingProfileImageAction) {
                        case 'upload':
                            if (pendingProfileImageFile) {
                                await ImagesService.uploadApplicationProfileImage(userSession.user.username, Number(applicationId), pendingProfileImageFile);
                                toast.success('Profile image uploaded successfully!');
                            }
                            break;
                        case 'update':
                            if (pendingProfileImageFile) {
                                await ImagesService.updateApplicationProfileImage(userSession.user.username, Number(applicationId), pendingProfileImageFile);
                                toast.success('Profile image updated successfully!');
                            }
                            break;
                        case 'delete':
                            await ImagesService.deleteApplicationProfileImage(userSession.user.username, Number(applicationId));
                            toast.success('Profile image deleted successfully!');
                            break;
                    }

                    // Reset pending states after successful application
                    setPendingProfileImageFile(null);
                    setPendingProfileImageAction('none');
                } catch (error: any) {
                    console.error('Error updating profile image:', error);
                    const errorMessage = error?.response?.data?.message
                        || error?.message
                        || 'Failed to update profile image';
                    toast.error(`Application updated but failed to update profile image: ${errorMessage}. You can update it later.`);
                }
            }

            router.push('/admin');
        } catch (err: any) {
            console.error('Error updating application:', err);
            const errorMessage = err?.response?.data?.message
                || err.message
                || 'Failed to update application. Please try again.';

            toast.error(errorMessage);
            setFormError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, router, applicationId, pendingProfileImageAction, pendingProfileImageFile, profileImage, toast]);

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={() => router.push('/')} />
                <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <div className="h-8 w-48 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                            <div className="h-4 w-64 bg-jcoder-secondary rounded-lg animate-pulse"></div>
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
            <Header isAdmin={true} onLogout={() => router.push('/')} />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-jcoder-muted hover:text-jcoder-primary transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">Edit Application</h1>
                        <p className="text-jcoder-muted">Edit the details of your application</p>
                    </div>

                    <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 shadow-lg hover:shadow-xl hover:shadow-jcoder-primary/20 transition-all duration-300">
                        <form onSubmit={handleSubmit}>
                            {formError && (
                                <div className="mb-4 p-3 border border-red-400 bg-red-900/20 text-red-400 rounded">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-jcoder-muted">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-jcoder-muted">Description</label>
                                    <textarea
                                        name="description"
                                        id="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={3}
                                        className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="applicationType" className="block text-sm font-medium text-jcoder-muted">Application Type</label>
                                    <select
                                        name="applicationType"
                                        id="applicationType"
                                        value={formData.applicationType}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                    >
                                        {Object.values(ApplicationTypeEnum).map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="githubUrl" className="block text-sm font-medium text-jcoder-muted">GitHub URL (Optional)</label>
                                    <input
                                        type="url"
                                        id="githubUrl"
                                        name="githubUrl"
                                        onChange={handleChange}
                                        value={formData.githubUrl || ''}
                                        className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                    />
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div className="mt-6 pt-6 border-t border-jcoder">
                                <div className="flex items-center justify-between p-4 bg-jcoder-secondary border border-jcoder rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-jcoder-foreground mb-1">
                                            Application Status
                                        </label>
                                        <p className="text-sm text-jcoder-muted">
                                            {formData.isActive ? 'Application is visible on the public site' : 'Application is hidden from the public site'}
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
                            </div>

                            {/* Conditional Component Fields */}
                            {formData.applicationType === ApplicationTypeEnum.API && (
                                <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4">API Component Details</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="api-domain" className="block text-sm font-medium text-jcoder-muted">Domain</label>
                                            <input
                                                type="text"
                                                name="applicationComponentApi.domain"
                                                id="api-domain"
                                                value={formData.applicationComponentApi?.domain || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="api-apiUrl" className="block text-sm font-medium text-jcoder-muted">API URL</label>
                                            <input
                                                type="url"
                                                name="applicationComponentApi.apiUrl"
                                                id="api-apiUrl"
                                                value={formData.applicationComponentApi?.apiUrl || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="api-documentationUrl" className="block text-sm font-medium text-jcoder-muted">Documentation URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="applicationComponentApi.documentationUrl"
                                                id="api-documentationUrl"
                                                value={formData.applicationComponentApi?.documentationUrl || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="api-healthCheckEndpoint" className="block text-sm font-medium text-jcoder-muted">Health Check Endpoint (Optional)</label>
                                            <input
                                                type="text"
                                                name="applicationComponentApi.healthCheckEndpoint"
                                                id="api-healthCheckEndpoint"
                                                value={formData.applicationComponentApi?.healthCheckEndpoint || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.applicationType === ApplicationTypeEnum.FRONTEND && (
                                <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Frontend Component Details</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="frontend-frontendUrl" className="block text-sm font-medium text-jcoder-muted">Frontend URL</label>
                                            <input
                                                type="url"
                                                name="applicationComponentFrontend.frontendUrl"
                                                id="frontend-frontendUrl"
                                                value={formData.applicationComponentFrontend?.frontendUrl || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="frontend-screenshotUrl" className="block text-sm font-medium text-jcoder-muted">Screenshot URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="applicationComponentFrontend.screenshotUrl"
                                                id="frontend-screenshotUrl"
                                                value={formData.applicationComponentFrontend?.screenshotUrl || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.applicationType === ApplicationTypeEnum.MOBILE && (
                                <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Mobile Component Details</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="mobile-platform" className="block text-sm font-medium text-jcoder-muted">Platform</label>
                                            <select
                                                name="applicationComponentMobile.platform"
                                                id="mobile-platform"
                                                value={formData.applicationComponentMobile?.platform || 'Android'}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            >
                                                <option value="iOS">iOS</option>
                                                <option value="Android">Android</option>
                                                <option value="Multiplatform">Multiplatform</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="mobile-downloadUrl" className="block text-sm font-medium text-jcoder-muted">Download URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="applicationComponentMobile.downloadUrl"
                                                id="mobile-downloadUrl"
                                                value={formData.applicationComponentMobile?.downloadUrl || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.applicationType === ApplicationTypeEnum.LIBRARY && (
                                <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Library Component Details</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="library-packageManagerUrl" className="block text-sm font-medium text-jcoder-muted">Package Manager URL</label>
                                            <input
                                                type="url"
                                                name="applicationComponentLibrary.packageManagerUrl"
                                                id="library-packageManagerUrl"
                                                value={formData.applicationComponentLibrary?.packageManagerUrl || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="library-readmeContent" className="block text-sm font-medium text-jcoder-muted">README Content (Optional)</label>
                                            <textarea
                                                name="applicationComponentLibrary.readmeContent"
                                                id="library-readmeContent"
                                                value={formData.applicationComponentLibrary?.readmeContent || ''}
                                                onChange={handleChange}
                                                rows={5}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.applicationType === ApplicationTypeEnum.FULLSTACK && (
                                <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Frontend Component Details</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="fullstack-frontendUrl" className="block text-sm font-medium text-jcoder-muted">Frontend URL</label>
                                            <input
                                                type="url"
                                                name="applicationComponentFrontend.frontendUrl"
                                                id="fullstack-frontendUrl"
                                                value={formData.applicationComponentFrontend?.frontendUrl || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fullstack-screenshotUrl" className="block text-sm font-medium text-jcoder-muted">Screenshot URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="applicationComponentFrontend.screenshotUrl"
                                                id="fullstack-screenshotUrl"
                                                value={formData.applicationComponentFrontend?.screenshotUrl || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-medium text-jcoder-foreground mb-4 mt-6">API Component Details (for Fullstack)</h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="fullstack-api-domain" className="block text-sm font-medium text-jcoder-muted">Domain</label>
                                            <input
                                                type="text"
                                                name="applicationComponentApi.domain"
                                                id="fullstack-api-domain"
                                                value={formData.applicationComponentApi?.domain || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fullstack-api-apiUrl" className="block text-sm font-medium text-jcoder-muted">API URL</label>
                                            <input
                                                type="url"
                                                name="applicationComponentApi.apiUrl"
                                                id="fullstack-api-apiUrl"
                                                value={formData.applicationComponentApi?.apiUrl || ''}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fullstack-api-documentationUrl" className="block text-sm font-medium text-jcoder-muted">Documentation URL (Optional)</label>
                                            <input
                                                type="url"
                                                name="applicationComponentApi.documentationUrl"
                                                id="fullstack-api-documentationUrl"
                                                value={formData.applicationComponentApi?.documentationUrl || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="fullstack-api-healthCheckEndpoint" className="block text-sm font-medium text-jcoder-muted">Health Check Endpoint (Optional)</label>
                                            <input
                                                type="text"
                                                name="applicationComponentApi.healthCheckEndpoint"
                                                id="fullstack-api-healthCheckEndpoint"
                                                value={formData.applicationComponentApi?.healthCheckEndpoint || ''}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Technologies Section */}
                            <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Technologies</h3>
                                <p className="text-sm text-jcoder-muted mb-4">
                                    Select the technologies used in this application
                                </p>
                                <TechnologySelector
                                    selectedTechnologyIds={formData.technologyIds || []}
                                    onSelectionChange={(technologyIds) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            technologyIds,
                                        }));
                                    }}
                                    disabled={loading}
                                />
                            </div>

                            {/* Profile Image Management Section */}
                            <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Profile Image</h3>
                                <p className="text-sm text-jcoder-muted mb-4">
                                    Manage the logo or profile image for your application
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            {pendingProfileImageFile ? (
                                                <img
                                                    src={URL.createObjectURL(pendingProfileImageFile)}
                                                    alt="Profile preview"
                                                    className="w-20 h-20 rounded-lg object-cover border border-jcoder"
                                                />
                                            ) : profileImage ? (
                                                <LazyImage
                                                    src={(() => {
                                                        const userSession = UsersService.getUserSession();
                                                        const username = userSession?.user?.username || '';
                                                        return username ? ImagesService.getApplicationProfileImageUrl(username, Number(applicationId)) : '';
                                                    })()}
                                                    alt="Current profile"
                                                    fallback={formData.name!}
                                                    className="border border-jcoder object-cover"
                                                    size="custom"
                                                    width="w-20"
                                                    height="h-20"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-jcoder flex items-center justify-center bg-jcoder-secondary">
                                                    <svg
                                                        className="w-8 h-8 text-jcoder-muted"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-jcoder-muted">
                                                {pendingProfileImageAction === 'delete'
                                                    ? 'Profile image will be deleted'
                                                    : pendingProfileImageFile
                                                        ? 'New profile image selected'
                                                        : profileImage
                                                            ? 'Current profile image'
                                                            : 'No profile image set'
                                                }
                                            </p>
                                            <p className="text-xs text-jcoder-muted">
                                                Recommended: 400x400px, max 5MB
                                            </p>
                                            {pendingProfileImageAction !== 'none' && (
                                                <p className="text-xs text-yellow-400 mt-1">
                                                    Changes will be applied when you save the application
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <label className="px-4 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm cursor-pointer">
                                            {profileImage ? 'Change Image' : 'Upload Image'}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        // Validate file type
                                                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                                                        if (!allowedTypes.includes(file.type)) {
                                                            toast.error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
                                                            return;
                                                        }

                                                        // Validate file size (5MB)
                                                        const maxSize = 5 * 1024 * 1024; // 5MB
                                                        if (file.size > maxSize) {
                                                            toast.error('File too large. Maximum size is 5MB.');
                                                            return;
                                                        }

                                                        setPendingProfileImageFile(file);
                                                        const action = profileImage ? 'update' : 'upload';
                                                        setPendingProfileImageAction(action);
                                                    }
                                                }}
                                                disabled={loading}
                                                className="hidden"
                                            />
                                        </label>

                                        {profileImage && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPendingProfileImageFile(null);
                                                    setPendingProfileImageAction('delete');
                                                }}
                                                disabled={loading}
                                                className="px-4 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                            >
                                                Delete Image
                                            </button>
                                        )}

                                        {pendingProfileImageAction !== 'none' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPendingProfileImageFile(null);
                                                    setPendingProfileImageAction('none');
                                                }}
                                                disabled={loading}
                                                className="px-4 py-2 border border-jcoder text-jcoder-muted rounded-md hover:bg-jcoder-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                            >
                                                Cancel Changes
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Application Images</h3>
                                <ImageUpload
                                    images={images}
                                    onImagesChange={setImages}
                                    applicationId={Number(applicationId)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin')}
                                    className="px-6 py-2 border border-jcoder rounded-md text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 font-medium"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

