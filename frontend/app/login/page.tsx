'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import type { SignInResponseDto } from '@/types/api/auth/sign-in.dto';
import { AuthService } from '@/services/administration-by-user/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data: SignInResponseDto = await AuthService.signIn({ username, password });

      const user = data.user;
      const accessToken = data.accessToken;

      if (!accessToken) {
        throw new Error('Access token not found in response.');
      }

      // Auth persistence on the client
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirects to admin
      toast.success('Sign in successful!');
      router.push('/admin');
    } catch (err: any) {
      // Friendly error handling
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to log in. Please check your credentials and try again.';
      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, router, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-jcoder bg-jcoder-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center">
                <LazyImage
                  src="/images/jcoder-logo.png"
                  alt="JCoder"
                  fallback="JC"
                  className="object-contain"
                  size="custom"
                  width="w-full"
                  height="h-full"
                />
              </div>
              <span className="text-xl font-semibold text-jcoder-foreground">JCoder</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-lg mb-4">
              <LazyImage
                src="/images/jcoder-logo.png"
                alt="JCoder"
                fallback="JC"
                className="object-contain"
                size="custom"
                width="w-full"
                height="h-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-jcoder-foreground mb-2">
              Log in to your account
            </h1>
            <p className="text-jcoder-muted">
              Access the administrative panel
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-jcoder-card border border-jcoder rounded-lg p-8">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold mb-1 text-jcoder-foreground">Sign in</h2>
              <p className="text-sm text-jcoder-muted">
                Enter your credentials to access the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Username
                </label>
                <input
                  required
                  id="username"
                  type="text"
                  value={username}
                  disabled={isLoading}
                  placeholder="johndoe"
                  onChange={handleUsernameChange}
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Password
                </label>
                <input
                  required
                  id="password"
                  type="password"
                  value={password}
                  disabled={isLoading}
                  placeholder="••••••••"
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <span>Entering...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to portfolio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
