'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo, Suspense, useRef } from 'react';
import { UsersService } from '@/services/administration-by-user/users.service';
import { DashboardService } from '@/services/administration-by-user/dashboard.service';
import {
  ApplicationsStatsDto,
  TechnologiesStatsDto,
  UnreadMessagesDto,
  ProfileCompletenessDto,
} from '@/types/api/dashboard';
import { Canvas } from '@react-three/fiber';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';

export default function AdminDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Dashboard data states
  const [applicationsStats, setApplicationsStats] = useState<ApplicationsStatsDto | null>(null);
  const [technologiesStats, setTechnologiesStats] = useState<TechnologiesStatsDto | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessagesDto | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompletenessDto | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebGL and animation states
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  // Refs for mouse position throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Get username from URL params
  const urlUsername = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

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
    const userSession = UsersService.getUserSession();
    const loggedInUsername = userSession?.user?.username;

    if (!token || !loggedInUsername) {
      router.push('/sign-in');
      return;
    }

    // Check if logged in user matches URL username
    if (loggedInUsername !== urlUsername) {
      router.push(`/${loggedInUsername}/admin`);
      return;
    }

    // Load user profile data for footer
    const loadUserProfile = async () => {
      try {
        const userProfile = await UsersService.getProfile(urlUsername);
        setUser(userProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to session data if API call fails
        if (userSession?.user) {
          setUser(userSession.user);
        }
      }
    };

    setIsAuthenticated(true);
    loadUserProfile();
    setLoading(false);
  }, [router, urlUsername]);

  // Load dashboard stats
  useEffect(() => {
    if (!isAuthenticated || !urlUsername) return;

    const loadDashboardStats = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        // Load all stats in parallel for better performance
        const [applications, technologies, messages, profile] = await Promise.all([
          DashboardService.getApplicationsStats(urlUsername),
          DashboardService.getTechnologiesStats(urlUsername),
          DashboardService.getUnreadMessagesStats(urlUsername),
          DashboardService.getProfileCompleteness(urlUsername),
        ]);

        setApplicationsStats(applications);
        setTechnologiesStats(technologies);
        setUnreadMessages(messages);
        setProfileCompleteness(profile);
      } catch (err: any) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboardStats();
  }, [isAuthenticated, urlUsername]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/');
  }, [router]);

  // Quick navigation sections
  const adminSections = useMemo(() => [
    {
      title: 'Applications',
      description: 'Manage your portfolio applications',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: `/${urlUsername}/admin/applications`,
      color: 'from-blue-500 to-cyan-500',
      stats: applicationsStats,
    },
    {
      title: 'Technologies',
      description: 'Manage technologies and tech stack',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      href: `/${urlUsername}/admin/technologies`,
      color: 'from-green-500 to-emerald-500',
      stats: technologiesStats,
    },
    {
      title: 'Messages',
      description: 'View and manage messages from visitors',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: `/${urlUsername}/admin/messages`,
      color: 'from-purple-500 to-pink-500',
      unreadCount: unreadMessages?.total || 0,
    },
    {
      title: 'Profile',
      description: 'Manage your administrator profile',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: `/${urlUsername}/admin/profile`,
      color: 'from-orange-500 to-red-500',
      completeness: profileCompleteness?.percentage || 0,
    },
  ], [urlUsername, applicationsStats, technologiesStats, unreadMessages, profileCompleteness]);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
        {/* WebGL Background */}
        <div className="hidden md:block">
          <Suspense fallback={null}>
            <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
          </Suspense>
        </div>

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
        </div>

        <Header isAdmin={true} onLogout={handleLogout} />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 sm:mb-12">
              <div className="h-8 sm:h-12 w-48 sm:w-80 bg-jcoder-secondary rounded-lg mb-2 sm:mb-3 animate-pulse"></div>
              <div className="h-4 sm:h-6 w-64 sm:w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-jcoder-card border border-jcoder rounded-xl p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-jcoder-secondary rounded-xl mb-4 sm:mb-6 animate-pulse"></div>
                  <div className="h-6 sm:h-8 w-32 sm:w-40 bg-jcoder-secondary rounded-lg mb-2 sm:mb-3 animate-pulse"></div>
                  <div className="h-3 sm:h-4 w-full bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer user={user} username={urlUsername} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* WebGL Background */}
      <div className="hidden md:block">
        <Suspense fallback={null}>
          <WebGLBackground mouse={mousePosition} windowSize={windowSize} />
        </Suspense>
      </div>

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] md:bg-[size:24px_24px]" />
      </div>

      <Header isAdmin={true} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-6 sm:pb-12 relative z-10">
        {/* 3D Particles in Background */}
        <div className="hidden md:block fixed inset-0 pointer-events-none z-0">
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
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 px-4 mt-4 md:mt-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-jcoder-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-jcoder-muted">
              Overview of your portfolio and administration panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Applications Stats Card */}
            <div
              className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1 cursor-pointer group"
              onClick={() => router.push(`/${urlUsername}/admin/applications`)}
              style={{
                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center transform-gpu group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                {loadingStats ? (
                  <div className="h-4 w-16 bg-jcoder-secondary rounded animate-pulse"></div>
                ) : (
                  <span className="text-xs sm:text-sm text-jcoder-muted">Applications</span>
                )}
              </div>
              {loadingStats ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-jcoder-secondary rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-jcoder-foreground mb-2">
                    {applicationsStats?.total || 0}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-green-500 font-semibold">{applicationsStats?.active || 0} active</span>
                    <span className="text-jcoder-muted">•</span>
                    <span className="text-red-500 font-semibold">{applicationsStats?.inactive || 0} inactive</span>
                  </div>
                </>
              )}
            </div>

            {/* Technologies Stats Card */}
            <div
              className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1 cursor-pointer group"
              onClick={() => router.push(`/${urlUsername}/admin/technologies`)}
              style={{
                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center transform-gpu group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                {loadingStats ? (
                  <div className="h-4 w-16 bg-jcoder-secondary rounded animate-pulse"></div>
                ) : (
                  <span className="text-xs sm:text-sm text-jcoder-muted">Technologies</span>
                )}
              </div>
              {loadingStats ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-jcoder-secondary rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-jcoder-foreground mb-2">
                    {technologiesStats?.total || 0}
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="text-green-500 font-semibold">{technologiesStats?.active || 0} active</span>
                    <span className="text-jcoder-muted">•</span>
                    <span className="text-red-500 font-semibold">{technologiesStats?.inactive || 0} inactive</span>
                  </div>
                </>
              )}
            </div>

            {/* Unread Messages Card */}
            <div
              className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1 cursor-pointer group relative"
              onClick={() => router.push(`/${urlUsername}/admin/messages`)}
              style={{
                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
              }}
            >
              {unreadMessages && unreadMessages.total > 0 && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-jcoder-blue rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                  {unreadMessages.total > 9 ? '9+' : unreadMessages.total}
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center transform-gpu group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                {loadingStats ? (
                  <div className="h-4 w-16 bg-jcoder-secondary rounded animate-pulse"></div>
                ) : (
                  <span className="text-xs sm:text-sm text-jcoder-muted">Messages</span>
                )}
              </div>
              {loadingStats ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-jcoder-secondary rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-jcoder-foreground mb-2">
                    {unreadMessages?.total || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-jcoder-muted">
                    {unreadMessages?.conversations || 0} {unreadMessages?.conversations === 1 ? 'conversation' : 'conversations'} with unread messages
                  </div>
                </>
              )}
            </div>

            {/* Profile Completeness Card */}
            <div
              className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 md:hover:-translate-y-1 cursor-pointer group"
              onClick={() => router.push(`/${urlUsername}/admin/profile`)}
              style={{
                transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center transform-gpu group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                {loadingStats ? (
                  <div className="h-4 w-16 bg-jcoder-secondary rounded animate-pulse"></div>
                ) : (
                  <span className="text-xs sm:text-sm text-jcoder-muted">Profile</span>
                )}
              </div>
              {loadingStats ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-jcoder-secondary rounded animate-pulse"></div>
                  <div className="h-4 w-full bg-jcoder-secondary rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-jcoder-foreground mb-2">
                    {profileCompleteness?.percentage || 0}%
                  </div>
                  <div className="w-full bg-jcoder-secondary rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${profileCompleteness?.percentage || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs sm:text-sm text-jcoder-muted">
                    {profileCompleteness?.completedFields || 0} of {profileCompleteness?.totalFields || 12} fields completed
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div
            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 md:hover:shadow-2xl md:hover:shadow-jcoder-primary/20 md:hover:-translate-y-1 mb-6 sm:mb-8"
            style={{
              transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : 'none',
            }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => router.push(`/${urlUsername}/admin/applications/new`)}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-jcoder-secondary/50 border border-jcoder rounded-lg hover:border-jcoder-primary hover:bg-jcoder-secondary transition-all duration-200 text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center transform-gpu md:group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black md:group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-jcoder-foreground">New Application</h3>
                  <p className="text-xs sm:text-sm text-jcoder-muted">Create a new portfolio application</p>
                </div>
              </button>

              <button
                onClick={() => router.push(`/${urlUsername}/admin/applications`)}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-jcoder-secondary/50 border border-jcoder rounded-lg hover:border-jcoder-primary hover:bg-jcoder-secondary transition-all duration-200 text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center transform-gpu md:group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-jcoder-foreground">View All Applications</h3>
                  <p className="text-xs sm:text-sm text-jcoder-muted">Browse and manage existing applications</p>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Sections Grid */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-6 px-4">Management Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {adminSections.map((section) => (
                <button
                  key={section.title}
                  onClick={() => router.push(section.href)}
                  className="relative bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-xl sm:rounded-2xl p-6 sm:p-8 text-left transform-gpu transition-all duration-300 md:hover:border-jcoder-primary md:hover:shadow-xl md:hover:shadow-jcoder-primary/20 md:hover:-translate-y-2 cursor-pointer group"
                  style={{
                    transform: windowSize.width >= 768 ? `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 1}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 1}deg) translateZ(0)` : undefined,
                  }}
                >
                  {/* Badge for unread messages */}
                  {section.unreadCount && section.unreadCount > 0 && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-jcoder-blue text-white text-xs font-bold rounded-full shadow-lg shadow-jcoder-blue/50 animate-pulse">
                        {section.unreadCount > 9 ? '9+' : section.unreadCount}
                      </span>
                    </div>
                  )}

                  {/* Completeness badge */}
                  {section.completeness !== undefined && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                        section.completeness >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                        section.completeness >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                        'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}>
                        {section.completeness}%
                      </span>
                    </div>
                  )}

                  <div className={`inline-flex p-3 sm:p-4 rounded-xl bg-gradient-to-br ${section.color} mb-4 sm:mb-6 transform-gpu transition-transform md:group-hover:scale-110`}>
                    <div className="text-white">
                      <div className="w-6 h-6 sm:w-8 sm:h-8">
                        {section.icon}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-2 sm:mb-3">
                    {section.title}
                  </h2>

                  <p className="text-sm sm:text-base text-jcoder-muted leading-relaxed mb-4">
                    {section.description}
                  </p>

                  {/* Stats preview for Applications and Technologies */}
                  {section.stats && (
                    <div className="mt-4 pt-4 border-t border-jcoder/30">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-jcoder-muted">Total:</span>
                        <span className="font-semibold text-jcoder-foreground">{section.stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm mt-1">
                        <span className="text-green-500">Active:</span>
                        <span className="font-semibold text-green-500">{section.stats.active}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-jcoder-primary font-semibold md:group-hover:gap-3 transition-all text-sm sm:text-base">
                    <span>Manage</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer user={user} username={urlUsername} />

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
}
