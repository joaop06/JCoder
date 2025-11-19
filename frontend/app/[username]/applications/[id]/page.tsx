'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback, Suspense, useRef } from 'react';
import { Application } from '@/types/api/applications/application.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';
import { ImagesService } from '@/services/administration-by-user/images.service';
import { LazyImage } from '@/components/ui';
import { TableSkeleton } from '@/components/ui';
import { useToast } from '@/components/toast/ToastContext';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import ApplicationTechnologies from '@/components/applications/[id]/ApplicationTechnologies';
import ApplicationImagesGallery from '@/components/applications/[id]/ApplicationImagesGallery';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { MobilePlatformEnum } from '@/types';
import ReactMarkdown from 'react-markdown';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // WebGL and animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  // Refs for mouse position throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Health check state for API component
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');

  const toast = useToast();

  // Get username and appId from URL params
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const appId = useMemo(() => {
    const raw = params?.id;
    const idStr = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(idStr);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  // Retry function for external API health checks
  const retryFetch = useCallback(async (url: string, maxRetries: number = 3): Promise<Response> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        return response;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }, []);

  // Health check effect for API component
  useEffect(() => {
    if (!application?.applicationComponentApi?.healthCheckEndpoint) return;

    let intervalId: NodeJS.Timeout;

    const checkHealth = async () => {
      try {
        const response = await retryFetch(application.applicationComponentApi!.healthCheckEndpoint!);
        if (response.ok) {
          setHealthStatus('ok');
        } else {
          setHealthStatus('error');
        }
      } catch (error) {
        setHealthStatus('error');
      }
    };

    checkHealth(); // Initial check
    intervalId = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [application?.applicationComponentApi?.healthCheckEndpoint, retryFetch]);

  const fetchApplication = useCallback(async () => {
    if (appId === null || !username) {
      const errorMessage = 'Invalid Application ID or Username';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch application and user profile in parallel
      const [appData, profileData] = await Promise.all([
        ApplicationService.getById(username, appId),
        PortfolioViewService.getProfileWithAboutMe(username).catch(() => null),
      ]);

      if (!appData) {
        const errorMessage = 'Application not found';
        setError(errorMessage);
        toast.error(errorMessage);
        setApplication(null);
        return;
      }
      setApplication(appData);
      setUser(profileData || null);
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMessage = status === 404
        ? 'Application not found'
        : 'The application could not be loaded. Please try again';

      setApplication(null);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [appId, username, toast]);

  const handleRetry = useCallback(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleGoHome = useCallback(() => {
    if (username) {
      router.push(`/${username}`);
    } else {
      router.push('/');
    }
  }, [router, username]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
    fetchApplication();
  }, [fetchApplication]);

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? '';

  const getProfileImageUrl = () => {
    if (!application || !username) return '';
    return ImagesService.getApplicationProfileImageUrl(username, application.id);
  };

  const getImageUrl = (filename: string) => {
    if (!application || !username) return '';
    return ImagesService.getApplicationImageUrl(username, application.id, filename);
  };

  // LinkDisplayBlock component
  const LinkDisplayBlock = ({ label, url, icon, showActionButton = true, showCopyButton = true, showUrl = true, actionLabel = 'Access', actionIcon, className = '' }: {
    label: string;
    url: string;
    icon?: React.ReactNode;
    showActionButton?: boolean;
    showCopyButton?: boolean;
    showUrl?: boolean;
    actionLabel?: string;
    actionIcon?: React.ReactNode;
    className?: string;
  }) => (
    <div className={`bg-jcoder-card border border-jcoder rounded-xl p-3 sm:p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center flex-shrink-0">
            {icon || (
              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-jcoder-muted mb-1">{label}</p>
            {showUrl && <p className="text-jcoder-foreground break-all text-sm">{url}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showCopyButton && (
            <CopyToClipboardButton
              textToCopy={url}
              label="Copy"
            />
          )}
          {showActionButton && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-jcoder-primary text-jcoder-primary rounded-md text-sm font-medium hover:bg-jcoder-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-jcoder-primary transition-colors"
            >
              {actionIcon || (
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
              {actionLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );

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

      <Header isAdmin={false} />

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
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-2 px-4 py-2 mb-6 sm:mb-8 text-jcoder-muted hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary rounded-lg transition-all duration-300 hover:bg-jcoder-secondary/50 hover:shadow-lg hover:shadow-jcoder-primary/20 text-sm sm:text-base font-medium"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>

            {/* States: loading / error / content */}
            {loading ? (
              <div className="bg-jcoder-card/80 backdrop-blur-sm border border-jcoder rounded-2xl p-6 sm:p-8 shadow-xl shadow-jcoder-primary/10">
                <TableSkeleton />
              </div>
            ) : error ? (
              <div className="bg-jcoder-card/90 backdrop-blur-sm border border-red-400/50 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-red-500/20 transform-gpu transition-all duration-300">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-2">Oops!</h3>
                  <p className="text-red-300/80 text-base sm:text-lg font-medium mb-6 px-2">{error}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                  <button
                    onClick={handleRetry}
                    className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 border-2 border-jcoder-primary text-jcoder-primary rounded-xl text-sm sm:text-base hover:bg-jcoder-primary hover:text-black transition-all duration-300 font-semibold hover:shadow-lg hover:shadow-jcoder-primary/50 transform hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Try again</span>
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-jcoder-gradient text-black rounded-xl text-sm sm:text-base hover:opacity-90 transition-all duration-300 font-bold transform hover:scale-105 hover:shadow-xl hover:shadow-jcoder-primary/50 active:scale-95"
                  >
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Go to portfolio</span>
                  </button>
                </div>
              </div>
            ) : !application ? (
              <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-jcoder-primary/10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-jcoder-secondary/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-2">Application not found</h3>
                <p className="text-jcoder-muted text-sm sm:text-base">The application you're looking for doesn't exist or has been removed.</p>
              </div>
            ) : (
              <>
                {/* Main Application Card */}
                <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10 max-w-full mx-auto mb-4 sm:mb-6">
                  {/* Application Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 gap-6">
                    <div className="flex items-start gap-4 sm:gap-6 min-w-0">
                      {application.profileImage ? (
                        <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                          <LazyImage
                            src={getProfileImageUrl()}
                            alt={application.name}
                            fallback={application.name}
                            className="object-cover rounded-2xl shadow-lg"
                            size="custom"
                            width="w-16 sm:w-20 md:w-24"
                            height="h-16 sm:h-20 md:h-24"
                          />
                        </div>
                      ) : application.images && application.images.length > 0 ? (
                        <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
                          <LazyImage
                            src={getImageUrl(application.images[0])}
                            alt={application.name}
                            fallback={application.name}
                            className="object-cover rounded-2xl shadow-lg"
                            size="custom"
                            width="w-16 sm:w-20 md:w-24"
                            height="h-16 sm:h-20 md:h-24"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-jcoder-gradient rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-110 transition-transform duration-300">
                          <span className="text-black font-bold text-2xl sm:text-3xl md:text-4xl">
                            {getInitial(application.name)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
                          {application.name}
                        </h1>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-jcoder-secondary/50 border border-jcoder-primary/30 rounded-full">
                          <span className="text-xs sm:text-sm font-semibold text-jcoder-primary uppercase tracking-wide">
                            {application.applicationType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* GitHub URL Card */}
                    {application.githubUrl && (
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <div className="bg-jcoder-card border border-jcoder rounded-xl p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-jcoder-foreground" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                              </svg>
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-jcoder-muted">GitHub Repository</p>
                          </div>
                          <div className="flex items-center justify-end">
                            <a
                              href={application.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1.5 border border-jcoder-primary text-jcoder-primary rounded-md text-sm font-medium hover:bg-jcoder-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-jcoder-primary transition-colors"
                            >
                              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Repository
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                      <span>Description</span>
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-jcoder-muted leading-relaxed pl-3 sm:pl-4">{application.description}</p>
                  </div>

                  {/* Technologies */}
                  {application.technologies && application.technologies.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <ApplicationTechnologies technologies={application.technologies} />
                    </div>
                  )}

                  {/* Images Gallery */}
                  {application.images && application.images.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                      <ApplicationImagesGallery
                        applicationId={application.id}
                        images={application.images}
                      />
                    </div>
                  )}
                </div>

                {/* Component Cards - Separate cards below main card */}
                <div className="mt-4 sm:mt-6 max-w-full mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* API Component Card */}
                    {application.applicationComponentApi && (
                      <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                          <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                          <span>API Component Details</span>
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                          <LinkDisplayBlock
                            label="Domain"
                            url={application.applicationComponentApi.domain}
                            icon={
                              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                            }
                            showActionButton={false}
                          />

                          <LinkDisplayBlock
                            label="API URL"
                            url={application.applicationComponentApi.apiUrl}
                            icon={
                              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            }
                            actionLabel="Access"
                          />

                          {application.applicationComponentApi.healthCheckEndpoint && (
                            <div className="bg-jcoder-card border border-jcoder rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-jcoder-muted mb-1">Health Check Endpoint</p>
                                    <p className="text-jcoder-foreground break-all text-sm">{application.applicationComponentApi.healthCheckEndpoint}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <CopyToClipboardButton
                                    textToCopy={application.applicationComponentApi.healthCheckEndpoint}
                                    label="Copy"
                                  />
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold
                                      ${healthStatus === 'ok' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : healthStatus === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                          : 'bg-jcoder-secondary text-jcoder-muted border border-jcoder'}`}
                                  >
                                    {healthStatus === 'ok' ? 'OK' : healthStatus === 'error' ? 'Error' : 'Checking...'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {application.applicationComponentApi.documentationUrl && (
                            <div>
                              <LinkDisplayBlock
                                label="Documentation"
                                url={application.applicationComponentApi.documentationUrl}
                                icon={
                                  <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                }
                                actionLabel="View Docs"
                                className="mb-4"
                              />
                              <div className="border border-jcoder rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                <iframe
                                  src={application.applicationComponentApi.documentationUrl}
                                  title="API Documentation"
                                  className="w-full h-full border-none"
                                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Frontend Component Card */}
                    {application.applicationComponentFrontend && (
                      <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                          <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                          <span>Frontend Component Details</span>
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                          <LinkDisplayBlock
                            label="Frontend URL"
                            url={application.applicationComponentFrontend.frontendUrl}
                            icon={
                              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                            }
                            actionLabel="Access"
                            actionIcon={
                              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            }
                          />
                          {application.applicationComponentFrontend.screenshotUrl && (
                            <div>
                              <LinkDisplayBlock
                                label="Screenshot URL"
                                url={application.applicationComponentFrontend.screenshotUrl}
                                icon={
                                  <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                }
                                actionLabel="View Screenshot"
                                actionIcon={
                                  <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                }
                                className="mb-4"
                              />
                              <div className="border border-jcoder rounded-lg overflow-hidden">
                                <img src={application.applicationComponentFrontend.screenshotUrl} alt="Frontend Screenshot" className="w-full h-auto" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Component Card */}
                    {application.applicationComponentMobile && (
                      <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                          <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                          <span>Mobile Component Details</span>
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-jcoder-card border border-jcoder rounded-xl p-3 sm:p-4">
                            <p className="text-sm font-medium text-jcoder-muted mb-1">Platform</p>
                            <p className="text-jcoder-foreground text-base sm:text-lg font-semibold">{application.applicationComponentMobile.platform}</p>
                          </div>
                          {application.applicationComponentMobile.downloadUrl && (
                            <LinkDisplayBlock
                              label="Download URL"
                              url={application.applicationComponentMobile.downloadUrl}
                              icon={
                                <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              }
                              actionLabel="Download"
                              actionIcon={
                                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              }
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Library Component Card */}
                    {application.applicationComponentLibrary && (
                      <div className="bg-jcoder-card-light backdrop-blur-sm border border-jcoder rounded-2xl lg:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl shadow-jcoder-primary/10">
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                          <span className="w-1 h-5 sm:h-6 md:h-8 bg-jcoder-gradient rounded-full"></span>
                          <span>Library Component Details</span>
                        </h3>
                        <div className="space-y-4 sm:space-y-6">
                          <LinkDisplayBlock
                            label="Package Manager URL"
                            url={application.applicationComponentLibrary.packageManagerUrl}
                            icon={
                              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            }
                            actionLabel="Access"
                            actionIcon={
                              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            }
                          />
                          {application.applicationComponentLibrary.readmeContent && (
                            <div>
                              <p className="text-sm font-medium text-jcoder-muted mb-3">README Content:</p>
                              <div className="border border-jcoder rounded-lg p-4 bg-jcoder-secondary overflow-auto max-h-96">
                                <div className="prose prose-sm max-w-none prose-invert">
                                  <ReactMarkdown>
                                    {application.applicationComponentLibrary.readmeContent}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer user={user} username={username} />

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
};
