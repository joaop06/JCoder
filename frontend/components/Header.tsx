"use client";

import Link from 'next/link';
import { ThemeToggle } from './theme';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@/types/enums/role.enum';
import { UsersService } from '@/services/users.service';
import { useEffect, useState, useCallback } from 'react';
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
      {/* Health status */}
      <HealthStatusComponent />

      {/* Theme toggle */}
      <ThemeToggle size="sm" />

      {/* Profile icon */}
      <div className="w-8 h-8 rounded-full bg-jcoder-secondary flex items-center justify-center text-jcoder-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" />
        </svg>
      </div>

      {/* Badge Admin */}
      <span className="px-3 py-1 rounded-full bg-jcoder-gradient text-black text-xs font-medium">
        Admin
      </span>

      {/* Sign out button */}
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-jcoder text-sm text-jcoder-muted hover:bg-jcoder-secondary hover:text-jcoder-foreground transition-colors"
        aria-label="Sign out"
        title="Sign out"
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
  );

  // Mobile action buttons (health status + theme toggle + logout)
  const MobileActionButtons = () => (
    <div className="flex items-center gap-2">
      {/* Health status */}
      <HealthStatusComponent />

      {/* Theme toggle */}
      <ThemeToggle size="sm" />

      {/* Logout button */}
      <button
        type="button"
        onClick={handleLogout}
        className="p-2 rounded-md text-jcoder-muted hover:text-jcoder-foreground hover:bg-jcoder-secondary transition-colors"
        aria-label="Sign out"
        title="Sign out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H3" />
        </svg>
      </button>
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
            </nav>
          </div>
        </div>
      )}
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
                <Link href="/" className="text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  Home
                </Link>
                <Link href="/admin" className="text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  Admin
                </Link>
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
            // Mobile: Logged in - Logo left, navigation center, profile right
            <div className="flex items-center justify-between">
              <Logo />

              <nav className="flex items-center gap-4">
                <Link href="/" className="text-jcoder-muted hover:text-jcoder-primary transition-colors text-sm">
                  Home
                </Link>
                <Link href="/admin" className="text-jcoder-muted hover:text-jcoder-primary transition-colors text-sm">
                  Admin
                </Link>
              </nav>

              <MobileActionButtons />
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
    </header>
  );
}