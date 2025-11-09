'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Canvas } from '@react-three/fiber';
import { MobilePlatformEnum } from '@/types';
import Hero3D from '@/components/webgl/Hero3D';
import { TableSkeleton } from '@/components/ui';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import ImageUpload from '@/components/applications/ImageUpload';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import TechnologySelector from '@/components/applications/TechnologySelector';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { CreateTechnologyDto } from '@/types/api/technologies/dtos/create-technology.dto';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { CreateApplicationDto } from '@/types/api/applications/dtos/create-application.dto';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';

export default function NewApplicationPage() {
    const router = useRouter();

    const params = useParams();
    const username = useMemo(() => {
        const raw = params?.username;
        return Array.isArray(raw) ? raw[0] : raw || '';
    }, [params]);

    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
    const [isVisible, setIsVisible] = useState(false);
    const isSubmittingRef = useRef(false);
    const [formData, setFormData] = useState<Omit<CreateApplicationDto, 'userId'>>({
        name: '',
        description: '',
        applicationType: ApplicationTypeEnum.API,
        technologyIds: [],
    });
    const [images, setImages] = useState<string[]>([]);
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [showCreateTechnologyModal, setShowCreateTechnologyModal] = useState(false);
    const [creatingTechnology, setCreatingTechnology] = useState(false);
    const [technologyRefreshKey, setTechnologyRefreshKey] = useState(0);
    const [newTechnologyData, setNewTechnologyData] = useState<CreateTechnologyDto>({
        name: '',
        expertiseLevel: ExpertiseLevel.INTERMEDIATE,
    });

    const toast = useToast();

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
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
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

    // Initialize component objects when application type changes
    useEffect(() => {
        setFormData((prev) => {
            const newData = { ...prev };

            // Remove component objects that are not needed for the current type
            switch (prev.applicationType) {
                case ApplicationTypeEnum.API:
                    delete newData.applicationComponentMobile;
                    delete newData.applicationComponentLibrary;
                    delete newData.applicationComponentFrontend;
                    // Initialize API component if it doesn't exist
                    if (!newData.applicationComponentApi) {
                        newData.applicationComponentApi = {
                            domain: '',
                            apiUrl: '',
                            documentationUrl: undefined,
                            healthCheckEndpoint: undefined,
                        };
                    }
                    break;
                case ApplicationTypeEnum.MOBILE:
                    delete newData.applicationComponentApi;
                    delete newData.applicationComponentLibrary;
                    delete newData.applicationComponentFrontend;
                    // Initialize Mobile component if it doesn't exist
                    if (!newData.applicationComponentMobile) {
                        newData.applicationComponentMobile = {
                            platform: MobilePlatformEnum.ANDROID,
                            downloadUrl: undefined,
                        };
                    }
                    break;
                case ApplicationTypeEnum.LIBRARY:
                    delete newData.applicationComponentApi;
                    delete newData.applicationComponentMobile;
                    delete newData.applicationComponentFrontend;
                    // Initialize Library component if it doesn't exist
                    if (!newData.applicationComponentLibrary) {
                        newData.applicationComponentLibrary = {
                            packageManagerUrl: '',
                            readmeContent: undefined,
                        };
                    }
                    break;
                case ApplicationTypeEnum.FRONTEND:
                    delete newData.applicationComponentApi;
                    delete newData.applicationComponentMobile;
                    delete newData.applicationComponentLibrary;
                    // Initialize Frontend component if it doesn't exist
                    if (!newData.applicationComponentFrontend) {
                        newData.applicationComponentFrontend = {
                            frontendUrl: '',
                            screenshotUrl: undefined,
                        };
                    }
                    break;
                case ApplicationTypeEnum.FULLSTACK:
                    delete newData.applicationComponentMobile;
                    delete newData.applicationComponentLibrary;
                    // Initialize API component if it doesn't exist
                    if (!newData.applicationComponentApi) {
                        newData.applicationComponentApi = {
                            domain: '',
                            apiUrl: '',
                            documentationUrl: undefined,
                            healthCheckEndpoint: undefined,
                        };
                    }
                    // Initialize Frontend component if it doesn't exist
                    if (!newData.applicationComponentFrontend) {
                        newData.applicationComponentFrontend = {
                            frontendUrl: '',
                            screenshotUrl: undefined,
                        };
                    }
                    break;
            }

            return newData;
        });
    }, [formData.applicationType]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent] || {},
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

        // Prevent multiple submissions
        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);
        setFormError(null);


        try {
            const userSession = UsersService.getUserSession();
            if (!userSession?.user?.username) {
                throw new Error('User session not found');
            }
            const payload: CreateApplicationDto = { ...formData, userId: userSession.user.id };

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

            const createdApplication = await ApplicationService.create(userSession.user.username, payload);

            // Show success message for application creation
            toast.success(`${payload.name} successfully created!`);

            // Upload profile image if provided - only after successful creation

            if (profileImageFile) {
                try {
                    await ImagesService.uploadApplicationProfileImage(userSession.user.username, createdApplication.id, profileImageFile);
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
                        if (image && image.startsWith('data:')) {
                            try {
                                // Parse data URL
                                const commaIndex = image.indexOf(',');
                                if (commaIndex === -1) {
                                    console.warn(`Skipping invalid data URL at index ${i}`);
                                    continue;
                                }

                                const header = image.substring(0, commaIndex);
                                const data = image.substring(commaIndex + 1);
                                const mimeMatch = header.match(/data:([^;]+)/);
                                const mimeType = mimeMatch?.[1] || 'image/jpeg';
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
                            } catch (parseError) {
                                console.error(`Error parsing image at index ${i}:`, parseError);
                                continue;
                            }
                        }
                    }

                    if (files.length > 0) {
                        await ImagesService.uploadApplicationImages(userSession.user.username, createdApplication.id, files);
                        toast.success(`${files.length} image(s) uploaded successfully!`);
                    } else if (images.length > 0) {
                        console.warn('No valid images could be converted for upload');
                    }
                } catch (error: any) {
                    console.error('Error uploading images:', error);
                    const errorMessage = error?.response?.data?.message
                        || error?.message
                        || 'Failed to upload images';
                    toast.error(`Application created but failed to upload images: ${errorMessage}. You can add them later.`);
                }
            }

            router.push(`/${username}/admin/applications`);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message
                || err.message
                || 'Failed to create application. Please try again.';

            toast.error(errorMessage);
            setFormError(errorMessage);
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    }, [formData, images, profileImageFile, router, username, toast]);

    const handleCreateTechnology = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTechnologyData.name.trim()) {
            toast.error('Technology name is required');
            return;
        }

        setCreatingTechnology(true);
        try {
            if (!username) {
                throw new Error('User session not found');
            }

            const createdTech = await TechnologiesService.create(username, newTechnologyData);
            toast.success(`Technology "${createdTech.name}" created successfully!`);

            // Reset form
            setNewTechnologyData({
                name: '',
                expertiseLevel: ExpertiseLevel.INTERMEDIATE,
            });
            setShowCreateTechnologyModal(false);

            // Add the newly created technology to the selection
            setFormData((prev) => ({
                ...prev,
                technologyIds: [...(prev.technologyIds || []), createdTech.id],
            }));

            // Force TechnologySelector to reload
            setTechnologyRefreshKey((prev) => prev + 1);
        } catch (err: any) {
            console.error('Error creating technology:', err);
            const errorMessage = err?.response?.data?.message
                || err.message
                || 'Failed to create technology. Please try again.';
            toast.error(errorMessage);
        } finally {
            setCreatingTechnology(false);
        }
    }, [newTechnologyData, username, toast]);

    if (checkingAuth || !isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
                {/* WebGL Background - Animated 3D mesh */}
                <Suspense fallback={null}>
                    <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
                </Suspense>

                {/* Animated Background - CSS layers for depth */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Gradient Orbs */}
                    <div
                        className="absolute w-96 h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                        style={{
                            left: `${mousePosition.x / 20}px`,
                            top: `${mousePosition.y / 20}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />
                    <div
                        className="absolute w-96 h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                        style={{
                            right: `${mousePosition.x / 25}px`,
                            bottom: `${mousePosition.y / 25}px`,
                            transition: 'all 0.3s ease-out',
                        }}
                    />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                <Header isAdmin={true} onLogout={() => router.push(`/${username}`)} />
                <main className="flex-1 container mx-auto px-4 py-12 pt-24 relative z-10">
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
                <Footer user={user} username={username || user?.username} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
            {/* WebGL Background - Animated 3D mesh */}
            <Suspense fallback={null}>
                <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
            </Suspense>

            {/* Animated Background - CSS layers for depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Gradient Orbs */}
                <div
                    className="absolute w-96 h-96 bg-jcoder-cyan/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: `${mousePosition.x / 20}px`,
                        top: `${mousePosition.y / 20}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />
                <div
                    className="absolute w-96 h-96 bg-jcoder-blue/20 rounded-full blur-3xl animate-pulse delay-1000"
                    style={{
                        right: `${mousePosition.x / 25}px`,
                        bottom: `${mousePosition.y / 25}px`,
                        transition: 'all 0.3s ease-out',
                    }}
                />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <Header isAdmin={true} onLogout={() => router.push(`/${username}`)} />

            <main className="flex-1 container mx-auto px-4 py-12 pt-24 relative z-10">
                {/* 3D Particles in Background */}
                <div className="fixed inset-0 pointer-events-none z-0">
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

                <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-jcoder-muted hover:text-jcoder-primary transition-all duration-200 mb-8 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                    </button>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
                            New Application
                        </h1>
                        <p className="text-base md:text-lg text-jcoder-muted">Create a new application for your portfolio</p>
                    </div>

                    <div
                        className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-6 md:p-8 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 hover:-translate-y-1"
                        style={{
                            transform: `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)`,
                        }}
                    >
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
                                        className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                        className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                        className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground hover:border-jcoder-primary/50"
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
                                        className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                value={formData.applicationComponentMobile?.platform || MobilePlatformEnum.ANDROID}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                            >
                                                <option value={MobilePlatformEnum.IOS}>iOS</option>
                                                <option value={MobilePlatformEnum.ANDROID}>Android</option>
                                                <option value={MobilePlatformEnum.MULTIPLATFORM}>Multiplatform</option>
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Technologies Section */}
                            <div className="mt-6 pt-6 border-t border-jcoder border-l-4 border-jcoder-primary pl-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-jcoder-foreground">Technologies</h3>
                                        <p className="text-sm text-jcoder-muted mt-1">
                                            Select the technologies used in this application
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateTechnologyModal(true)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group"
                                    >
                                        <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Nova Tecnologia
                                    </button>
                                </div>
                                <TechnologySelector
                                    selectedTechnologyIds={formData.technologyIds || []}
                                    onSelectionChange={(technologyIds) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            technologyIds,
                                        }));
                                    }}
                                    disabled={loading}
                                    refreshKey={technologyRefreshKey}
                                />
                            </div>

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
                                    onClick={() => router.push(`/${username}/admin/applications`)}
                                    className="px-6 py-2 border border-jcoder rounded-lg text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-all duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-300 font-semibold transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 group"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create Application
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>

            <Footer user={user} username={username || user?.username} />

            {/* Create Technology Modal */}
            {showCreateTechnologyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div
                        className="bg-jcoder-card/95 backdrop-blur-sm border border-jcoder rounded-2xl max-w-md w-full shadow-xl shadow-jcoder-primary/20 transform-gpu transition-all duration-300"
                        style={{
                            transform: `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)`,
                        }}
                    >
                        <div className="p-6 border-b border-jcoder">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-bold text-jcoder-foreground bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
                                    Criar Nova Tecnologia
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCreateTechnologyModal(false);
                                        setNewTechnologyData({
                                            name: '',
                                            expertiseLevel: ExpertiseLevel.INTERMEDIATE,
                                        });
                                    }}
                                    className="p-2 hover:bg-jcoder-secondary rounded-lg transition-all duration-200 group"
                                    disabled={creatingTechnology}
                                >
                                    <svg className="w-6 h-6 text-jcoder-muted group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateTechnology} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                                    Nome <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTechnologyData.name}
                                    onChange={(e) => setNewTechnologyData({ ...newTechnologyData, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent transition-all duration-200 hover:border-jcoder-primary/50"
                                    placeholder="ex: Node.js, React, Python..."
                                    disabled={creatingTechnology}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-jcoder-foreground mb-2">
                                    Nível de Expertise <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    value={newTechnologyData.expertiseLevel}
                                    onChange={(e) => setNewTechnologyData({ ...newTechnologyData, expertiseLevel: e.target.value as ExpertiseLevel })}
                                    className="w-full px-4 py-2 bg-jcoder-secondary border border-jcoder rounded-lg text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent transition-all duration-200 hover:border-jcoder-primary/50"
                                    disabled={creatingTechnology}
                                >
                                    <option value={ExpertiseLevel.BASIC}>Básico</option>
                                    <option value={ExpertiseLevel.INTERMEDIATE}>Intermediário</option>
                                    <option value={ExpertiseLevel.ADVANCED}>Avançado</option>
                                    <option value={ExpertiseLevel.EXPERT}>Especialista</option>
                                </select>
                                <p className="text-sm text-jcoder-muted mt-2">
                                    Selecione seu nível de proficiência com esta tecnologia
                                </p>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-jcoder">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateTechnologyModal(false);
                                        setNewTechnologyData({
                                            name: '',
                                            expertiseLevel: ExpertiseLevel.INTERMEDIATE,
                                        });
                                    }}
                                    disabled={creatingTechnology}
                                    className="px-6 py-2 border border-jcoder rounded-lg text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingTechnology}
                                    className="px-6 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group"
                                >
                                    {creatingTechnology ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Criar Tecnologia
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
};
