"use client";

import Link from 'next/link';
import { ThemeToggle } from './theme';
import LazyImage from './ui/LazyImage';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Header({
  isAdmin: isAdminProp = false,
  onLogout
}: HeaderProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { scrollToElement } = useSmoothScroll();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminProp);
  const [activeSection, setActiveSection] = useState('about');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImageTimestamp, setProfileImageTimestamp] = useState(Date.now());
  const profileImageTimestampRef = useRef(Date.now());
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Get username from URL params
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  // Get user session data - updates when profileImageTimestamp changes
  const userSession = useMemo(() => {
    if (!isClient) return null;
    try {
      return UsersService.getUserSession?.() || null;
    } catch {
      return null;
    }
  }, [isClient, isLoggedIn, profileImageTimestamp]);

  // Get profile image URL and fallback initial
  const profileImageData = useMemo(() => {
    if (!isLoggedIn || !userSession?.user) {
      return { imageUrl: null, fallback: 'U' };
    }

    const user = userSession.user;
    const userName = userSession.user.username || username;

    const getInitial = () => {
      if (user.fullName) {
        return user.fullName.charAt(0).toUpperCase();
      }
      if (user.firstName) {
        return user.firstName.charAt(0).toUpperCase();
      }
      if (user.username) {
        return user.username.charAt(0).toUpperCase();
      }
      return 'U';
    };

    if (user.profileImage && user.id && userName) {
      // Add timestamp and profileImage filename to force image reload when profile image is updated
      // This ensures the browser doesn't cache the old image
      const baseUrl = ImagesService.getUserProfileImageUrl(userName, user.id);
      const imageUrl = `${baseUrl}?t=${profileImageTimestamp}&v=${user.profileImage}`;
      return {
        imageUrl,
        fallback: getInitial()
      };
    }

    return {
      imageUrl: null,
      fallback: getInitial()
    };
  }, [isLoggedIn, userSession, username, profileImageTimestamp]);

  // Detect page type
  const pageType = useMemo(() => {
    if (!pathname) return 'home';
    if (pathname === '/') return 'home';
    if (pathname === '/sign-in' || pathname === '/register') return 'auth';
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/applications/') && !pathname.endsWith('/applications')) return 'application-detail';
    if (pathname.match(/^\/[^/]+$/)) return 'portfolio';
    return 'other';
  }, [pathname]);

  // Check if we're on application detail page
  const isApplicationDetailPage = useMemo(() => {
    return pathname?.includes('/applications/') && !pathname.endsWith('/applications');
  }, [pathname]);

  // Helper to get admin route with username
  const getAdminRoute = useCallback((route: string) => {
    if (username) {
      return `/${username}/admin${route}`;
    }
    return `/admin${route}`;
  }, [username]);

  useEffect(() => {
    setIsClient(true);
    try {
      const userSession = UsersService.getUserSession?.();
      const token = typeof window !== 'undefined' ? userSession?.accessToken : null;

      setIsAdmin((!!userSession?.user && !!token) || isAdminProp);
      setIsLoggedIn(Boolean(userSession?.user && token));
      
      // Initialize timestamp from localStorage if available
      const lastUpdate = localStorage.getItem('profileImageUpdated');
      if (lastUpdate) {
        const timestamp = parseInt(lastUpdate, 10);
        setProfileImageTimestamp(timestamp);
        profileImageTimestampRef.current = timestamp;
      }
    } catch {
      setIsLoggedIn(false);
      setIsAdmin(isAdminProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for profile image updates
  useEffect(() => {
    if (!isClient) return;

    const handleProfileImageUpdate = (timestamp?: number) => {
      // Force re-fetch of user session and update timestamp to bust cache
      const newTimestamp = timestamp || Date.now();
      setProfileImageTimestamp(newTimestamp);
      profileImageTimestampRef.current = newTimestamp;
      
      // Also update logged in state in case user data changed
      try {
        const userSession = UsersService.getUserSession?.();
        const token = typeof window !== 'undefined' ? userSession?.accessToken : null;
        setIsLoggedIn(Boolean(userSession?.user && token));
      } catch {
        // Ignore errors
      }
    };

    // Listen for custom event with detail
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.timestamp) {
        handleProfileImageUpdate(customEvent.detail.timestamp);
      } else {
        handleProfileImageUpdate();
      }
    };
    window.addEventListener('profileImageUpdated', handleCustomEvent);
    
    // Also listen for storage events (in case localStorage is updated directly)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'profileImageUpdated') {
        handleProfileImageUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Poll localStorage for changes (since storage event only fires in other tabs)
    // Use a ref to track the last known timestamp to avoid infinite loops
    const storagePollInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem('profileImageUpdated');
      if (lastUpdate) {
        const timestamp = parseInt(lastUpdate, 10);
        if (timestamp > profileImageTimestampRef.current) {
          handleProfileImageUpdate(timestamp);
        }
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('profileImageUpdated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(storagePollInterval);
    };
  }, [isClient]);

  // Scroll detection for active section
  useEffect(() => {
    if (!isClient || isLoggedIn || pageType !== 'portfolio') return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['about', 'projects', 'tech-stack', 'contact'];
          const scrollPosition = window.scrollY + 100;
          const documentHeight = document.documentElement.scrollHeight;
          const windowHeight = window.innerHeight;

          const isNearBottom = scrollPosition + windowHeight >= documentHeight - 200;

          if (isNearBottom) {
            setActiveSection('contact');
          } else {
            for (let i = sections.length - 1; i >= 0; i--) {
              const element = document.getElementById(sections[i]);
              if (element && element.offsetTop <= scrollPosition) {
                setActiveSection(sections[i]);
                break;
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient, isLoggedIn, pageType]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = useCallback(() => {
    try {
      UsersService.clearUserStorage();
      setIsLoggedIn(false);
      setIsAdmin(false);
      if (onLogout) {
        onLogout();
      }
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      router.push('/');
    }
  }, [onLogout, router]);

  const handleSignOutClick = useCallback(() => {
    setShowSignOutConfirmation(true);
    setIsProfileDropdownOpen(false);
  }, []);

  const handleConfirmSignOut = useCallback(() => {
    setShowSignOutConfirmation(false);
    handleLogout();
  }, [handleLogout]);

  const handleCancelSignOut = useCallback(() => {
    setShowSignOutConfirmation(false);
  }, []);

  const handleNavigationClick = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    scrollToElement(sectionId, 100);
    setIsMobileMenuOpen(false);
  }, [scrollToElement]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Logo component
  const Logo = useCallback(({ href = '/', className = '' }: { href?: string; className?: string }) => (
    <Link href={href} className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <LazyImage
        src="/images/jcoder-logo.png"
        alt="JCoder"
        fallback="JC"
        size="custom"
        width="w-8"
        height="h-8"
        rounded="rounded-lg"
        showSkeleton={false}
      />
      <span className="text-lg font-semibold text-jcoder-foreground">JCoder</span>
    </Link>
  ), []);

  // Portfolio sections
  const portfolioSections = ['about', 'projects', 'tech-stack', 'contact'];

  if (!isClient) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-24"></div>
          </div>
        </div>
      </header>
    );
  }

  // AUTH PAGES (Sign In / Register)
  if (pageType === 'auth') {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>
    );
  }

  // HOME PAGE - LOGGED IN
  if (pageType === 'home' && isLoggedIn) {
    const loggedInUsername = userSession?.user?.username || username;

    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16 gap-2 sm:gap-3">
            {/* Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle size="sm" />
              <Link
                href={loggedInUsername ? `/${loggedInUsername}` : '/'}
                className="px-4 py-2 text-sm text-jcoder-muted hover:text-jcoder-foreground border border-jcoder/50 hover:border-jcoder/70 rounded-lg transition-all duration-300"
              >
                Portfolio
              </Link>
              <Link
                href={loggedInUsername ? `/${loggedInUsername}/admin` : '/admin'}
                className="px-4 py-2 text-sm text-jcoder-foreground hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary/70 rounded-lg transition-all duration-300"
              >
                Admin
              </Link>
            </div>
            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Link
                href={loggedInUsername ? `/${loggedInUsername}` : '/'}
                className="px-3 py-1.5 text-xs sm:text-sm text-jcoder-muted hover:text-jcoder-foreground border border-jcoder/50 hover:border-jcoder/70 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Portfolio
              </Link>
              <Link
                href={loggedInUsername ? `/${loggedInUsername}/admin` : '/admin'}
                className="px-3 py-1.5 text-xs sm:text-sm text-jcoder-foreground hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary/70 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // HOME PAGE - NOT LOGGED IN
  if (pageType === 'home' && !isLoggedIn) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16 gap-2 sm:gap-3">
            {/* Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle size="sm" />
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-jcoder-muted hover:text-jcoder-foreground border border-jcoder/50 hover:border-jcoder/70 rounded-lg transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm text-jcoder-foreground hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary/70 rounded-lg transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
            {/* Mobile */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle size="sm" />
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-xs sm:text-sm text-jcoder-muted hover:text-jcoder-foreground border border-jcoder/50 hover:border-jcoder/70 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 text-xs sm:text-sm text-jcoder-foreground hover:text-jcoder-primary border border-jcoder/50 hover:border-jcoder-primary/70 rounded-lg transition-all duration-300 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // PORTFOLIO PAGE - LOGGED IN
  if ((pageType === 'portfolio' || pageType === 'application-detail') && isLoggedIn) {
    const loggedInUsername = userSession?.user?.username || username;
    const isOwnPortfolio = loggedInUsername === username;

    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Logo href="/" />

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {!isApplicationDetailPage && portfolioSections.map((section) => {
                  const isActive = activeSection === section;
                  return (
                    <button
                      key={section}
                      onClick={() => handleNavigationClick(section)}
                      className={`group relative px-4 py-2 text-sm font-semibold capitalize transition-colors duration-300 ${isActive
                        ? 'text-jcoder-primary'
                        : 'text-jcoder-foreground hover:text-jcoder-primary'
                        }`}
                    >
                      <span className="relative z-10">
                        {section === 'tech-stack' ? 'Technologies' : section}
                      </span>
                      {/* Barra inferior - sempre visível quando ativa, cresce no hover quando inativa */}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-jcoder-primary origin-left transition-all duration-500 ease-out ${isActive
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
                          }`}
                      ></span>
                    </button>
                  );
                })}
              </nav>

              {/* Right side - Desktop: Profile menu, Mobile: Theme toggle and Unified Menu */}
              <div className="flex items-center gap-3">
                {/* Desktop - Theme Toggle and Profile Menu */}
                <div className="hidden md:flex items-center gap-3">
                  <ThemeToggle size="sm" />
                  {isOwnPortfolio && (
                    <div className="relative" ref={profileDropdownRef}>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="w-8 h-8 rounded-full overflow-hidden border border-jcoder hover:border-jcoder-primary transition-colors flex items-center justify-center bg-jcoder-secondary"
                        aria-label="Profile menu"
                      >
                        {profileImageData.imageUrl ? (
                          <LazyImage
                            key={`profile-${userSession?.user?.profileImage || 'none'}-${profileImageTimestamp}`}
                            src={profileImageData.imageUrl}
                            alt="Profile"
                            fallback={profileImageData.fallback}
                            size="custom"
                            width="w-full"
                            height="h-full"
                            rounded="rounded-full"
                            objectFit="object-cover"
                            showSkeleton={false}
                            rootMargin="0px"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-jcoder-foreground">
                            {profileImageData.fallback}
                          </span>
                        )}
                      </button>

                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
                          <div className="p-2">
                            <Link
                              href={getAdminRoute('/profile')}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                            >
                              Profile
                            </Link>
                            <Link
                              href={getAdminRoute('/applications')}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                            >
                              Applications
                            </Link>
                            <Link
                              href={getAdminRoute('/technologies')}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                            >
                              Technologies
                            </Link>
                            <Link
                              href={getAdminRoute('/messages')}
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                            >
                              Messages
                            </Link>
                            <div className="border-t border-jcoder my-1"></div>
                            <button
                              onClick={handleSignOutClick}
                              className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                            >
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile - Theme Toggle and Unified Menu with User Photo */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle size="sm" />
                  <div className="relative" ref={mobileMenuRef}>
                    <button
                      onClick={toggleMobileMenu}
                      className="w-8 h-8 rounded-full overflow-hidden border border-jcoder hover:border-jcoder-primary transition-colors flex items-center justify-center bg-jcoder-secondary"
                      aria-label="Menu"
                    >
                      {profileImageData.imageUrl ? (
                        <LazyImage
                          src={profileImageData.imageUrl}
                          alt="Menu"
                          fallback={profileImageData.fallback}
                          size="custom"
                          width="w-full"
                          height="h-full"
                          rounded="rounded-full"
                          objectFit="object-cover"
                          showSkeleton={false}
                          rootMargin="0px"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-jcoder-foreground">
                          {profileImageData.fallback}
                        </span>
                      )}
                    </button>
                    {isMobileMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-jcoder-card backdrop-blur-lg border border-jcoder rounded-lg shadow-2xl z-50">
                        <div className="p-2">
                          {/* Seção Superior - Abas do Portfólio */}
                          {!isApplicationDetailPage && portfolioSections.map((section) => (
                            <button
                              key={section}
                              onClick={() => handleNavigationClick(section)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm capitalize transition-colors ${activeSection === section
                                ? 'text-jcoder-primary font-medium bg-jcoder-secondary'
                                : 'text-jcoder-foreground hover:text-jcoder-primary hover:bg-jcoder-secondary'
                                }`}
                            >
                              {section === 'tech-stack' ? 'Technologies' : section}
                            </button>
                          ))}

                          {/* Seção Intermediária - Abas Administrativas (apenas se for o próprio portfólio) */}
                          {isOwnPortfolio && (
                            <>
                              <div className="border-t border-jcoder my-2"></div>
                              <Link
                                href={getAdminRoute('/profile')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                              >
                                Profile
                              </Link>
                              <Link
                                href={getAdminRoute('/applications')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                              >
                                Applications
                              </Link>
                              <Link
                                href={getAdminRoute('/technologies')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                              >
                                Technologies
                              </Link>
                              <Link
                                href={getAdminRoute('/messages')}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                              >
                                Messages
                              </Link>
                            </>
                          )}

                          {/* Seção Inferior - Sign Out */}
                          {isOwnPortfolio && (
                            <>
                              <div className="border-t border-jcoder my-2"></div>
                              <button
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  handleSignOutClick();
                                }}
                                className="w-full text-left px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                              >
                                Sign out
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sign out confirmation modal */}
        {showSignOutConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-jcoder-foreground">Sign Out</h3>
                  <p className="text-sm text-jcoder-muted">Are you sure you want to sign out?</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelSignOut}
                  className="px-4 py-2 rounded-md border border-jcoder text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // PORTFOLIO PAGE - NOT LOGGED IN
  if ((pageType === 'portfolio' || pageType === 'application-detail') && !isLoggedIn) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo href="/" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {!isApplicationDetailPage && portfolioSections.map((section) => {
                const isActive = activeSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => handleNavigationClick(section)}
                    className={`group relative px-4 py-2 text-sm font-semibold capitalize transition-colors duration-300 ${isActive
                      ? 'text-jcoder-primary'
                      : 'text-jcoder-foreground hover:text-jcoder-primary'
                      }`}
                  >
                    <span className="relative z-10">
                      {section === 'tech-stack' ? 'Technologies' : section}
                    </span>
                    {/* Barra inferior - sempre visível quando ativa, cresce no hover quando inativa */}
                    <span
                      className={`absolute bottom-0 left-0 h-0.5 bg-jcoder-primary origin-left transition-all duration-500 ease-out ${isActive
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                        }`}
                    ></span>
                  </button>
                );
              })}
            </nav>

            {/* Right side - Theme toggle and Mobile Menu */}
            <div className="flex items-center gap-3">
              {/* Desktop Theme Toggle */}
              <div className="hidden md:block">
                <ThemeToggle size="sm" />
              </div>

              {/* Mobile - Theme Toggle and Menu */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeToggle size="sm" />
                <div className="relative" ref={mobileMenuRef}>
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-lg text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                    aria-label="Menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {isMobileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-jcoder-card backdrop-blur-lg border border-jcoder rounded-2xl shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 space-y-2">
                        {!isApplicationDetailPage && portfolioSections.map((section) => {
                          const isActive = activeSection === section;
                          return (
                            <button
                              key={section}
                              onClick={() => handleNavigationClick(section)}
                              className={`group relative w-full text-left px-4 py-3 text-sm font-semibold capitalize transition-colors duration-300 ${isActive
                                ? 'text-jcoder-primary'
                                : 'text-jcoder-foreground hover:text-jcoder-primary'
                                }`}
                            >
                              <span className="relative z-10">
                                {section === 'tech-stack' ? 'Technologies' : section}
                              </span>
                              {/* Barra inferior - sempre visível quando ativa, cresce no hover quando inativa */}
                              <span
                                className={`absolute bottom-0 left-0 h-0.5 bg-jcoder-primary origin-left transition-all duration-500 ease-out ${isActive
                                  ? 'w-full'
                                  : 'w-0 group-hover:w-full'
                                  }`}
                              ></span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ADMIN PAGES
  if (pageType === 'admin' && isLoggedIn) {
    const loggedInUsername = userSession?.user?.username || username;
    const adminTabs = [
      { path: '/profile', label: 'Profile' },
      { path: '/applications', label: 'Applications' },
      { path: '/technologies', label: 'Technologies' },
      { path: '/messages', label: 'Messages' },
    ];

    const currentAdminPath = pathname?.split('/admin')[1] || '';

    // Helper function to check if a tab is active
    const isTabActive = (tabPath: string, currentPath: string): boolean => {
      // If current path is empty or '/', no tab should be active (dashboard page)
      if (currentPath === '' || currentPath === '/') {
        return false;
      }
      // Check if current path starts with tab path (handles sub-routes like /applications/new)
      return currentPath.startsWith(tabPath);
    };

    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo - links to portfolio */}
              <Logo href={loggedInUsername ? `/${loggedInUsername}` : '/'} />

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                {adminTabs.map((tab) => {
                  const isActive = isTabActive(tab.path, currentAdminPath);
                  return (
                    <Link
                      key={tab.path}
                      href={getAdminRoute(tab.path)}
                      className={`group relative px-4 py-2 text-sm font-semibold transition-colors duration-300 ${isActive
                        ? 'text-jcoder-primary'
                        : 'text-jcoder-foreground hover:text-jcoder-primary'
                        }`}
                    >
                      <span className="relative z-10">
                        {tab.label}
                      </span>
                      {/* Barra inferior */}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ease-out ${isActive
                          ? 'w-full bg-jcoder-primary'
                          : 'w-0 bg-jcoder-primary group-hover:w-full'
                          }`}
                      ></span>
                    </Link>
                  );
                })}
              </nav>

              {/* Right side - Desktop: Profile menu, Mobile: Theme toggle and Menu */}
              <div className="flex items-center gap-3">
                {/* Desktop - Theme Toggle and Profile Menu */}
                <div className="hidden md:flex items-center gap-3">
                  <ThemeToggle size="sm" />
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="w-8 h-8 rounded-full overflow-hidden border border-jcoder hover:border-jcoder-primary transition-colors flex items-center justify-center bg-jcoder-secondary"
                      aria-label="Profile menu"
                    >
                      {profileImageData.imageUrl ? (
                        <LazyImage
                          src={profileImageData.imageUrl}
                          alt="Profile"
                          fallback={profileImageData.fallback}
                          size="custom"
                          width="w-full"
                          height="h-full"
                          rounded="rounded-full"
                          objectFit="object-cover"
                          showSkeleton={false}
                          rootMargin="0px"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-jcoder-foreground">
                          {profileImageData.fallback}
                        </span>
                      )}
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
                        <div className="p-2">
                          <Link
                            href={getAdminRoute('/profile')}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            href={getAdminRoute('/applications')}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Applications
                          </Link>
                          <Link
                            href={getAdminRoute('/technologies')}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Technologies
                          </Link>
                          <Link
                            href={getAdminRoute('/messages')}
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="block px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Messages
                          </Link>
                          <div className="border-t border-jcoder my-1"></div>
                          <button
                            onClick={handleSignOutClick}
                            className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile - Theme Toggle and Menu with User Photo */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle size="sm" />
                  <div className="relative" ref={mobileMenuRef}>
                    <button
                      onClick={toggleMobileMenu}
                      className="w-8 h-8 rounded-full overflow-hidden border border-jcoder hover:border-jcoder-primary transition-colors flex items-center justify-center bg-jcoder-secondary"
                      aria-label="Menu"
                    >
                      {profileImageData.imageUrl ? (
                        <LazyImage
                          src={profileImageData.imageUrl}
                          alt="Menu"
                          fallback={profileImageData.fallback}
                          size="custom"
                          width="w-full"
                          height="h-full"
                          rounded="rounded-full"
                          objectFit="object-cover"
                          showSkeleton={false}
                          rootMargin="0px"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-jcoder-foreground">
                          {profileImageData.fallback}
                        </span>
                      )}
                    </button>
                    {isMobileMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-jcoder-card backdrop-blur-lg border border-jcoder rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 space-y-2">
                          {adminTabs.map((tab) => {
                            const isActive = isTabActive(tab.path, currentAdminPath);
                            return (
                              <Link
                                key={tab.path}
                                href={getAdminRoute(tab.path)}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`group relative block px-4 py-3 text-sm font-semibold transition-colors duration-300 ${isActive
                                  ? 'text-jcoder-primary'
                                  : 'text-jcoder-foreground hover:text-jcoder-primary'
                                  }`}
                              >
                                <span className="relative z-10">
                                  {tab.label}
                                </span>
                                {/* Barra inferior */}
                                <span
                                  className={`absolute bottom-0 left-0 h-0.5 transition-all duration-500 ease-out ${isActive
                                    ? 'w-full bg-jcoder-primary'
                                    : 'w-0 bg-jcoder-primary group-hover:w-full'
                                    }`}
                                ></span>
                              </Link>
                            );
                          })}
                          <div className="border-t border-jcoder my-1"></div>
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              handleSignOutClick();
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Sign out confirmation modal */}
        {showSignOutConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-5 h-5 text-red-600 dark:text-red-400"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-jcoder-foreground">Sign Out</h3>
                  <p className="text-sm text-jcoder-muted">Are you sure you want to sign out?</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelSignOut}
                  className="px-4 py-2 rounded-md border border-jcoder text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSignOut}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default fallback
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder/50 bg-jcoder-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo href="/" />
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Sign out confirmation modal */}
      {showSignOutConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-jcoder-foreground">Sign Out</h3>
                <p className="text-sm text-jcoder-muted">Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelSignOut}
                className="px-4 py-2 rounded-md border border-jcoder text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
