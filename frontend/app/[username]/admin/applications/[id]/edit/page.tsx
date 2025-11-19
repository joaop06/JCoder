
'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Canvas } from '@react-three/fiber';
import { MobilePlatformEnum } from '@/types';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import Hero3D from '@/components/webgl/Hero3D';
import { LazyImage, TableSkeleton } from '@/components/ui';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import ImageUpload from '@/components/applications/ImageUpload';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import TechnologySelector from '@/components/applications/TechnologySelector';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { CreateTechnologyDto } from '@/types/api/technologies/dtos/create-technology.dto';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { UpdateApplicationDto } from '@/types/api/applications/dtos/update-application.dto';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';

export default function EditApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params?.id as string;

    const username = useMemo(() => {
        const raw = params?.username;
        return Array.isArray(raw) ? raw[0] : raw || '';
    }, [params]);

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
    const [isVisible, setIsVisible] = useState(false);
    const isSubmittingRef = useRef(false);

    // Refs for mouse position throttling
    const mousePositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const [formData, setFormData] = useState<UpdateApplicationDto>({
        name: '',
        description: '',
        isActive: true,
    });
    const [selectedComponents, setSelectedComponents] = useState<{
        api: boolean;
        frontend: boolean;
        mobile: boolean;
        library: boolean;
    }>({
        api: false,
        frontend: false,
        mobile: false,
        library: false,
    });
    const [images, setImages] = useState<string[]>([]);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null);
    const [pendingProfileImageFile, setPendingProfileImageFile] = useState<File | null>(null);
    const [pendingProfileImageAction, setPendingProfileImageAction] = useState<'none' | 'upload' | 'update' | 'delete'>('none');
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

    useEffect(() => {
        if (!isAuthenticated || !applicationId) return;

        const fetchApplication = async () => {
            setLoading(true);
            setFormError(null);
            try {
                if (!username) {
                    throw new Error('User session not found');
                }
                const data = await ApplicationService.getById(username, Number(applicationId));

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

                // Initialize selected components based on existing data
                setSelectedComponents({
                    api: !!data.applicationComponentApi,
                    frontend: !!data.applicationComponentFrontend,
                    mobile: !!data.applicationComponentMobile,
                    library: !!data.applicationComponentLibrary,
                });
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
    }, [isAuthenticated, applicationId, username, toast]);

    // Initialize component objects when components are selected
    useEffect(() => {
        setFormData((prev) => {
            const newData = { ...prev };

            // Initialize API component if selected
            if (selectedComponents.api && !newData.applicationComponentApi) {
                newData.applicationComponentApi = {
                    domain: '',
                    apiUrl: '',
                    documentationUrl: undefined,
                    healthCheckEndpoint: undefined,
                };
            } else if (!selectedComponents.api) {
                delete newData.applicationComponentApi;
            }

            // Initialize Frontend component if selected
            if (selectedComponents.frontend && !newData.applicationComponentFrontend) {
                newData.applicationComponentFrontend = {
                    frontendUrl: '',
                    screenshotUrl: undefined,
                };
            } else if (!selectedComponents.frontend) {
                delete newData.applicationComponentFrontend;
            }

            // Initialize Mobile component if selected
            if (selectedComponents.mobile && !newData.applicationComponentMobile) {
                newData.applicationComponentMobile = {
                    platform: MobilePlatformEnum.ANDROID,
                    downloadUrl: undefined,
                };
            } else if (!selectedComponents.mobile) {
                delete newData.applicationComponentMobile;
            }

            // Initialize Library component if selected
            if (selectedComponents.library && !newData.applicationComponentLibrary) {
                newData.applicationComponentLibrary = {
                    packageManagerUrl: '',
                    readmeContent: undefined,
                };
            } else if (!selectedComponents.library) {
                delete newData.applicationComponentLibrary;
            }

            return newData;
        });
    }, [selectedComponents]);

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
            const payload: UpdateApplicationDto = { ...formData };

            // Clean up components that are not selected
            if (!selectedComponents.api) {
                delete payload.applicationComponentApi;
            } else {
                delete payload.applicationComponentApi?.userId;
                delete payload.applicationComponentApi?.applicationId;
            }
            if (!selectedComponents.frontend) {
                delete payload.applicationComponentFrontend;
            } else {
                delete payload.applicationComponentFrontend?.userId;
                delete payload.applicationComponentFrontend?.applicationId;
            }
            if (!selectedComponents.mobile) {
                delete payload.applicationComponentMobile;
            } else {
                delete payload.applicationComponentMobile?.userId;
                delete payload.applicationComponentMobile?.applicationId;
            }
            if (!selectedComponents.library) {
                delete payload.applicationComponentLibrary;
            } else {
                delete payload.applicationComponentLibrary?.userId;
                delete payload.applicationComponentLibrary?.applicationId;
            }

            if (!username) {
                throw new Error('User session not found');
            }
            await ApplicationService.update(username, Number(applicationId), payload);
            toast.success(`${payload.name} successfully updated!`);

            // Apply profile image changes only after successful application update
            if (pendingProfileImageAction !== 'none' && pendingProfileImageAction !== undefined) {
                try {
                    switch (pendingProfileImageAction) {
                        case 'upload':
                            if (pendingProfileImageFile) {
                                await ImagesService.uploadApplicationProfileImage(username, Number(applicationId), pendingProfileImageFile);
                                toast.success('Profile image uploaded successfully!');
                            }
                            break;
                        case 'update':
                            if (pendingProfileImageFile) {
                                await ImagesService.updateApplicationProfileImage(username, Number(applicationId), pendingProfileImageFile);
                                toast.success('Profile image updated successfully!');
                            }
                            break;
                        case 'delete':
                            await ImagesService.deleteApplicationProfileImage(username, Number(applicationId));
                            toast.success('Profile image deleted successfully!');
                            break;
                    }

                    // Reset pending states after successful operation
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

            router.push(`/${username}/admin/applications`);
        } catch (err: any) {
            console.error('Error updating application:', err);
            const errorMessage = err?.response?.data?.message
                || err.message
                || 'Failed to update application. Please try again.';

            toast.error(errorMessage);
            setFormError(errorMessage);
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    }, [formData, selectedComponents, router, applicationId, pendingProfileImageAction, pendingProfileImageFile, username, toast]);

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

    if (checkingAuth || !isAuthenticated || loading) {
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

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                <Header isAdmin={true} onLogout={() => router.push(`/${username}`)} />
                <main className="flex-1 relative z-10 pt-20 sm:pt-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6 sm:mb-8">
                                <div className="h-6 sm:h-8 w-32 sm:w-48 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                                <div className="h-3 sm:h-4 w-48 sm:w-64 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                            </div>
                            <div className="bg-jcoder-card/80 backdrop-blur-sm border border-jcoder rounded-2xl p-6 sm:p-8 shadow-xl shadow-jcoder-primary/10">
                                <TableSkeleton />
                            </div>
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

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            <Header isAdmin={true} onLogout={() => router.push(`/${username}`)} />

            <main className="flex-1 relative z-10 pt-20 sm:pt-24">
                {/* 3D Particles in Background */}
                <div className="absolute inset-0 pointer-events-none z-0">
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

                {/* 3D Logo Element - Desktop only */}
                <div className="absolute top-20 right-10 w-32 h-32 pointer-events-none opacity-20 hidden lg:block z-0">
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

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 relative z-10">
                    <div className={`max-w-full mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {/* Breadcrumb */}
                        <nav className="mb-3 sm:mb-4 px-2 sm:px-4 mt-2 sm:mt-4 md:mt-0">
                            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-jcoder-muted">
                                <li>
                                    <button onClick={() => router.push(`/${username}/admin`)} className="hover:text-jcoder-primary transition-colors group">
                                        <span className="group-hover:underline">Dashboard</span>
                                    </button>
                                </li>
                                <li>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </li>
                                <li>
                                    <button onClick={() => router.push(`/${username}/admin/applications`)} className="hover:text-jcoder-primary transition-colors group">
                                        <span className="group-hover:underline">Applications</span>
                                    </button>
                                </li>
                                <li>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </li>
                                <li className="text-jcoder-foreground font-medium">Edit</li>
                            </ol>
                        </nav>

                        {/* Page Header */}
                        <div className="mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-jcoder-foreground">
                                    Edit Application
                                </h1>
                            </div>
                            <p className="text-xs sm:text-sm md:text-base text-jcoder-muted mt-1 sm:mt-2">Edit the details of your application</p>
                        </div>

                        <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10 max-w-full mx-auto">
                            <form id="application-form" onSubmit={handleSubmit}>
                                {/* Action Buttons Bar - Fixed at top */}
                                <div className="sticky top-20 sm:top-24 z-30 mb-4 sm:mb-6 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4 bg-jcoder-card-light/95 backdrop-blur-md border-b border-jcoder shadow-lg">
                                    <div className="flex flex-col sm:flex-row justify-end gap-2.5 sm:gap-3 lg:gap-4">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/${username}/admin/applications`)}
                                            className="w-full sm:w-auto px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 border-2 border-jcoder rounded-lg sm:rounded-xl text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground hover:border-jcoder-primary transition-all duration-300 font-semibold text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full sm:w-auto px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-jcoder-gradient text-black rounded-lg sm:rounded-xl hover:opacity-90 transition-all duration-300 font-bold transform-gpu hover:scale-105 hover:shadow-xl hover:shadow-jcoder-primary/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group text-sm sm:text-base"
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Update Application
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                {formError && (
                                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 border border-red-400/50 bg-red-900/20 backdrop-blur-sm text-red-400 rounded-xl shadow-lg shadow-red-500/10 text-sm sm:text-base">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{formError}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-jcoder-foreground mb-1.5 sm:mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="block w-full border border-jcoder rounded-lg sm:rounded-xl shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-jcoder-foreground mb-1.5 sm:mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="block w-full border border-jcoder rounded-lg sm:rounded-xl shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50 resize-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="applicationType" className="block text-xs sm:text-sm font-semibold text-jcoder-foreground mb-1.5 sm:mb-2">Application Type <span className="text-jcoder-muted font-normal">(Optional)</span></label>
                                        <select
                                            name="applicationType"
                                            id="applicationType"
                                            value={formData.applicationType || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    applicationType: value === '' ? undefined : value as ApplicationTypeEnum,
                                                }));
                                            }}
                                            className="block w-full border border-jcoder rounded-lg sm:rounded-xl shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                        >
                                            <option value="">Nenhum</option>
                                            <option value={ApplicationTypeEnum.API}>API</option>
                                            <option value={ApplicationTypeEnum.FRONTEND}>Frontend</option>
                                            <option value={ApplicationTypeEnum.MOBILE}>Mobile</option>
                                            <option value={ApplicationTypeEnum.LIBRARY}>Library</option>
                                            <option value={ApplicationTypeEnum.FULLSTACK}>Fullstack</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="githubUrl" className="block text-xs sm:text-sm font-semibold text-jcoder-foreground mb-1.5 sm:mb-2">GitHub URL <span className="text-jcoder-muted font-normal">(Optional)</span></label>
                                        <input
                                            type="url"
                                            name="githubUrl"
                                            id="githubUrl"
                                            value={formData.githubUrl || ''}
                                            onChange={handleChange}
                                            className="block w-full border border-jcoder rounded-lg sm:rounded-xl shadow-sm py-2.5 sm:py-3 px-3 sm:px-4 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                        />
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-jcoder">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 bg-jcoder-secondary/50 backdrop-blur-sm border border-jcoder rounded-2xl shadow-lg">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-jcoder-foreground mb-1">
                                                Application Status
                                            </label>
                                            <p className="text-xs sm:text-sm text-jcoder-muted">
                                                {formData.isActive ? 'Application is visible on the public site' : 'Application is hidden from the public site'}
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
                                </div>

                                {/* Grid Layout for Side-by-Side Sections */}
                                <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                    {/* Component Selection Section */}
                                    <div className="pt-6 sm:pt-8 border-t border-jcoder lg:border-l-4 lg:border-l-jcoder-primary pl-0 lg:pl-4 lg:pl-6">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Select Components</span>
                                        </h3>
                                        <p className="text-xs sm:text-sm text-jcoder-muted mb-4 sm:mb-6">
                                            Select which components your application has. You can choose one or more components.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {/* API Component Checkbox */}
                                            <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border border-jcoder rounded-lg sm:rounded-xl hover:border-jcoder-primary transition-all duration-200 cursor-pointer bg-jcoder-secondary/50 hover:bg-jcoder-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponents.api}
                                                    onChange={(e) => {
                                                        setSelectedComponents((prev) => ({
                                                            ...prev,
                                                            api: e.target.checked,
                                                        }));
                                                    }}
                                                    className="w-5 h-5 text-jcoder-primary border-jcoder rounded focus:ring-jcoder-primary focus:ring-2 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base text-jcoder-foreground">API</div>
                                                    <div className="text-xs text-jcoder-muted">Backend/REST API</div>
                                                </div>
                                            </label>

                                            {/* Frontend Component Checkbox */}
                                            <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border border-jcoder rounded-lg sm:rounded-xl hover:border-jcoder-primary transition-all duration-200 cursor-pointer bg-jcoder-secondary/50 hover:bg-jcoder-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponents.frontend}
                                                    onChange={(e) => {
                                                        setSelectedComponents((prev) => ({
                                                            ...prev,
                                                            frontend: e.target.checked,
                                                        }));
                                                    }}
                                                    className="w-5 h-5 text-jcoder-primary border-jcoder rounded focus:ring-jcoder-primary focus:ring-2 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base text-jcoder-foreground">Frontend</div>
                                                    <div className="text-xs text-jcoder-muted">Web Interface</div>
                                                </div>
                                            </label>

                                            {/* Mobile Component Checkbox */}
                                            <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border border-jcoder rounded-lg sm:rounded-xl hover:border-jcoder-primary transition-all duration-200 cursor-pointer bg-jcoder-secondary/50 hover:bg-jcoder-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponents.mobile}
                                                    onChange={(e) => {
                                                        setSelectedComponents((prev) => ({
                                                            ...prev,
                                                            mobile: e.target.checked,
                                                        }));
                                                    }}
                                                    className="w-5 h-5 text-jcoder-primary border-jcoder rounded focus:ring-jcoder-primary focus:ring-2 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base text-jcoder-foreground">Mobile</div>
                                                    <div className="text-xs text-jcoder-muted">Mobile App</div>
                                                </div>
                                            </label>

                                            {/* Library Component Checkbox */}
                                            <label className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-4 border border-jcoder rounded-lg sm:rounded-xl hover:border-jcoder-primary transition-all duration-200 cursor-pointer bg-jcoder-secondary/50 hover:bg-jcoder-secondary">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedComponents.library}
                                                    onChange={(e) => {
                                                        setSelectedComponents((prev) => ({
                                                            ...prev,
                                                            library: e.target.checked,
                                                        }));
                                                    }}
                                                    className="w-5 h-5 text-jcoder-primary border-jcoder rounded focus:ring-jcoder-primary focus:ring-2 flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm sm:text-base text-jcoder-foreground">Library</div>
                                                    <div className="text-xs text-jcoder-muted">Library/Package</div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Technologies Section */}
                                    <div className="pt-6 sm:pt-8 border-t border-jcoder lg:border-l-4 lg:border-l-jcoder-primary pl-0 lg:pl-4 lg:pl-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-base sm:text-lg font-medium text-jcoder-foreground">Technologies</h3>
                                                <p className="text-xs sm:text-sm text-jcoder-muted mt-1">
                                                    Select the technologies used in this application
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateTechnologyModal(true)}
                                                disabled={loading}
                                                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group flex-shrink-0 w-full sm:w-auto"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                New Technology
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
                                </div>

                                {/* Grid Layout for Images Sections */}
                                <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                    {/* Profile Image Upload Section */}
                                    <div className="pt-6 sm:pt-8 border-t border-jcoder lg:border-l-4 lg:border-l-jcoder-primary pl-0 lg:pl-4 lg:pl-6">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Profile Image</span>
                                        </h3>
                                        <p className="text-xs sm:text-sm text-jcoder-muted mb-3 sm:mb-4">
                                            Manage the logo or profile image for your application (optional)
                                        </p>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                                <div className="relative flex-shrink-0">
                                                    {pendingProfileImageFile ? (
                                                        <img
                                                            src={URL.createObjectURL(pendingProfileImageFile)}
                                                            alt="Profile preview"
                                                            className="w-20 h-20 rounded-lg object-cover border border-jcoder"
                                                        />
                                                    ) : profileImage ? (
                                                        <LazyImage
                                                            src={ImagesService.getApplicationProfileImageUrl(username, Number(applicationId))}
                                                            alt="Current profile"
                                                            fallback={formData.name!}
                                                            className="w-20 h-20 rounded-lg border border-jcoder object-cover"
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
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs sm:text-sm text-jcoder-muted">
                                                        {pendingProfileImageAction === 'delete'
                                                            ? 'Profile image will be deleted'
                                                            : pendingProfileImageFile
                                                                ? 'New profile image selected'
                                                                : profileImage
                                                                    ? 'Current profile image'
                                                                    : 'No profile image set'
                                                        }
                                                    </p>
                                                    <p className="text-xs text-jcoder-muted mt-0.5">
                                                        Recommended: 400x400px, max. 5MB
                                                    </p>
                                                    {pendingProfileImageAction !== 'none' && (
                                                        <p className="text-xs text-yellow-400 mt-1">
                                                            Changes will be applied when you save
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <label className="px-3 sm:px-4 py-2 bg-jcoder-gradient text-black rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm cursor-pointer inline-flex items-center justify-center">
                                                    {profileImage ? 'Change Image' : 'Select Image'}
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
                                                        className="px-3 sm:px-4 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm"
                                                    >
                                                        Remove Image
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
                                                        className="px-3 sm:px-4 py-2 border border-jcoder text-jcoder-muted rounded-md hover:bg-jcoder-secondary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm"
                                                    >
                                                        Cancel Changes
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload Section */}
                                    <div className="pt-6 sm:pt-8 border-t border-jcoder lg:border-l-4 lg:border-l-jcoder-primary pl-0 lg:pl-4 lg:pl-6">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Application Images</span>
                                        </h3>
                                        <ImageUpload
                                            images={images}
                                            onImagesChange={setImages}
                                            applicationId={Number(applicationId)}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Component Cards - Separate cards below main card */}
                        <div className="mt-4 sm:mt-6 max-w-full mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {selectedComponents.api && (
                                    <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>API Component Details</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="api-domain" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Domain</label>
                                                <input
                                                    type="text"
                                                    name="applicationComponentApi.domain"
                                                    id="api-domain"
                                                    value={formData.applicationComponentApi?.domain || ''}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="api-apiUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">API URL</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentApi.apiUrl"
                                                    id="api-apiUrl"
                                                    value={formData.applicationComponentApi?.apiUrl || ''}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="api-documentationUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Documentation URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentApi.documentationUrl"
                                                    id="api-documentationUrl"
                                                    value={formData.applicationComponentApi?.documentationUrl || ''}
                                                    onChange={handleChange}
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="api-healthCheckEndpoint" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Health Check Endpoint (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="applicationComponentApi.healthCheckEndpoint"
                                                    id="api-healthCheckEndpoint"
                                                    value={formData.applicationComponentApi?.healthCheckEndpoint || ''}
                                                    onChange={handleChange}
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedComponents.frontend && (
                                    <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Frontend Component Details</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="frontend-frontendUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Frontend URL</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentFrontend.frontendUrl"
                                                    id="frontend-frontendUrl"
                                                    value={formData.applicationComponentFrontend?.frontendUrl || ''}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="frontend-screenshotUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Screenshot URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentFrontend.screenshotUrl"
                                                    id="frontend-screenshotUrl"
                                                    value={formData.applicationComponentFrontend?.screenshotUrl || ''}
                                                    onChange={handleChange}
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedComponents.mobile && (
                                    <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Mobile Component Details</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="mobile-platform" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Platform</label>
                                                <select
                                                    name="applicationComponentMobile.platform"
                                                    id="mobile-platform"
                                                    value={formData.applicationComponentMobile?.platform || MobilePlatformEnum.ANDROID}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                >
                                                    <option value={MobilePlatformEnum.IOS}>iOS</option>
                                                    <option value={MobilePlatformEnum.ANDROID}>Android</option>
                                                    <option value={MobilePlatformEnum.MULTIPLATFORM}>Multiplatform</option>
                                                </select>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="mobile-downloadUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Download URL (Optional)</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentMobile.downloadUrl"
                                                    id="mobile-downloadUrl"
                                                    value={formData.applicationComponentMobile?.downloadUrl || ''}
                                                    onChange={handleChange}
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedComponents.library && (
                                    <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Library Component Details</span>
                                        </h3>
                                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                                            <div className="sm:col-span-2">
                                                <label htmlFor="library-packageManagerUrl" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">Package Manager URL</label>
                                                <input
                                                    type="url"
                                                    name="applicationComponentLibrary.packageManagerUrl"
                                                    id="library-packageManagerUrl"
                                                    value={formData.applicationComponentLibrary?.packageManagerUrl || ''}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label htmlFor="library-readmeContent" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5">README Content (Optional)</label>
                                                <textarea
                                                    name="applicationComponentLibrary.readmeContent"
                                                    id="library-readmeContent"
                                                    value={formData.applicationComponentLibrary?.readmeContent || ''}
                                                    onChange={handleChange}
                                                    rows={5}
                                                    className="block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50 resize-none"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer user={user} username={username || user?.username} />

            {/* Create Technology Modal */}
            {showCreateTechnologyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-jcoder-card/95 backdrop-blur-md border border-jcoder rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-jcoder-primary/20">
                        <div className="p-6 sm:p-8 border-b border-jcoder">
                            <div className="flex items-center justify-between gap-2">
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-jcoder-foreground bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
                                    Create New Technology
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

                        <form onSubmit={handleCreateTechnology} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-jcoder-foreground mb-3">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTechnologyData.name}
                                    onChange={(e) => setNewTechnologyData({ ...newTechnologyData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-xl text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 hover:border-jcoder-primary/50"
                                    placeholder="ex: Node.js, React, Python..."
                                    disabled={creatingTechnology}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-jcoder-foreground mb-3">
                                    Expertise Level <span className="text-red-400">*</span>
                                </label>
                                <select
                                    required
                                    value={newTechnologyData.expertiseLevel}
                                    onChange={(e) => setNewTechnologyData({ ...newTechnologyData, expertiseLevel: e.target.value as ExpertiseLevel })}
                                    className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-xl text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 hover:border-jcoder-primary/50"
                                    disabled={creatingTechnology}
                                >
                                    <option value={ExpertiseLevel.BASIC}>Basic</option>
                                    <option value={ExpertiseLevel.INTERMEDIATE}>Intermediate</option>
                                    <option value={ExpertiseLevel.ADVANCED}>Advanced</option>
                                    <option value={ExpertiseLevel.EXPERT}>Expert</option>
                                </select>
                                <p className="text-sm text-jcoder-muted mt-3">
                                    Select your proficiency level with this technology
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-jcoder">
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
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-jcoder rounded-xl text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground hover:border-jcoder-primary transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingTechnology}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-jcoder-gradient text-black rounded-xl hover:opacity-90 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105 hover:shadow-xl hover:shadow-jcoder-primary/50 active:scale-95 text-sm sm:text-base"
                                >
                                    {creatingTechnology ? (
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Create Technology
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
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 3s ease infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
}

