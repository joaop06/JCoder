"use client";

import Link from 'next/link';
import { ThemeToggle } from './theme';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@/types/enums/role.enum';
import { UsersService } from '@/services/users.service';
import { useEffect, useState, useCallback } from 'react';
import { HealthStatusComponent } from './health/HealthStatus';

interface HeaderProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function Header({
  isAdmin: isAdminProp = false,
  onLogout
}: HeaderProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminProp);

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
    <header className="border-b border-jcoder bg-jcoder-card relative">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          {isAdminView ? (
            // Desktop: Logged in Admin - Logo left, tabs center, profile right
            <div className="grid grid-cols-3 items-center">
              <div className="justify-self-start">
                <Logo />
              </div>

              <nav className="flex items-center justify-center gap-8">
                <Link href="/" className="text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  Applications
                </Link>
                <Link href="/admin" className="text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  Administration
                </Link>
              </nav>

              <div className="justify-self-end">
                <DesktopProfileSection />
              </div>
            </div>
          ) : (
            // Desktop: Not logged in - Logo left, theme toggle right
            <div className="flex items-center justify-between">
              <Logo />
              <ThemeToggle size="sm" />
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {isAdminView ? (
            // Mobile: Logged in Admin - Logo left, Administration center, logout button right
            <div className="flex items-center justify-between">
              <Logo />

              <nav className="flex items-center">
                <Link href="/admin" className="text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  Administration
                </Link>
              </nav>

              <MobileActionButtons />
            </div>
          ) : (
            // Mobile: Not logged in - Logo left, theme toggle right
            <div className="flex items-center justify-between">
              <Logo />
              <ThemeToggle size="sm" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}