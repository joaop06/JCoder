'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Hero3D from '@/components/webgl/Hero3D';
import { ThemeToggle } from '@/components/theme';
import { useToast } from '@/components/toast/ToastContext';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import { useState, useCallback, useEffect, Suspense } from 'react';
import type { SignInResponseDto } from '@/types/api/auth/sign-in.dto';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { AuthService } from '@/services/administration-by-user/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  const toast = useToast();

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

      // Redirects to admin with username
      toast.success('Sign in successful!');
      router.push(`/${user.username}/admin`);
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

      {/* Header */}
      <header className="border-b border-jcoder bg-jcoder-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
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

        <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-jcoder-gradient rounded-full p-0.5 shadow-lg shadow-jcoder-primary/50 mb-6 transform-gpu animate-bounce-slow"
              style={{
                transform: `perspective(1000px) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 10}deg) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 10}deg)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center overflow-hidden">
                <div className="w-[90%] h-[90%] flex items-center justify-center">
                  <LazyImage
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    fallback="JC"
                    className="object-contain w-full h-full"
                    size="custom"
                    width="w-full"
                    height="h-full"
                    rounded="rounded-full"
                    rootMargin="200px"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
              Log in to your account
            </h1>
            <p className="text-base md:text-lg text-jcoder-muted">
              Access the administrative panel
            </p>
          </div>

          {/* Login Form */}
          <div
            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-6 md:p-8 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 hover:-translate-y-1"
            style={{
              transform: `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)`,
            }}
          >
            <div className="mb-6 text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-jcoder-foreground">Sign in</h2>
              <p className="text-sm md:text-base text-jcoder-muted">
                Enter your credentials to access the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02]">
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
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50"
                />
              </div>

              <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02] mt-4">
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
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-8 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entering...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-jcoder-muted">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-jcoder-primary hover:text-jcoder-accent transition-all duration-200 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
            <Link
              href="/"
              className="text-sm text-jcoder-muted hover:text-jcoder-primary transition-all duration-200 inline-flex items-center gap-1 hover:gap-2 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>

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
    </div>
  );
};
