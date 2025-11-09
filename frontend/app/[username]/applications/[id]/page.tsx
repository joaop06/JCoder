'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { Application } from '@/types/api/applications/application.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';

// Import new components
import { TableSkeleton } from '@/components/ui';
import { useToast } from '@/components/toast/ToastContext';
import ApplicationApiDetails from '@/components/applications/[id]/ApplicationApiDetails';
import ApplicationDetailsLayout from '@/components/applications/[id]/ApplicationDetailsLayout';
import ApplicationMobileDetails from '@/components/applications/[id]/ApplicationMobileDetails';
import ApplicationLibraryDetails from '@/components/applications/[id]/ApplicationLibraryDetails';
import ApplicationFrontendDetails from '@/components/applications/[id]/ApplicationFrontendDetails';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

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
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

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

      <Header isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24 relative z-10">
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

        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-jcoder-muted hover:text-jcoder-primary transition-all duration-200 mb-8 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* States: loading / error / content */}
          {loading ? (
            <div className="bg-jcoder-card border border-jcoder rounded-lg p-4 sm:p-8 shadow-lg">
              {/* Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-jcoder-secondary rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-7 w-48 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-4 w-32 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="w-full sm:w-48 h-24 bg-jcoder-secondary rounded-lg animate-pulse"></div>
              </div>

              {/* Description Skeleton */}
              <div className="mb-6">
                <div className="h-6 w-32 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
                <div className="h-4 w-full bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 w-5/6 bg-jcoder-secondary rounded-lg animate-pulse"></div>
              </div>

              {/* Technologies Skeleton */}
              <div className="mb-6">
                <div className="h-6 w-32 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-24 h-8 bg-jcoder-secondary rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-6">
                <TableSkeleton />
              </div>
            </div>
          ) : error ? (
            <div className="bg-jcoder-card/90 backdrop-blur-sm border border-red-400 rounded-2xl p-8 text-center shadow-xl shadow-red-500/10 transform-gpu transition-all duration-300">
              <p className="text-red-400 text-lg font-medium mb-6">{error}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-2 border border-jcoder-primary text-jcoder-primary rounded-lg text-sm hover:bg-jcoder-secondary transition-all duration-200 font-medium group"
                >
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try again
                </button>
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-jcoder-gradient text-black rounded-lg text-sm hover:opacity-90 transition-all duration-200 font-semibold transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Go to portfolio
                </button>
              </div>
            </div>
          ) : !application ? (
            <div className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-8 text-center text-jcoder-muted shadow-xl shadow-jcoder-primary/10">
              Application not found
            </div>
          ) : (
            <ApplicationDetailsLayout application={application}>
              {application.applicationType === ApplicationTypeEnum.API &&
                application.applicationComponentApi && (
                  <ApplicationApiDetails apiDetails={application.applicationComponentApi} />
                )}

              {application.applicationType === ApplicationTypeEnum.MOBILE &&
                application.applicationComponentMobile && (
                  <ApplicationMobileDetails mobileDetails={application.applicationComponentMobile} />
                )}

              {application.applicationType === ApplicationTypeEnum.LIBRARY &&
                application.applicationComponentLibrary && (
                  <ApplicationLibraryDetails libraryDetails={application.applicationComponentLibrary} />
                )}

              {application.applicationType === ApplicationTypeEnum.FRONTEND &&
                application.applicationComponentFrontend && (
                  <ApplicationFrontendDetails frontendDetails={application.applicationComponentFrontend} />
                )}

              {application.applicationType === ApplicationTypeEnum.FULLSTACK && (
                <>
                  {application.applicationComponentFrontend && (
                    <ApplicationFrontendDetails frontendDetails={application.applicationComponentFrontend} />
                  )}
                  {application.applicationComponentApi && (
                    <ApplicationApiDetails apiDetails={application.applicationComponentApi} />
                  )}
                </>
              )}
            </ApplicationDetailsLayout>
          )}
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

