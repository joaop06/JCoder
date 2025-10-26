"use client";

import Link from 'next/link';
import { ThemeToggle } from './theme';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@/types/enums/role.enum';
import { UsersService } from '@/services/users.service';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { HealthStatusComponent } from './health/HealthStatus';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Header({
  isAdmin: isAdminProp = false,
  onLogout
}: HeaderProps) {
  const router = useRouter();
  const { scrollToElement } = useSmoothScroll();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminProp);
  const [activeSection, setActiveSection] = useState('about');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setIsClient(true);
    try {
      const user = UsersService.getUserStorage?.();
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      setIsAdmin((user?.role === RoleEnum.Admin) || isAdminProp);
      setIsLoggedIn(Boolean(user && token));
    } catch {
      setIsLoggedIn(false);
      setIsAdmin(isAdminProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // Check if we're on application detail page
  const isApplicationDetailPage = useMemo(() => {
    return currentPath.startsWith('/applications/') && currentPath !== '/applications';
  }, [currentPath]);

  // Check if we're on admin pages
  const isAdminPage = useMemo(() => {
    return currentPath.startsWith('/admin');
  }, [currentPath]);

  // Scroll detection for active section
  useEffect(() => {
    if (!isClient || isLoggedIn) return;

    const handleScroll = () => {
      const sections = ['about', 'projects', 'tech-stack', 'contact'];
      const scrollPosition = window.scrollY + 120; // Account for fixed header
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // Check if user is near the bottom of the page (within 200px)
      const isNearBottom = scrollPosition + windowHeight >= documentHeight - 200;

      if (isNearBottom) {
        // If near bottom, activate the last section (contact)
        setActiveSection('contact');
        return;
      }

      // Normal scroll detection for other sections
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient, isLoggedIn]);

  const handleLogout = useCallback(() => {
    try {
      // Clear user data and tokens
      UsersService.clearUserStorage();

      // Reset component state
      setIsLoggedIn(false);
      setIsAdmin(false);

      // Call custom logout handler if provided
      if (onLogout) {
        onLogout();
      }

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if there's an error
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
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  }, [scrollToElement]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileDropdownOpen && !(event.target as Element).closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);


  // Logo component
  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
        <img
          alt="JCoder"
          width={400}
          height={300}
          src="/images/jcoder-logo.png"
        />
      </div>
      <span className="text-xl font-semibold text-jcoder-foreground">JCoder</span>
    </Link>
  );

  // Profile section for desktop
  const DesktopProfileSection = () => (
    <div className="flex items-center gap-3">
      {/* Theme toggle */}
      <ThemeToggle size="sm" />

      {/* Profile dropdown */}
      <div className="relative profile-dropdown-container">
        <button
          type="button"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-jcoder hover:border-jcoder-primary transition-colors"
          aria-label="Profile menu"
          title="Profile menu"
        >
          <img
            src="/images/profile_picture.jpeg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Profile dropdown menu */}
        {isProfileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
            <div className="p-2">
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    router.push('/admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 1-3 0M3.75 6H7.5m0 12v-3a3 3 0 0 1 3-3h3m-6 3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-3m-6 0V9a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3" />
                  </svg>
                  Administration
                </button>
              )}
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/applications');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                Applications
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/technologies');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Technologies
              </button>
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile action buttons (theme toggle + profile dropdown)
  const MobileActionButtons = () => (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <ThemeToggle size="sm" />

      {/* Profile dropdown */}
      <div className="relative profile-dropdown-container">
        <button
          type="button"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-jcoder hover:border-jcoder-primary transition-colors"
          aria-label="Profile menu"
          title="Profile menu"
        >
          <img
            src="/images/profile_picture.jpeg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Profile dropdown menu */}
        {isProfileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
            <div className="p-2">
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/applications');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                Applications
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/technologies');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Technologies
              </button>
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Mobile hamburger menu for non-logged users
  const MobileHamburgerMenu = () => (
    <div className="relative mobile-menu-container">
      {/* Hamburger button */}
      <button
        type="button"
        onClick={toggleMobileMenu}
        className="p-2 rounded-md text-jcoder-muted hover:text-jcoder-foreground hover:bg-jcoder-secondary transition-colors"
        aria-label="Toggle menu"
        title="Toggle menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isMobileMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            {/* Theme toggle at the top */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-jcoder-muted">Theme</span>
              <ThemeToggle size="sm" />
            </div>

            {/* Divider */}
            <div className="border-t border-jcoder"></div>

            {/* Navigation options */}
            <nav className="space-y-2">
              {isAdminPage ? (
                // Admin navigation
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/admin/applications');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentPath.startsWith('/admin/applications')
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Applications
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/admin/profile');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentPath === '/admin/profile'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      router.push('/admin/technologies');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentPath === '/admin/technologies'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Technologies
                  </button>
                </>
              ) : !isApplicationDetailPage ? (
                // Home page navigation
                <>
                  <button
                    onClick={() => handleNavigationClick('about')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'about'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => handleNavigationClick('projects')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'projects'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => handleNavigationClick('tech-stack')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'tech-stack'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Technologies
                  </button>
                  <button
                    onClick={() => handleNavigationClick('contact')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'contact'
                      ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                      : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                      }`}
                  >
                    Contact
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile hamburger menu for logged-in users (includes Admin option and profile)
  const MobileLoggedInMenu = () => (
    <div className="flex items-center gap-2">
      {/* Hamburger menu button - Only show when NOT in admin pages */}
      {!isAdminPage && (
        <div className="relative mobile-menu-container">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-jcoder-muted hover:text-jcoder-foreground hover:bg-jcoder-secondary transition-colors"
            aria-label="Toggle menu"
            title="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isMobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
              <div className="p-4 space-y-4">
                {/* Theme toggle at the top */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-jcoder-muted">Theme</span>
                  <ThemeToggle size="sm" />
                </div>

                {/* Divider */}
                <div className="border-t border-jcoder"></div>

                {/* Navigation options */}
                <nav className="space-y-2">
                  {isApplicationDetailPage ? (
                    // Application detail page navigation - Empty for now
                    <></>
                  ) : (
                    // Home page navigation
                    <>
                      <button
                        onClick={() => handleNavigationClick('about')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'about'
                          ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                          : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                          }`}
                      >
                        About
                      </button>
                      <button
                        onClick={() => handleNavigationClick('projects')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'projects'
                          ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                          : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                          }`}
                      >
                        Projects
                      </button>
                      <button
                        onClick={() => handleNavigationClick('tech-stack')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'tech-stack'
                          ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                          : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                          }`}
                      >
                        Technologies
                      </button>
                      <button
                        onClick={() => handleNavigationClick('contact')}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${activeSection === 'contact'
                          ? 'text-blue-600 dark:text-jcoder-primary font-medium bg-blue-50 dark:bg-jcoder-secondary'
                          : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary hover:bg-gray-50 dark:hover:bg-jcoder-secondary'
                          }`}
                      >
                        Contact
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profile dropdown */}
      <div className="relative profile-dropdown-container">
        <button
          type="button"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="w-8 h-8 rounded-full overflow-hidden border-2 border-jcoder hover:border-jcoder-primary transition-colors"
          aria-label="Profile menu"
          title="Profile menu"
        >
          <img
            src="/images/profile_picture.jpeg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>

        {/* Profile dropdown menu */}
        {isProfileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-jcoder-card border border-jcoder rounded-lg shadow-lg z-50">
            <div className="p-2">
              {/* Theme toggle - Only show in admin pages on mobile */}
              {isAdminPage && (
                <>
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-jcoder-muted">Theme</span>
                    <ThemeToggle size="sm" />
                  </div>
                  <div className="border-t border-jcoder my-2"></div>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    router.push('/admin');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 1-3 0M3.75 6H7.5m0 12v-3a3 3 0 0 1 3-3h3m-6 3a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3v-3m-6 0V9a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v3" />
                  </svg>
                  Administration
                </button>
              )}
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/applications');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                </svg>
                Applications
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/profile');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  router.push('/admin/technologies');
                }}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 16a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                Technologies
              </button>
              <button
                onClick={handleSignOutClick}
                className="w-full text-left px-3 py-2 rounded-md text-jcoder-muted hover:text-jcoder-primary hover:bg-jcoder-secondary transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isClient) {
    return (
      <header className="border-b border-jcoder bg-jcoder-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Logo />
          </div>
        </div>
      </header>
    );
  }

  const isAdminView = isLoggedIn && isAdmin;

  // Sign out confirmation modal
  const SignOutConfirmationModal = () => (
    showSignOutConfirmation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
    )
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-jcoder bg-jcoder-card">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          {isLoggedIn ? (
            // Desktop: Logged in - Logo left, navigation center, profile right
            <div className="grid grid-cols-3 items-center">
              <div className="justify-self-start">
                <Logo />
              </div>

              <nav className="flex items-center justify-center gap-8">
                {isAdminPage ? (
                  // Admin navigation
                  <>
                    <button
                      onClick={() => router.push('/admin/applications')}
                      className={`transition-colors cursor-pointer ${currentPath.startsWith('/admin/applications')
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Applications
                    </button>
                    <button
                      onClick={() => router.push('/admin/profile')}
                      className={`transition-colors cursor-pointer ${currentPath === '/admin/profile'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => router.push('/admin/technologies')}
                      className={`transition-colors cursor-pointer ${currentPath === '/admin/technologies'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Technologies
                    </button>
                  </>
                ) : isApplicationDetailPage ? (
                  // Application detail page navigation - Empty for now
                  <></>
                ) : (
                  // Home page navigation
                  <>
                    <button
                      onClick={() => handleNavigationClick('about')}
                      className={`transition-colors cursor-pointer ${activeSection === 'about'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      About
                    </button>
                    <button
                      onClick={() => handleNavigationClick('projects')}
                      className={`transition-colors cursor-pointer ${activeSection === 'projects'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => handleNavigationClick('tech-stack')}
                      className={`transition-colors cursor-pointer ${activeSection === 'tech-stack'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Technologies
                    </button>
                    <button
                      onClick={() => handleNavigationClick('contact')}
                      className={`transition-colors cursor-pointer ${activeSection === 'contact'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Contact
                    </button>
                  </>
                )}
              </nav>

              <div className="justify-self-end">
                <DesktopProfileSection />
              </div>
            </div>
          ) : (
            // Desktop: Not logged in - Logo left, navigation center, theme toggle right
            <div className="grid grid-cols-3 items-center">
              <div className="justify-self-start">
                <Logo />
              </div>

              <nav className="flex items-center justify-center gap-8">
                {!isApplicationDetailPage && (
                  <>
                    <button
                      onClick={() => handleNavigationClick('about')}
                      className={`transition-colors cursor-pointer ${activeSection === 'about'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      About
                    </button>
                    <button
                      onClick={() => handleNavigationClick('projects')}
                      className={`transition-colors cursor-pointer ${activeSection === 'projects'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => handleNavigationClick('tech-stack')}
                      className={`transition-colors cursor-pointer ${activeSection === 'tech-stack'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Technologies
                    </button>
                    <button
                      onClick={() => handleNavigationClick('contact')}
                      className={`transition-colors cursor-pointer ${activeSection === 'contact'
                        ? 'text-blue-600 dark:text-jcoder-primary font-medium'
                        : 'text-gray-600 dark:text-jcoder-muted hover:text-blue-500 dark:hover:text-jcoder-primary'
                        }`}
                    >
                      Contact
                    </button>
                  </>
                )}
              </nav>

              <div className="justify-self-end">
                <ThemeToggle size="sm" />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {isLoggedIn ? (
            // Mobile: Logged in - Logo left, hamburger menu right
            <div className="flex items-center justify-between">
              <Logo />
              <MobileLoggedInMenu />
            </div>
          ) : (
            // Mobile: Not logged in - Logo left, hamburger menu right
            <div className="flex items-center justify-between">
              <Logo />
              <MobileHamburgerMenu />
            </div>
          )}
        </div>
      </div>

      {/* Sign out confirmation modal */}
      <SignOutConfirmationModal />
    </header>
  );
}