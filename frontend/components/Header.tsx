"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RoleEnum } from '@/types/enums/role.enum';
import { UsersService } from '@/services/users.service';
import { useEffect, useState, useCallback } from 'react';

interface HeaderProps {
  isAdmin?: boolean;
  showAuth?: boolean;
  onLogout?: () => void;
}

export default function Header({
  showAuth = true,
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
    if (onLogout) {
      onLogout();
    } else {
      try {
        UsersService.clearUserStorage();
      } catch { }
      router.push('/');
    }
  }, [onLogout, router]);

  if (!isClient) {
    return (
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
                <img
                  alt="JCoder"
                  width={400}
                  height={300}
                  src="/images/jcoder-logo.png"
                />
              </div>
              <span className="text-xl font-semibold">JCoder</span>
            </Link>
            {showAuth && (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:opacity-80 transition-opacity"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  const isAdminView = isLoggedIn && isAdmin;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4">
        <div
          className={
            isAdminView ? "grid grid-cols-3 items-center" : "flex items-center justify-between"
          }
        >
          {/* Esquerda: Logo + Nome */}
          <div className={isAdminView ? "justify-self-start" : ""}>
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
                <img
                  alt="JCoder"
                  width={400}
                  height={300}
                  src="/images/jcoder-logo.png"
                />
              </div>
              <span className="text-xl font-semibold">JCoder</span>
            </Link>
          </div>

          {/* Centro: Abas somente para Admins logados */}
          {isAdminView && (
            <nav className="flex items-center justify-center gap-8">
              <Link href="/" className="text-gray-700 hover:text-black transition-colors">
                Applications
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-black transition-colors">
                Administration
              </Link>
            </nav>
          )}

          {/* Direita: Auth area */}
          {showAuth && (
            <div className={isAdminView ? "justify-self-end" : ""}>
              {!isAdminView ? (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:opacity-80 transition-opacity"
                >
                  Sign in
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Ícone de perfil */}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                    {/* SVG de usuário */}
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
                  <span className="px-3 py-1 rounded-full bg-black text-white text-xs font-medium">
                    Admin
                  </span>

                  {/* Sign out button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-800 hover:bg-gray-50"
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
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}