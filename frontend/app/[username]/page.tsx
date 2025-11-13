'use client';

import {
  User,
  Technology,
  Application,
  ExpertiseLevel,
  UserComponentAboutMe,
  UserComponentEducation,
  UserComponentExperience,
  UserComponentCertificate,
  UserComponentReference,
} from '@/types';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useParams } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Hero3D from '@/components/webgl/Hero3D';
import { GitHubIcon } from '@/components/theme';
import Resume from '@/components/resume/Resume';
import { ResumeTemplateType } from '@/components/resume';
import LazyImage from '@/components/ui/LazyImage';
import ScrollToTop from '@/components/ScrollToTop';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useToast } from '@/components/toast/ToastContext';
import FeatureCard3D from '@/components/webgl/FeatureCard3D';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import { useEffect, useState, useMemo, Suspense, useRef, useCallback } from 'react';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { ImagesService } from '@/services/administration-by-user/images.service';
import ApplicationsCarousel from '@/components/applications/ApplicationsCarousel';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';

export default function PortfolioPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(true);

  // User components states
  const [aboutMe, setAboutMe] = useState<UserComponentAboutMe | null>(null);
  const [loadingAboutMe, setLoadingAboutMe] = useState(true);
  const [educations, setEducations] = useState<UserComponentEducation[]>([]);
  const [loadingEducations, setLoadingEducations] = useState(true);
  const [experiences, setExperiences] = useState<UserComponentExperience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(true);
  const [certificates, setCertificates] = useState<UserComponentCertificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [references, setReferences] = useState<UserComponentReference[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);

  // Message form states
  const [messageForm, setMessageForm] = useState({
    senderName: '',
    senderEmail: '',
    message: '',
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  // Refs for mouse position throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const isUpdatingRef = useRef(false);

  const toast = useToast();
  const { scrollToElement } = useSmoothScroll();

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
    let isMounted = true;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMounted) return;

      // Update ref immediately
      mousePositionRef.current = { x: e.clientX, y: e.clientY };

      // Throttle state updates using requestAnimationFrame
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          if (!isMounted) {
            rafRef.current = null;
            return;
          }

          const currentPos = mousePositionRef.current;
          const lastPos = lastPositionRef.current;

          // Only update if position actually changed (with threshold to avoid micro-movements)
          const threshold = 1;
          const hasChanged =
            Math.abs(currentPos.x - lastPos.x) > threshold ||
            Math.abs(currentPos.y - lastPos.y) > threshold;

          if (hasChanged && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            lastPositionRef.current = { x: currentPos.x, y: currentPos.y };
            // Use functional update to ensure we only update when value actually changes
            setMousePosition((prev) => {
              // Double-check to prevent unnecessary updates
              if (
                prev.x === currentPos.x &&
                prev.y === currentPos.y
              ) {
                return prev;
              }
              return { x: currentPos.x, y: currentPos.y };
            });
            // Reset flag after a short delay to allow state update to complete
            setTimeout(() => {
              isUpdatingRef.current = false;
            }, 0);
          }
          rafRef.current = null;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      isMounted = false;
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  // Get username from URL params
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const loadApplications = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const allApplications: Application[] = [];
      let page = 1;
      let hasMore = true;
      const limit = 100; // Load 100 at a time for better performance

      // Load all applications using pagination
      while (hasMore) {
        const data = await PortfolioViewService.getApplications(username, {
          page,
          limit,
          sortBy: 'displayOrder',
          sortOrder: 'ASC',
        });

        if (data.data && data.data.length > 0) {
          allApplications.push(...data.data);
        }

        // Check if there are more pages
        hasMore = data.meta?.hasNextPage || false;
        page++;

        // Safety limit to avoid infinite loops
        if (page > 100) {
          console.warn('Page limit reached while loading applications');
          break;
        }
      }

      console.log('[Portfolio] Applications data loaded:', {
        totalApplications: allApplications.length,
        applications: allApplications,
      });
      setApplications(allApplications);
    } catch (err) {
      console.error('Failure to load applications', err);
      const errorMessage = 'The applications could not be loaded. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [username, toast]);

  const loadTechnologies = useCallback(async () => {
    if (!username) return;
    setLoadingTechs(true);
    try {
      const data = await PortfolioViewService.getTechnologies(username, {
        sortBy: 'displayOrder',
        sortOrder: 'ASC',
        limit: 100,
      });
      console.log('[Portfolio] Technologies data loaded:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        data: data?.data,
        meta: data?.meta,
      });
      setTechnologies(data.data || []);
    } catch (err) {
      console.error('Failure to load technologies', err);
      setTechnologies([]);
    } finally {
      setLoadingTechs(false);
    }
  }, [username]);

  const loadAboutMe = useCallback(async () => {
    if (!username) return;
    setLoadingAboutMe(true);
    try {
      const profileData = await PortfolioViewService.getProfileWithAboutMe(username);
      // Backend retorna userComponentAboutMe, não aboutMe
      setAboutMe(profileData.userComponentAboutMe || null);
      setUser(profileData);

      // Debug: Log profile data
      console.log('[Portfolio] Profile data loaded:', {
        hasUser: !!profileData,
        userId: profileData?.id,
        hasProfileImage: !!profileData?.profileImage,
        profileImage: profileData?.profileImage,
        username: username,
        hasAboutMe: !!profileData?.userComponentAboutMe,
        aboutMeData: profileData?.userComponentAboutMe,
        imageUrl: profileData?.profileImage && profileData?.id
          ? ImagesService.getUserProfileImageUrl(username, profileData.id)
          : 'N/A'
      });
    } catch (err) {
      console.error('Failure to load about me', err);
      setAboutMe(null);
    } finally {
      setLoadingAboutMe(false);
    }
  }, [username]);

  const loadEducations = useCallback(async () => {
    if (!username) return;
    setLoadingEducations(true);
    try {
      const data = await PortfolioViewService.getEducations(username);
      console.log('[Portfolio] Educations data loaded:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        data: data?.data,
        meta: data?.meta,
      });
      setEducations(data.data || []);
    } catch (err) {
      console.error('Failure to load educations', err);
      setEducations([]);
    } finally {
      setLoadingEducations(false);
    }
  }, [username]);

  const loadExperiences = useCallback(async () => {
    if (!username) return;
    setLoadingExperiences(true);
    try {
      const data = await PortfolioViewService.getExperiences(username);
      console.log('[Portfolio] Experiences data loaded:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        data: data?.data,
        meta: data?.meta,
      });
      setExperiences(data.data || []);
    } catch (err) {
      console.error('Failure to load experiences', err);
      setExperiences([]);
    } finally {
      setLoadingExperiences(false);
    }
  }, [username]);

  const loadCertificates = useCallback(async () => {
    if (!username) return;
    setLoadingCertificates(true);
    try {
      const data = await PortfolioViewService.getCertificates(username);
      console.log('[Portfolio] Certificates data loaded:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        data: data?.data,
        meta: data?.meta,
      });
      setCertificates(data.data || []);
    } catch (err) {
      console.error('Failure to load certificates', err);
      setCertificates([]);
    } finally {
      setLoadingCertificates(false);
    }
  }, [username]);

  const loadReferences = useCallback(async () => {
    if (!username) return;
    setLoadingReferences(true);
    try {
      const data = await PortfolioViewService.getReferences(username);
      console.log('[Portfolio] References data loaded:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        data: data?.data,
        meta: data?.meta,
      });
      setReferences(data.data || []);
    } catch (err) {
      console.error('Failure to load references', err);
      setReferences([]);
    } finally {
      setLoadingReferences(false);
    }
  }, [username]);

  // User pre-check
  useEffect(() => {
    if (!username) return;
    let isMounted = true;

    const checkUserExists = async () => {
      setCheckingUser(true);
      setUserNotFound(false);
      try {
        const result = await PortfolioViewService.checkUsernameAvailability(username);
        // If available === true, it means the user does NOT exist
        if (result.available) {
          if (isMounted) {
            setUserNotFound(true);
            setCheckingUser(false);
          }
          return;
        }
        // If available === false, the user exists, so we load the data
        if (isMounted) {
          await Promise.all([
            loadAboutMe(),
            loadApplications(),
            loadTechnologies(),
            loadEducations(),
            loadExperiences(),
            loadCertificates(),
            loadReferences(),
          ]);
          setCheckingUser(false);
        }
      } catch (err) {
        console.error('Error checking user', err);
        if (isMounted) {
          setUserNotFound(true);
          setCheckingUser(false);
        }
      }
    };

    checkUserExists();

    return () => {
      isMounted = false;
    };
  }, [username, loadAboutMe, loadApplications, loadTechnologies, loadEducations, loadExperiences, loadCertificates, loadReferences]);

  const scrollToSection = (sectionId: string) => {
    scrollToElement(sectionId, 80);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(dateObj);
  };

  const formatDateRange = (startDate: Date | string, endDate?: Date | string, isCurrent?: boolean): string => {
    const start = formatDate(startDate);
    if (isCurrent) {
      return `${start} - Present`;
    }
    if (endDate) {
      return `${start} - ${formatDate(endDate)}`;
    }
    return start;
  };

  const handleDownloadResume = async () => {
    setGeneratingPDF(true);
    try {
      const { generateResumePDF, ResumeTemplateType } = await import('@/components/resume');
      await generateResumePDF({
        templateType: ResumeTemplateType.MODERN,
      });
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      console.error('Error generating resume PDF:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!messageForm.senderName.trim()) {
      toast.error('Please enter your name.');
      return;
    }

    if (!messageForm.senderEmail.trim()) {
      toast.error('Please enter your email.');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(messageForm.senderEmail)) {
      toast.error('Please enter a valid email.');
      return;
    }

    if (!messageForm.message.trim()) {
      toast.error('Please write a message.');
      return;
    }

    setSendingMessage(true);
    try {
      await PortfolioViewService.createMessage(username, {
        senderName: messageForm.senderName.trim(),
        senderEmail: messageForm.senderEmail.trim(),
        message: messageForm.message.trim(),
      });

      toast.success('Message sent successfully!');
      // Clear form
      setMessageForm({
        senderName: '',
        senderEmail: '',
        message: '',
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-jcoder-muted">Invalid username</p>
      </div>
    );
  }

  // User not found screen
  if (checkingUser) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAdmin={false} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary mx-auto mb-4"></div>
            <p className="text-jcoder-muted">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (userNotFound) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAdmin={false} />
        <main className="flex-1 flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-jcoder-cyan/10 via-transparent to-jcoder-blue/10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jcoder-cyan/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-jcoder-blue/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 text-center max-w-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="mb-6 sm:mb-8">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-jcoder-primary/20 mb-3 sm:mb-4">404</div>
              <div className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-5 md:mb-6">🔍</div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-jcoder-foreground mb-3 sm:mb-4">
              User not found
            </h1>

            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-jcoder-muted mb-6 sm:mb-7 md:mb-8 max-w-xl mx-auto leading-relaxed px-2">
              The user's portfolio <span className="font-semibold text-jcoder-primary">@{username}</span> does not exist or is not available.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
              <a
                href="/"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Back to Home
              </a>
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 text-sm sm:text-base"
              >
                Back
              </button>
            </div>
          </div>
        </main>
        <Footer user={null} username={username} />
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

      <Header isAdmin={false} />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* 3D Particles no Background */}
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

          <div className={`relative z-10 text-center max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Profile Image */}
            <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <div
                className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mx-auto rounded-full bg-jcoder-gradient p-1 shadow-2xl shadow-jcoder-primary/60 transform-gpu animate-bounce-slow"
                style={{
                  transform: `perspective(1000px) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 8}deg) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 8}deg)`,
                }}
              >
                <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center overflow-hidden ring-2 ring-jcoder-primary/20 relative">
                  {user?.profileImage && user?.id ? (
                    <HeroProfileImage
                      src={ImagesService.getUserProfileImageUrl(username, user.id)}
                      alt={user.fullName || username}
                      fallback={username.charAt(0).toUpperCase()}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-jcoder-gradient rounded-full">
                      <span className="text-black font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                        {username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-5 md:mb-6 px-2">
              <span className="relative inline-block">
                {/* Base text visible as fallback */}
                <span className="text-jcoder-foreground opacity-100">
                  {user?.fullName || user?.firstName || username}
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
                  {user?.fullName || user?.firstName || username}
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            {aboutMe?.occupation && (
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-jcoder-foreground mb-3 sm:mb-4 px-2">
                {aboutMe.occupation}
              </h2>
            )}

            {/* Description */}
            {aboutMe?.description ? (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-jcoder-muted mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
                {aboutMe.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
            ) : (
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-jcoder-muted mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
                Welcome to my portfolio
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-2">
              <button
                onClick={() => scrollToSection('projects')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary hover:shadow-xl transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group text-sm sm:text-base"
              >
                View Projects
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={handleDownloadResume}
                disabled={generatingPDF}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-jcoder-card border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform-gpu hover:scale-105 active:scale-95 group text-sm sm:text-base"
              >
                {generatingPDF ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">Generating...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>Download Resume</span>
                  </>
                )}
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2 transform-gpu hover:scale-105 active:scale-95 group text-sm sm:text-base"
              >
                Get in Touch
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-12 sm:py-16 md:py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground text-center mb-8 sm:mb-10 md:mb-12">
                About Me
              </h2>

              {loadingAboutMe ? (
                <AboutMeSkeleton />
              ) : aboutMe ? (
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                  <div className="order-2 lg:order-1">
                    <div className="relative">
                      <div className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 mx-auto lg:mx-0 rounded-2xl overflow-hidden bg-jcoder-gradient p-1">
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-jcoder-card">
                          {user?.profileImage ? (
                            <LazyImage
                              src={ImagesService.getUserProfileImageUrl(username, user.id)}
                              alt="Profile Picture"
                              fallback={username.charAt(0).toUpperCase()}
                              size="custom"
                              width="w-full"
                              height="h-full"
                              rounded="rounded-2xl"
                              objectFit="object-cover"
                              rootMargin="100px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                              {username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-jcoder-cyan rounded-full opacity-60"></div>
                      <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-jcoder-blue rounded-full opacity-40"></div>
                    </div>
                  </div>

                  <div className="order-1 lg:order-2 text-center lg:text-left">
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-3 sm:mb-4">
                        {user?.fullName || username}
                      </h3>
                      {aboutMe.occupation && (
                        <p className="text-base sm:text-lg text-jcoder-primary font-semibold mb-4 sm:mb-6">
                          {aboutMe.occupation}
                        </p>
                      )}
                    </div>

                    {aboutMe.description && (
                      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                        <div
                          className="text-sm sm:text-base md:text-lg text-jcoder-muted leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: aboutMe.description }}
                        />
                      </div>
                    )}

                    {aboutMe.highlights && aboutMe.highlights.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {aboutMe.highlights.map((highlight, index) => (
                          <div key={index} className="bg-jcoder-card rounded-xl p-3 sm:p-4 border border-jcoder">
                            {highlight.emoji && <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{highlight.emoji}</div>}
                            <h4 className="font-semibold text-sm sm:text-base text-jcoder-foreground mb-1">{highlight.title}</h4>
                            {highlight.subtitle && (
                              <p className="text-xs sm:text-sm text-jcoder-muted">{highlight.subtitle}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                      <button
                        onClick={() => scrollToSection('projects')}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                      >
                        View My Work
                      </button>
                      <button
                        onClick={() => scrollToSection('contact')}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 text-sm sm:text-base"
                      >
                        Get in Touch
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-jcoder-muted text-lg">About Me information not available.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Professional Experience Section */}
        {(loadingExperiences || experiences.length > 0) && (
          <section id="experience" className="py-12 sm:py-16 md:py-20 bg-jcoder-card/50">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground text-center mb-8 sm:mb-10 md:mb-12">
                  Professional Experience
                </h2>

                {loadingExperiences ? (
                  <ExperienceSkeleton />
                ) : experiences.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {experiences.map((experience, expIndex) => (
                      <div
                        key={`experience-${experience.username}-${experience.companyName}-${expIndex}`}
                        className="bg-jcoder-card rounded-2xl p-4 sm:p-5 md:p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300"
                      >
                        <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-5 md:mb-6">
                          {experience.companyName}
                        </h3>

                        {experience.positions && experience.positions.length > 0 && (
                          <div className="space-y-4 sm:space-y-5 md:space-y-6 pl-3 sm:pl-4 border-l-2 border-jcoder-primary/30">
                            {experience.positions.map((position, index) => (
                              <div key={`position-${position.id || index}-${position.position}`} className="relative">
                                <div className="absolute -left-[23px] sm:-left-[29px] top-0 w-3 h-3 sm:w-4 sm:h-4 bg-jcoder-primary rounded-full"></div>
                                <div className="mb-3 sm:mb-4">
                                  <h4 className="text-lg sm:text-xl font-semibold text-jcoder-foreground mb-1.5 sm:mb-2">
                                    {position.position}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mb-2">
                                    <p className="text-xs sm:text-sm text-jcoder-muted">
                                      {formatDateRange(
                                        position.startDate,
                                        position.endDate,
                                        position.isCurrentPosition
                                      )}
                                    </p>
                                    {position.location && (
                                      <span className="text-xs sm:text-sm text-jcoder-muted">
                                        📍 {position.location}
                                        {position.locationType && ` • ${position.locationType}`}
                                      </span>
                                    )}
                                    {position.isCurrentPosition && (
                                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-jcoder-primary/20 text-jcoder-primary">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        <section id="projects" className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground text-center mb-8 sm:mb-10 md:mb-12">
                Projects & Applications
              </h2>

              {loading ? (
                <ProjectsGridSkeleton />
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={loadApplications}
                    className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : applications.length > 0 ? (
                <ApplicationsCarousel
                  applications={applications}
                  username={username}
                  mouse={mousePosition}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-jcoder-muted text-lg">No projects found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="tech-stack" className="py-12 sm:py-16 md:py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground text-center mb-8 sm:mb-10 md:mb-12">
                Technologies & Stacks
              </h2>

              {loadingTechs ? (
                <TechnologiesGridSkeleton />
              ) : technologies.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
                  {technologies.map((tech, index) => (
                    <FeatureCard3D key={tech.id} mouse={mousePosition} index={index}>
                      <TechnologyCard technology={tech} username={username} />
                    </FeatureCard3D>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-jcoder-muted text-lg">No technologies found.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Education & Certifications Section */}
        {((loadingEducations || educations.length > 0) || (loadingCertificates || certificates.length > 0)) && (
          <section id="education-certifications" className="py-12 sm:py-16 md:py-20 bg-jcoder-card/50">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground text-center mb-8 sm:mb-10 md:mb-12">
                  Education & Certifications
                </h2>

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-7 md:gap-8">
                  <div>
                    {(loadingEducations || educations.length > 0) && (
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-5 md:mb-6">
                          Education
                        </h3>
                        {loadingEducations ? (
                          <EducationSkeleton />
                        ) : educations.length > 0 ? (
                          <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            {educations.map((education, eduIndex) => (
                              <div
                                key={education.id || `edu-${eduIndex}`}
                                className="bg-jcoder-card rounded-2xl p-4 sm:p-5 md:p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300"
                              >
                                <div className="flex flex-col gap-3 sm:gap-4">
                                  <div className="flex-1">
                                    <h4 className="text-lg sm:text-xl font-bold text-jcoder-foreground mb-1.5 sm:mb-2">
                                      {education.courseName}
                                    </h4>
                                    <p className="text-base sm:text-lg text-jcoder-primary font-semibold mb-1.5 sm:mb-2">
                                      {education.institutionName}
                                    </p>
                                    {education.degree && (
                                      <p className="text-sm sm:text-base text-jcoder-muted mb-3 sm:mb-4">{education.degree}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs sm:text-sm text-jcoder-foreground font-semibold">
                                      {formatDateRange(
                                        education.startDate,
                                        education.endDate,
                                        education.isCurrentlyStudying
                                      )}
                                    </p>
                                    {education.isCurrentlyStudying && (
                                      <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-jcoder-primary/20 text-jcoder-primary">
                                        Current
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-jcoder-muted">No education records found.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div>
                    {(loadingCertificates || certificates.length > 0) && (
                      <>
                        <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-5 md:mb-6">
                          Certifications
                        </h3>
                        {loadingCertificates ? (
                          <CertificatesSkeleton />
                        ) : certificates.length > 0 ? (
                          <div className="space-y-4 sm:space-y-5 md:space-y-6">
                            {certificates.map((certificate, certIndex) => (
                              <div
                                key={certificate.id || `cert-${certIndex}`}
                                className="bg-jcoder-card rounded-2xl p-4 sm:p-5 md:p-6 border border-jcoder hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg"
                              >
                                {certificate.profileImage && certificate.id && (
                                  <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden bg-jcoder-secondary">
                                    <LazyImage
                                      src={ImagesService.getCertificateImageUrl(username, certificate.id)}
                                      alt={certificate.certificateName}
                                      fallback="🎓"
                                      size="custom"
                                      width="w-full"
                                      height="h-32 sm:h-36 md:h-40"
                                      rounded="rounded-lg"
                                      objectFit="object-cover"
                                      rootMargin="100px"
                                    />
                                  </div>
                                )}
                                <h4 className="text-base sm:text-lg font-bold text-jcoder-foreground mb-1.5 sm:mb-2">
                                  {certificate.certificateName}
                                </h4>
                                {certificate.registrationNumber && (
                                  <p className="text-[10px] sm:text-xs text-jcoder-muted mb-1">
                                    Registration: {certificate.registrationNumber}
                                  </p>
                                )}
                                <p className="text-[10px] sm:text-xs text-jcoder-muted mb-1.5 sm:mb-2">
                                  Issued: {formatDate(certificate.issueDate)}
                                </p>
                                {certificate.issuedTo && (
                                  <p className="text-[10px] sm:text-xs text-jcoder-muted mb-2 sm:mb-3">
                                    To: {certificate.issuedTo}
                                  </p>
                                )}
                                {certificate.verificationUrl && (
                                  <a
                                    href={certificate.verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-jcoder-primary hover:text-jcoder-accent transition-colors text-[10px] sm:text-xs font-semibold"
                                  >
                                    Verify Certificate
                                    <svg
                                      className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-jcoder-muted">No certifications found.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Social & Contact Section */}
        <section id="contact" className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground mb-6 sm:mb-7 md:mb-8">
                Let's Connect
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-jcoder-muted mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-2">
                I'm always open to new opportunities and collaborations.
                Get in touch with me through social media or email.
              </p>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12 px-2">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300 text-sm sm:text-base"
                  >
                    <GitHubIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-semibold">GitHub</span>
                  </a>
                )}

                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300 text-sm sm:text-base"
                  >
                    <LazyImage
                      src="/images/icons/linkedin.png"
                      alt="LinkedIn"
                      fallback="Li"
                      size="custom"
                      width="w-5 h-5 sm:w-6 sm:h-6"
                      height="h-5 sm:h-6"
                      showSkeleton={false}
                    />
                    <span className="font-semibold">LinkedIn</span>
                  </a>
                )}

                {user?.email && (
                  <a
                    href={`mailto:${user.email}`}
                    className="group flex items-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300 text-sm sm:text-base"
                  >
                    <LazyImage
                      src="/images/icons/gmail.png"
                      alt="Gmail"
                      fallback="@"
                      size="custom"
                      width="w-5 h-5 sm:w-6 sm:h-6"
                      height="h-5 sm:h-6"
                      showSkeleton={false}
                    />
                    <span className="font-semibold">Email</span>
                  </a>
                )}
              </div>

              <div className="max-w-2xl mx-auto px-2">
                <div
                  className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 hover:-translate-y-1"
                  style={{
                    transform: `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)`,
                  }}
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-5 md:mb-6">
                    Send a Message
                  </h3>
                  <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={handleMessageSubmit}>
                    <div className="grid md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                      <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02]">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={messageForm.senderName}
                          onChange={(e) => setMessageForm({ ...messageForm, senderName: e.target.value })}
                          disabled={sendingMessage}
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-jcoder-primary/50"
                        />
                      </div>
                      <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02]">
                        <input
                          type="email"
                          placeholder="Your Email"
                          value={messageForm.senderEmail}
                          onChange={(e) => setMessageForm({ ...messageForm, senderEmail: e.target.value })}
                          disabled={sendingMessage}
                          required
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-jcoder-primary/50"
                        />
                      </div>
                    </div>
                    <div className="transform-gpu transition-transform duration-200 hover:scale-[1.01]">
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        value={messageForm.message}
                        onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                        disabled={sendingMessage}
                        required
                        maxLength={5000}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-jcoder-primary/50"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={sendingMessage}
                      className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary hover:shadow-xl transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group text-sm sm:text-base"
                    >
                      {sendingMessage ? (
                        <>
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-y-[-2px] transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer user={user} username={username} />
      <ScrollToTop />

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>

      {/* Hidden Resume Component for PDF Generation */}
      <div style={{ display: 'none' }}>
        <Resume
          user={user}
          aboutMe={aboutMe}
          educations={educations}
          references={references}
          experiences={experiences}
          certificates={certificates}
          technologies={technologies}
          templateType={ResumeTemplateType.MODERN}
        />
      </div>
    </div>
  );
}

// Skeleton Components
function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-jcoder-card border border-jcoder rounded-lg p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-jcoder-secondary flex-shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-5 bg-jcoder-secondary rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-jcoder-secondary rounded w-full"></div>
                <div className="h-4 bg-jcoder-secondary rounded w-5/6"></div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="h-9 bg-jcoder-secondary rounded-lg w-28"></div>
                <div className="h-9 bg-jcoder-secondary rounded-lg w-20"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TechnologiesGridSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="text-center w-32 animate-pulse">
          <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-secondary rounded-2xl"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-20 mx-auto mb-2"></div>
          <div className="h-3 bg-jcoder-secondary rounded-full w-16 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

function AboutMeSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center animate-pulse">
      <div className="order-2 lg:order-1">
        <div className="w-80 h-80 mx-auto lg:mx-0 rounded-2xl bg-jcoder-secondary"></div>
      </div>
      <div className="order-1 lg:order-2 space-y-6">
        <div className="h-8 bg-jcoder-secondary rounded w-3/4"></div>
        <div className="h-6 bg-jcoder-secondary rounded w-1/2"></div>
        <div className="space-y-3">
          <div className="h-4 bg-jcoder-secondary rounded w-full"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-5/6"></div>
          <div className="h-4 bg-jcoder-secondary rounded w-4/6"></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-jcoder-secondary rounded-xl p-4 h-24"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EducationSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-jcoder-secondary rounded w-3/4"></div>
              <div className="h-5 bg-jcoder-secondary rounded w-1/2"></div>
              <div className="h-4 bg-jcoder-secondary rounded w-1/3"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-jcoder-secondary rounded w-32"></div>
              <div className="h-6 bg-jcoder-secondary rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceSkeleton() {
  return (
    <div className="space-y-8">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="h-6 bg-jcoder-secondary rounded w-1/3 mb-6"></div>
          <div className="space-y-6 pl-4 border-l-2 border-jcoder-primary/30">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="space-y-3">
                <div className="h-5 bg-jcoder-secondary rounded w-1/2"></div>
                <div className="h-4 bg-jcoder-secondary rounded w-32"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-jcoder-secondary rounded w-full"></div>
                  <div className="h-3 bg-jcoder-secondary rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificatesSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-jcoder-card rounded-2xl p-6 border border-jcoder animate-pulse">
          <div className="h-40 bg-jcoder-secondary rounded-lg mb-4"></div>
          <div className="h-5 bg-jcoder-secondary rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-jcoder-secondary rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

// Hero Profile Image Component - Simple and direct implementation
interface HeroProfileImageProps {
  src: string;
  alt: string;
  fallback: string;
}

function HeroProfileImage({ src, alt, fallback }: HeroProfileImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Debug: Log when component mounts and src changes
  useEffect(() => {
    console.log('[HeroProfileImage] Component mounted/updated:', {
      src,
      hasError,
      isLoading
    });

    // Reset states
    setHasError(false);
    setIsLoading(true);

    // Force image reload if src changes
    if (imgRef.current && src) {
      imgRef.current.src = src;
    }
  }, [src]);

  const handleLoad = () => {
    console.log('[HeroProfileImage] Image loaded successfully:', src);
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('[HeroProfileImage] Image failed to load:', {
      src,
      error: e,
      target: e.currentTarget,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight
    });
    setIsLoading(false);
    setHasError(true);
  };

  // Show fallback if error occurred
  if (hasError) {
    console.log('[HeroProfileImage] Showing fallback for:', fallback);
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-jcoder-gradient rounded-full z-10">
        <span className="text-black font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          {fallback}
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-jcoder-secondary animate-pulse rounded-full z-0" />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-300 z-10 ${isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="eager"
        decoding="async"
        crossOrigin="anonymous"
      />
    </>
  );
}

// Technology Card Component
interface TechnologyCardProps {
  technology: Technology;
  username: string;
}

function TechnologyCard({ technology, username }: TechnologyCardProps) {
  const imageUrl = ImagesService.getTechnologyProfileImageUrl(username, technology.id);

  const getExpertiseLevelLabel = (level: ExpertiseLevel): string => {
    const labels: Record<ExpertiseLevel, string> = {
      [ExpertiseLevel.BASIC]: 'Basic',
      [ExpertiseLevel.INTERMEDIATE]: 'Intermediate',
      [ExpertiseLevel.ADVANCED]: 'Advanced',
      [ExpertiseLevel.EXPERT]: 'Expert',
    };
    return labels[level];
  };

  const getExpertiseLevelColor = (level: ExpertiseLevel): string => {
    const colors: Record<ExpertiseLevel, string> = {
      [ExpertiseLevel.BASIC]: 'bg-gray-500/20 text-gray-400',
      [ExpertiseLevel.INTERMEDIATE]: 'bg-blue-500/20 text-blue-400',
      [ExpertiseLevel.ADVANCED]: 'bg-purple-500/20 text-purple-400',
      [ExpertiseLevel.EXPERT]: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[level];
  };

  return (
    <div
      className="text-center group relative w-24 sm:w-28 md:w-32"
      title={`${technology.name} - ${getExpertiseLevelLabel(technology.expertiseLevel)}`}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300 p-2 sm:p-2.5 md:p-3 relative">
        <LazyImage
          src={imageUrl}
          alt={technology.name}
          fallback={technology.name.substring(0, 2)}
          size="custom"
          width="w-full"
          height="h-full"
          rounded="rounded-xl"
          objectFit="object-contain"
          rootMargin="150px"
        />
      </div>
      <h3 className="font-semibold text-sm sm:text-base text-jcoder-foreground group-hover:text-jcoder-primary transition-colors">
        {technology.name}
      </h3>
      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 ${getExpertiseLevelColor(technology.expertiseLevel)}`}>
        {getExpertiseLevelLabel(technology.expertiseLevel)}
      </span>
    </div>
  );
}
