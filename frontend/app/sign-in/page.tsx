'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import Hero3D from '@/components/webgl/Hero3D';
import { ThemeToggle } from '@/components/theme';
import { useToast } from '@/components/toast/ToastContext';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import { useState, useCallback, useEffect, Suspense, useRef } from 'react';
import type { SignInResponseDto } from '@/types/api/auth/sign-in.dto';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { AuthService } from '@/services/administration-by-user/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  // Refs for mouse position throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

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

      {/* Header */}
      <header className="border-b border-jcoder bg-jcoder-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-transparent rounded-lg flex items-center justify-center">
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
              <span className="text-lg sm:text-xl font-semibold text-jcoder-foreground">JCoder</span>
            </Link>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-10 md:py-12 relative z-10">
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
          <div className="text-center mb-6 sm:mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-jcoder-gradient rounded-full p-0.5 shadow-lg shadow-jcoder-primary/50 mb-4 sm:mb-6 transform-gpu animate-bounce-slow"
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient px-2">
              Log in to your account
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-jcoder-muted px-2">
              Access the administrative panel
            </p>
          </div>

          {/* Login Form */}
          <div
            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-xl shadow-jcoder-primary/10 transform-gpu transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20 hover:-translate-y-1"
            style={{
              transform: `perspective(1000px) rotateX(${-(mousePosition.y / windowSize.height - 0.5) * 2}deg) rotateY(${(mousePosition.x / windowSize.width - 0.5) * 2}deg) translateZ(0)`,
            }}
          >
            <div className="mb-4 sm:mb-5 md:mb-6 text-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 text-jcoder-foreground">Sign in</h2>
              <p className="text-xs sm:text-sm md:text-base text-jcoder-muted">
                Enter your credentials to access the system
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02]">
                <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5 sm:mb-2">
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50"
                />
              </div>

              <div className="transform-gpu transition-transform duration-200 hover:scale-[1.02]">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    required
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    disabled={isLoading}
                    placeholder="••••••••"
                    onChange={handlePasswordChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-jcoder-muted hover:text-jcoder-foreground transition-colors disabled:opacity-50 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 mt-6 sm:mt-8 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base transform-gpu hover:scale-105 hover:shadow-lg hover:shadow-jcoder-primary/50 active:scale-95 group cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm sm:text-base">Entering...</span>
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Links */}
          <div className="text-center mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 px-2">
            <p className="text-xs sm:text-sm text-jcoder-muted">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-jcoder-primary hover:text-jcoder-accent transition-all duration-200 font-medium hover:underline cursor-pointer"
              >
                Sign up
              </Link>
            </p>
            <Link
              href="/"
              className="text-xs sm:text-sm text-jcoder-muted hover:text-jcoder-primary transition-all duration-200 inline-flex items-center gap-1 hover:gap-2 group cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
