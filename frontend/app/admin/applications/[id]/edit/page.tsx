
'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { ApplicationService } from '@/services/applications.service';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import { UpdateApplicationDto } from '@/types/entities/dtos/update-application.dto';
import ImageUpload from '@/components/applications/ImageUpload';

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
    });
    const [images, setImages] = useState<string[]>([]);

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
        if (!isAuthenticated || !applicationId) return;

        const fetchApplication = async () => {
            setLoading(true);
            setFormError(null);
            try {
                const data = await ApplicationService.getById(Number(applicationId));

                const updateApplicationDto: UpdateApplicationDto = {
                    name: data.name,
                    githubUrl: data.githubUrl,
                    description: data.description,
                    applicationType: data.applicationType,
                    applicationComponentMobile: {
                        platform: data.applicationComponentMobile!?.platform,
                        downloadUrl: data.applicationComponentMobile!?.downloadUrl,
                    },
                    applicationComponentFrontend: {
                        frontendUrl: data.applicationComponentFrontend!?.frontendUrl,
                        screenshotUrl: data.applicationComponentFrontend!?.screenshotUrl,
                    },
                    applicationComponentLibrary: {
                        readmeContent: data.applicationComponentLibrary!?.readmeContent,
                        packageManagerUrl: data.applicationComponentLibrary!?.packageManagerUrl,
                    },
                    applicationComponentApi: {
                        apiUrl: data?.applicationComponentApi!?.apiUrl,
                        domain: data?.applicationComponentApi!?.domain,
                        documentationUrl: data?.applicationComponentApi!?.documentationUrl,
                        healthCheckEndpoint: data?.applicationComponentApi!?.healthCheckEndpoint,
                    },
                };

                setFormData(updateApplicationDto);
                setImages(data.images || []);
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

            await ApplicationService.update(Number(applicationId), payload);
            toast.success(`${payload.name} successfully updated!`);

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
    }, [formData, router, applicationId]);

    if (!isAuthenticated || loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header isAdmin={true} onLogout={() => router.push('/')} />
                <main className="flex-1 container mx-auto px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">Loading Application...</h1>
                        <p className="text-jcoder-muted">Please wait while we load the application details.</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header isAdmin={true} onLogout={() => router.push('/')} />

            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
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

