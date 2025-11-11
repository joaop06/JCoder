
'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useRouter, useParams } from 'next/navigation';
import { LazyImage, TableSkeleton } from '@/components/ui';
import { useToast } from '@/components/toast/ToastContext';
import ImageUpload from '@/components/applications/ImageUpload';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import TechnologySelector from '@/components/applications/TechnologySelector';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { TechnologiesService } from '@/services/administration-by-user/technologies.service';
import { UpdateApplicationDto } from '@/types/api/applications/dtos/update-application.dto';
import { CreateTechnologyDto } from '@/types/api/technologies/dtos/create-technology.dto';
import { ExpertiseLevel } from '@/types/enums/expertise-level.enum';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

export default function EditApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params?.id as string;

    const userSession = UsersService.getUserSession();
    const username = userSession?.user?.username || '';

    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
        applicationType: ApplicationTypeEnum.API,
        isActive: true,
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

        // Prevent multiple submissions
        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
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
                    delete payload.applicationComponentApi?.userId;
                    delete payload.applicationComponentApi?.applicationId;
                    break;
                case ApplicationTypeEnum.FRONTEND:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentLibrary;
                    delete payload.applicationComponentFrontend?.userId;
                    delete payload.applicationComponentFrontend?.applicationId;
                    break;
                case ApplicationTypeEnum.MOBILE:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentLibrary;
                    delete payload.applicationComponentFrontend;
                    delete payload.applicationComponentMobile?.userId;
                    delete payload.applicationComponentMobile?.applicationId;
                    break;
                case ApplicationTypeEnum.LIBRARY:
                    delete payload.applicationComponentApi;
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentFrontend;
                    delete payload.applicationComponentLibrary?.userId;
                    delete payload.applicationComponentLibrary?.applicationId;
                    break;
                case ApplicationTypeEnum.FULLSTACK:
                    delete payload.applicationComponentMobile;
                    delete payload.applicationComponentLibrary;
                    delete payload.applicationComponentApi?.userId;
                    delete payload.applicationComponentFrontend?.userId;
                    delete payload.applicationComponentApi?.applicationId;
                    delete payload.applicationComponentFrontend?.applicationId;
                    break;
                default:
                    break;
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
    }, [formData, router, applicationId, pendingProfileImageAction, pendingProfileImageFile, username, toast]);

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

    if (!isAuthenticated || loading) {
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
                    <div className={`max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        {/* Back Button */}
                        <button
                            onClick={() => router.back()}
                            className="group inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 text-jcoder-muted hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary rounded-lg transition-all duration-300 hover:bg-jcoder-secondary/50 hover:shadow-lg hover:shadow-jcoder-primary/20 text-sm sm:text-base font-medium"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back</span>
                        </button>

                        <div className="mb-6 sm:mb-8">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
                                <span className="relative inline-block">
                                    {/* Base text visible as fallback */}
                                    <span className="text-jcoder-foreground opacity-100">
                                        Edit Application
                                    </span>
                                    {/* Gradient on top with animation */}
                                    <span
                                        className="absolute inset-0 inline-block animate-gradient"
                                        style={{
                                            background: 'linear-gradient(to right, #00c8ff, #00c8ff, #0050a0)',
                                            backgroundSize: '200% 200%',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        Edit Application
                                    </span>
                                </span>
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-jcoder-muted">Edit the details of your application</p>
                        </div>

                        <div className="bg-jcoder-card/80 backdrop-blur-sm border border-jcoder rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl shadow-jcoder-primary/10 transform-gpu transition-all duration-500 hover:shadow-jcoder-primary/20 hover:-translate-y-1">
                            <form onSubmit={handleSubmit}>
                                {formError && (
                                    <div className="mb-6 p-4 border border-red-400/50 bg-red-900/20 backdrop-blur-sm text-red-400 rounded-xl shadow-lg shadow-red-500/10 text-sm sm:text-base">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{formError}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-jcoder-foreground mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="block w-full border border-jcoder rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-jcoder-foreground mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            rows={3}
                                            className="block w-full border border-jcoder rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50 resize-none"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="applicationType" className="block text-sm font-semibold text-jcoder-foreground mb-2">Application Type</label>
                                        <select
                                            name="applicationType"
                                            id="applicationType"
                                            value={formData.applicationType}
                                            onChange={handleChange}
                                            required
                                            className="block w-full border border-jcoder rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground hover:border-jcoder-primary/50"
                                        >
                                            {Object.values(ApplicationTypeEnum).map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="githubUrl" className="block text-sm font-semibold text-jcoder-foreground mb-2">GitHub URL <span className="text-jcoder-muted font-normal">(Optional)</span></label>
                                        <input
                                            type="url"
                                            id="githubUrl"
                                            name="githubUrl"
                                            onChange={handleChange}
                                            value={formData.githubUrl || ''}
                                            className="block w-full border border-jcoder rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                        />
                                    </div>
                            </div>

                                {/* Status Toggle */}
                                <div className="mt-8 pt-8 border-t border-jcoder">
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

                                {/* Conditional Component Fields */}
                                {formData.applicationType === ApplicationTypeEnum.API && (
                                    <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>API Component Details</span>
                                        </h3>
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
                                    <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Frontend Component Details</span>
                                        </h3>
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
                                    <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Mobile Component Details</span>
                                        </h3>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="mobile-platform" className="block text-sm font-medium text-jcoder-muted">Platform</label>
                                            <select
                                                name="applicationComponentMobile.platform"
                                                id="mobile-platform"
                                                value={formData.applicationComponentMobile?.platform || 'Android'}
                                                onChange={handleChange}
                                                required
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
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
                                                className="mt-1 block w-full border border-jcoder rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary sm:text-sm transition-all duration-200 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted hover:border-jcoder-primary/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                                {formData.applicationType === ApplicationTypeEnum.LIBRARY && (
                                    <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Library Component Details</span>
                                        </h3>
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
                                    <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>Frontend Component Details</span>
                                        </h3>
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
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 mt-6 sm:mt-8 flex items-center gap-2">
                                            <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                            <span>API Component Details (for Fullstack)</span>
                                        </h3>
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
                                <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
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
                                        className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex-shrink-0"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                                {/* Profile Image Management Section */}
                                <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                        <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                        <span>Profile Image</span>
                                    </h3>
                                <p className="text-xs sm:text-sm text-jcoder-muted mb-3 sm:mb-4">
                                    Manage the logo or profile image for your application
                                </p>
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="relative">
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
                                <div className="mt-8 pt-8 border-t border-jcoder border-l-4 border-jcoder-primary pl-4 sm:pl-6">
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                        <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
                                        <span>Application Images</span>
                                    </h3>
                                <ImageUpload
                                    images={images}
                                    onImagesChange={setImages}
                                    applicationId={Number(applicationId)}
                                    disabled={loading}
                                />
                            </div>

                                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/${username}/admin/applications`)}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-jcoder rounded-xl text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground hover:border-jcoder-primary transition-all duration-300 font-semibold text-sm sm:text-base"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-jcoder-gradient text-black rounded-xl hover:opacity-90 transition-all duration-300 font-bold transform-gpu hover:scale-105 hover:shadow-xl hover:shadow-jcoder-primary/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group text-sm sm:text-base"
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
                            </form>
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
                                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-jcoder-foreground bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">Criar Nova Tecnologia</h2>
                                <button
                                    onClick={() => {
                                        setShowCreateTechnologyModal(false);
                                        setNewTechnologyData({
                                            name: '',
                                            expertiseLevel: ExpertiseLevel.INTERMEDIATE,
                                        });
                                    }}
                                    className="p-2 hover:bg-jcoder-secondary rounded-lg transition-colors"
                                    disabled={creatingTechnology}
                                >
                                    <svg className="w-6 h-6 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateTechnology} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-jcoder-foreground mb-3">
                                    Nome <span className="text-red-400">*</span>
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
                                    Nível de Expertise <span className="text-red-400">*</span>
                                </label>
                                <select
                                    required
                                    value={newTechnologyData.expertiseLevel}
                                    onChange={(e) => setNewTechnologyData({ ...newTechnologyData, expertiseLevel: e.target.value as ExpertiseLevel })}
                                    className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-xl text-jcoder-foreground focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-jcoder-primary transition-all duration-200 hover:border-jcoder-primary/50"
                                    disabled={creatingTechnology}
                                >
                                    <option value={ExpertiseLevel.BASIC}>Básico</option>
                                    <option value={ExpertiseLevel.INTERMEDIATE}>Intermediário</option>
                                    <option value={ExpertiseLevel.ADVANCED}>Avançado</option>
                                    <option value={ExpertiseLevel.EXPERT}>Especialista</option>
                                </select>
                                <p className="text-sm text-jcoder-muted mt-3">
                                    Selecione seu nível de proficiência com esta tecnologia
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
                                    Cancelar
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
                                            Criando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

