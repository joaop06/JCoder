'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { UsersService } from '@/services/users.service';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import ImageUpload from '@/components/applications/ImageUpload';
import { ApplicationService } from '@/services/applications.service';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import { CreateApplicationDto } from '@/types/entities/dtos/create-application.dto';

export default function NewApplicationPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateApplicationDto>({
        name: '',
        description: '',
        applicationType: ApplicationTypeEnum.API,
    });
    const [images, setImages] = useState<string[]>([]);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    const toast = useToast();


    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
            router.push('/login');
            return;
        }
        setIsAuthenticated(true);
    }, [router]);

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
            const payload: CreateApplicationDto = { ...formData };

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

            const createdApplication = await ApplicationService.create(payload);

            // Show success message for application creation
            toast.success(`${payload.name} successfully created!`);

            // Upload profile image if provided - only after successful creation

            if (profileImageFile) {
                try {
                    await ApplicationService.uploadProfileImage(createdApplication.id, profileImageFile);
                    toast.success('Profile image uploaded successfully!');
                } catch (error: any) {
                    console.error('Error uploading profile image:', error);
                    const errorMessage = error?.response?.data?.message
                        || error?.message
                        || 'Failed to upload profile image';
                    toast.error(`Application created but failed to upload profile image: ${errorMessage}. You can add it later.`);
                }
            }

            // Upload images if any - only after successful creation
            if (images.length > 0) {
                try {
                    // Convert data URLs to File objects for upload
                    const files: File[] = [];
                    for (let i = 0; i < images.length; i++) {
                        const image = images[i];
                        if (image.startsWith('data:')) {
                            // Parse data URL
                            const [header, data] = image.split(',');
                            const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
                            const extension = mimeType.split('/')[1] || 'jpg';

                            // Convert base64 to binary
                            const binaryString = atob(data);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let j = 0; j < binaryString.length; j++) {
                                bytes[j] = binaryString.charCodeAt(j);
                            }

                            // Create File object
                            const file = new File([bytes], `image-${i}.${extension}`, { type: mimeType });
                            files.push(file);
                        }
                    }

                    if (files.length > 0) {
                        await ApplicationService.uploadImages(createdApplication.id, files);
                        toast.success('Images uploaded successfully!');
                    }
                } catch (error: any) {
                    console.error('Error uploading images:', error);
                    const errorMessage = error?.response?.data?.message
                        || error?.message
                        || 'Failed to upload images';
                    toast.error(`Application created but failed to upload images: ${errorMessage}. You can add them later.`);
                }
            }

            router.push('/admin');
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message
                || err.message
                || 'Failed to create application. Please try again.';

            toast.error(errorMessage);
            setFormError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, images, profileImageFile, router, toast]);

    if (!isAuthenticated) {
        return null;
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
                        <h1 className="text-3xl font-bold text-jcoder-foreground mb-2">New Application</h1>
                        <p className="text-jcoder-muted">Create a new application for your portfolio</p>
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
                                        className="mt-1 block w-full border border-jcoder rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-white"
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
                                        name="githubUrl"
                                        id="githubUrl"
                                        value={formData.githubUrl || ''}
                                        onChange={handleChange}
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

                            {/* Profile Image Upload Section */}
                            <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                <h3 className="text-lg font-medium text-jcoder-foreground mb-4">Profile Image</h3>
                                <p className="text-sm text-jcoder-muted mb-4">
                                    Upload a logo or profile image for your application (optional)
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            {profileImageFile ? (
                                                <img
                                                    src={URL.createObjectURL(profileImageFile)}
                                                    alt="Profile preview"
                                                    className="w-20 h-20 rounded-lg object-cover border border-jcoder"
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
                                                {profileImageFile ? 'Profile image selected' : 'No profile image selected'}
                                            </p>
                                            <p className="text-xs text-jcoder-muted">
                                                Recommended: 400x400px, max 5MB
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <label className="px-4 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm cursor-pointer">
                                            {profileImageFile ? 'Change Image' : 'Select Image'}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setProfileImageFile(file);
                                                    }
                                                }}
                                                disabled={loading}
                                                className="hidden"
                                            />
                                        </label>

                                        {profileImageFile && (
                                            <button
                                                type="button"
                                                onClick={() => setProfileImageFile(null)}
                                                disabled={loading}
                                                className="px-4 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                                            >
                                                Remove Image
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
                                    disabled={loading}
                                />
                            </div>

                            <div className="mt-8 flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/admin')}
                                    className="px-4 py-2 text-jcoder-muted bg-jcoder-secondary border border-jcoder rounded-md hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {loading ? 'Creating...' : 'Create Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
