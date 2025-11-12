'use client';

import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme';
import { useToast } from '@/components/toast/ToastContext';
import WebGLBackground from '@/components/webgl/WebGLBackground';
import Hero3D from '@/components/webgl/Hero3D';
import type { CreateUserDto } from '@/types/api/auth/create-user.dto';
import FloatingParticles3D from '@/components/webgl/FloatingParticles3D';
import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [isVisible, setIsVisible] = useState(false);

  // Refs for mouse position throttling
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  // Step 1: Username
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Step 2: Email verification
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean;
    available: boolean | null;
  }>({ checking: false, available: null });
  const [verificationCode, setVerificationCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const emailDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastVerifiedCodeRef = useRef<string>('');

  // Step 3: Password and About Me
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [occupation, setOccupation] = useState('');
  const [description, setDescription] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const steps = [
    { number: 1, title: 'Choose your username', description: 'This will be your unique identifier' },
    { number: 2, title: 'Verify your email', description: 'We\'ll send a verification code' },
    { number: 3, title: 'Complete your profile', description: 'Set your password and basic information' },
  ];

  // Real-time username availability check
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const usernameTrimmed = username.trim();

    if (!usernameTrimmed || usernameTrimmed.length < 3) {
      setUsernameStatus({ checking: false, available: null });
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(usernameTrimmed)) {
      setUsernameStatus({ checking: false, available: null });
      return;
    }

    setUsernameStatus({ checking: true, available: null });
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await PortfolioViewService.checkUsernameAvailability(usernameTrimmed);
        setUsernameStatus({ checking: false, available: result.available });

        if (!result.available) {
          setErrors(prev => ({
            ...prev,
            username: 'This username is already in use. Please choose another one.',
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.username;
            return newErrors;
          });
        }
      } catch (error) {
        setUsernameStatus({ checking: false, available: null });
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [username]);

  // Real-time email availability check
  useEffect(() => {
    if (emailDebounceTimeoutRef.current) {
      clearTimeout(emailDebounceTimeoutRef.current);
    }

    const emailTrimmed = email.trim();

    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailStatus({ checking: false, available: null });
      return;
    }

    setEmailStatus({ checking: true, available: null });
    emailDebounceTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await PortfolioViewService.checkEmailAvailability(emailTrimmed);
        setEmailStatus({ checking: false, available: result.available });

        if (!result.available) {
          setErrors(prev => ({
            ...prev,
            email: 'This email is already in use. Please use another email.',
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      } catch (error) {
        setEmailStatus({ checking: false, available: null });
      }
    }, 500);

    return () => {
      if (emailDebounceTimeoutRef.current) {
        clearTimeout(emailDebounceTimeoutRef.current);
      }
    };
  }, [email]);

  const handleNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!username || username.length < 3) {
        setErrors({ username: 'Username must be at least 3 characters' });
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        setErrors({ username: 'Username can only contain letters, numbers, underscores and hyphens' });
        return;
      }
      if (usernameStatus.available !== true) {
        setErrors({ username: 'Please choose an available username' });
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors({ email: 'Please enter a valid email' });
        return;
      }
      if (emailStatus.available !== true) {
        setErrors({ email: 'Please use an available email' });
        return;
      }
      if (!isEmailVerified) {
        setErrors({ email: 'Please verify your email before continuing' });
        return;
      }
      setErrors({});
      setCurrentStep(3);
    }
  }, [currentStep, username, usernameStatus, email, emailStatus, isEmailVerified]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
      setErrors({});
    }
  }, [currentStep]);

  const handleSendVerificationCode = useCallback(async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    if (emailStatus.available !== true) {
      setErrors({ email: 'This email is already in use. Please use another email.' });
      return;
    }

    setIsSendingCode(true);
    setErrors({});

    try {
      await PortfolioViewService.sendEmailVerification(email);
      setCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      lastVerifiedCodeRef.current = '';
      toast.success('Verification code sent! Check your inbox.');
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send verification code. Please try again.';
      setErrors({ email: apiMessage });
      toast.error(apiMessage);
    } finally {
      setIsSendingCode(false);
    }
  }, [email, emailStatus, toast]);

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    setIsVerifyingCode(true);
    setErrors({});

    try {
      const result = await PortfolioViewService.verifyEmailCode(email, verificationCode);
      if (result.verified) {
        setIsEmailVerified(true);
        toast.success('Email verified successfully!');
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired code. Please try again.';
      setErrors({ code: apiMessage });
      toast.error(apiMessage);
    } finally {
      setIsVerifyingCode(false);
    }
  }, [email, verificationCode, toast]);

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (
      verificationCode.length === 6 &&
      codeSent &&
      !isEmailVerified &&
      !isVerifyingCode &&
      !isLoading &&
      verificationCode !== lastVerifiedCodeRef.current
    ) {
      lastVerifiedCodeRef.current = verificationCode;
      handleVerifyCode();
    }
    // Reset ref when code is cleared or email changes
    if (verificationCode.length === 0) {
      lastVerifiedCodeRef.current = '';
    }
  }, [verificationCode, codeSent, isEmailVerified, isVerifyingCode, isLoading, handleVerifyCode]);

  // Reactive password requirements validation
  useEffect(() => {
    if (!password) {
      setPasswordRequirements({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      return;
    }

    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  }, [password]);

  // Reactive password match validation
  useEffect(() => {
    if (!confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
      return;
    }

    if (password !== confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [password, confirmPassword]);

  // Reactive password requirements validation (error)
  useEffect(() => {
    if (!password) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
      return;
    }

    const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true);

    if (!allRequirementsMet) {
      const missingRequirements: string[] = [];
      if (!passwordRequirements.minLength) missingRequirements.push('minimum 8 characters');
      if (!passwordRequirements.hasUpperCase) missingRequirements.push('one uppercase letter');
      if (!passwordRequirements.hasLowerCase) missingRequirements.push('one lowercase letter');
      if (!passwordRequirements.hasNumber) missingRequirements.push('one number');
      if (!passwordRequirements.hasSpecialChar) missingRequirements.push('one special character');

      setErrors(prev => ({
        ...prev,
        password: `Password must contain: ${missingRequirements.join(', ')}`,
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  }, [password, passwordRequirements]);

  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, string> = {};

    // Check if all password requirements are met
    const allRequirementsMet = Object.values(passwordRequirements).every(req => req === true);
    if (!password || !allRequirementsMet) {
      newErrors.password = 'Password does not meet minimum requirements';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      return;
    }

    setIsLoading(true);

    try {
      const payload: CreateUserDto = {
        username,
        password,
        email,
        occupation: occupation || undefined,
        description: description || undefined,
      };

      await PortfolioViewService.register(payload);

      toast.success('Account created successfully! Please sign in to continue.');
      router.push('/sign-in');
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create account. Please try again.';
      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, confirmPassword, email, occupation, description, router, toast]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden relative">
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
      <header className="border-b border-jcoder bg-jcoder-card/80 backdrop-blur-sm relative z-10 shrink-0">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-2.5 md:py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity">
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
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4 md:py-6 relative z-10 overflow-y-auto md:overflow-y-hidden">
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

        <div className={`w-full max-w-2xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo and Title */}
          <div className="text-center mb-3 sm:mb-4 md:mb-6">
            <div
              className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-jcoder-gradient rounded-full p-0.5 shadow-lg shadow-jcoder-primary/50 mb-2 sm:mb-3 md:mb-4 transform-gpu animate-bounce-slow"
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
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1.5 sm:mb-2 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient px-2">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-jcoder-muted px-2">
              Start building your professional portfolio
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`rounded-full flex items-center justify-center font-bold transition-all duration-300 ${currentStep === step.number
                        ? 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-jcoder-gradient text-black shadow-lg shadow-jcoder-primary/50 scale-110 ring-2 sm:ring-4 ring-jcoder-primary/30'
                        : currentStep > step.number
                          ? 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-500 text-white'
                          : 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-jcoder-secondary text-jcoder-muted border-2 border-jcoder'
                        }`}
                    >
                      {currentStep > step.number ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className={`${currentStep === step.number ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm'}`}>{step.number}</span>
                      )}
                    </div>
                    <div className="mt-1.5 sm:mt-2 text-center px-0.5">
                      <p className={`transition-all duration-300 ${currentStep === step.number
                        ? 'text-xs sm:text-sm md:text-base font-bold text-jcoder-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                        : 'text-[10px] sm:text-xs font-medium text-jcoder-muted'
                        }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-colors duration-300 ${currentStep > step.number ? 'bg-green-500' :
                        currentStep === step.number ? 'bg-jcoder-primary/50' :
                          'bg-jcoder'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div
            className="bg-jcoder-card/90 backdrop-blur-sm border border-jcoder rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-xl shadow-jcoder-primary/10 transition-all duration-300 hover:shadow-2xl hover:shadow-jcoder-primary/20"
          >
            {/* Step 1: Username */}
            {currentStep === 1 && (
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 text-jcoder-foreground">Choose your username</h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-jcoder-muted mb-2 sm:mb-3">
                    This will be your unique identifier on JCoder
                  </p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5 sm:mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="username"
                      type="text"
                      value={username}
                      disabled={isLoading}
                      placeholder="johndoe"
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.username;
                          return newErrors;
                        });
                      }}
                      className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 pr-8 sm:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50 text-xs sm:text-sm ${errors.username ? 'border-red-400' :
                        usernameStatus.available === true ? 'border-green-400' :
                          usernameStatus.available === false ? 'border-red-400' :
                            'border-jcoder'
                        }`}
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                        {usernameStatus.checking ? (
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : usernameStatus.available === true ? (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : usernameStatus.available === false ? (
                          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.username}</p>
                  )}
                  {!errors.username && usernameStatus.available === true && username.length >= 3 && (
                    <p className="mt-1 text-xs sm:text-sm text-green-400">Username available!</p>
                  )}
                  <p className="mt-1 text-[10px] sm:text-xs text-jcoder-muted">
                    Minimum 3 characters. Only letters, numbers, underscores and hyphens.
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={isLoading || usernameStatus.available !== true}
                  className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 mt-3 sm:mt-4 md:mt-5 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold group text-xs sm:text-sm md:text-base"
                >
                  Continue
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 2 && (
              <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 text-jcoder-foreground">Verify your email</h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-jcoder-muted mb-2 sm:mb-3">
                    We'll send a verification code to your email
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5 sm:mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="relative flex-1">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled={isLoading || isEmailVerified}
                        placeholder="your@email.com"
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setCodeSent(false);
                          setIsEmailVerified(false);
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.email;
                            return newErrors;
                          });
                        }}
                        className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 pr-8 sm:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted transition-all duration-200 hover:border-jcoder-primary/50 text-xs sm:text-sm ${errors.email ? 'border-red-400' :
                          emailStatus.available === true ? 'border-green-400' :
                            emailStatus.available === false ? 'border-red-400' :
                              isEmailVerified ? 'border-green-400' :
                                'border-jcoder'
                          }`}
                      />
                      {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
                          {emailStatus.checking ? (
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : emailStatus.available === true ? (
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : emailStatus.available === false ? (
                            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={isLoading || isSendingCode || isEmailVerified || !email || emailStatus.available !== true}
                      className="px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-jcoder-foreground font-medium whitespace-nowrap text-[10px] sm:text-xs md:text-sm lg:text-base"
                    >
                      {isSendingCode ? (
                        <span className="flex items-center gap-1 sm:gap-2">
                          <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="hidden sm:inline">Sending...</span>
                        </span>
                      ) : codeSent ? 'Resend' : 'Send'}
                    </button>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.email}</p>
                  )}
                  {!errors.email && emailStatus.available === true && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="mt-1 text-xs sm:text-sm text-green-400">Email available!</p>
                  )}
                  {isEmailVerified && (
                    <p className="mt-1 text-xs sm:text-sm text-green-400">Email verified successfully!</p>
                  )}
                </div>

                {codeSent && !isEmailVerified && (
                  <div>
                    <label htmlFor="code" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1.5 sm:mb-2">
                      Verification code <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-1.5 sm:gap-2">
                      <input
                        id="code"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={verificationCode}
                        disabled={isLoading || isVerifyingCode}
                        placeholder="000000"
                        maxLength={6}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, '');
                          setVerificationCode(numericValue);
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.code;
                            return newErrors;
                          });
                        }}
                        onKeyDown={(e) => {
                          // Prevent non-numeric keys (except backspace, delete, tab, escape, enter)
                          if (!/[0-9]/.test(e.key) &&
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                          }
                        }}
                        className={`flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted text-center text-lg sm:text-xl md:text-2xl tracking-widest ${errors.code ? 'border-red-400' : 'border-jcoder'
                          }`}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={isLoading || isVerifyingCode || verificationCode.length !== 6}
                        className="px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap text-[10px] sm:text-xs md:text-sm lg:text-base"
                      >
                        {isVerifyingCode ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {errors.code && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.code}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-jcoder-foreground text-xs sm:text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isLoading || !isEmailVerified}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold group text-xs sm:text-sm md:text-base"
                  >
                    Continue
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password and About Me */}
            {currentStep === 3 && (
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold mb-0.5 sm:mb-1 text-jcoder-foreground">Complete your profile</h2>
                  <p className="text-[10px] sm:text-xs md:text-sm text-jcoder-muted mb-2 sm:mb-3">
                    Set your password and basic information (optional)
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1 sm:mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      disabled={isLoading}
                      placeholder="••••••••"
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 pr-8 sm:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted text-xs sm:text-sm transition-colors ${errors.password
                        ? 'border-red-400'
                        : password && Object.values(passwordRequirements).every(req => req === true)
                          ? 'border-green-400'
                          : 'border-jcoder'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-jcoder-muted hover:text-jcoder-foreground transition-colors disabled:opacity-50"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password requirements */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <svg
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${passwordRequirements.minLength ? 'text-green-400' : 'text-jcoder-muted'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordRequirements.minLength ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={passwordRequirements.minLength ? 'text-green-400' : 'text-jcoder-muted'}>
                          Minimum 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <svg
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-jcoder-muted'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordRequirements.hasUpperCase ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={passwordRequirements.hasUpperCase ? 'text-green-400' : 'text-jcoder-muted'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <svg
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${passwordRequirements.hasLowerCase ? 'text-green-400' : 'text-jcoder-muted'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordRequirements.hasLowerCase ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={passwordRequirements.hasLowerCase ? 'text-green-400' : 'text-jcoder-muted'}>
                          One lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <svg
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${passwordRequirements.hasNumber ? 'text-green-400' : 'text-jcoder-muted'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordRequirements.hasNumber ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={passwordRequirements.hasNumber ? 'text-green-400' : 'text-jcoder-muted'}>
                          One number
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                        <svg
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${passwordRequirements.hasSpecialChar ? 'text-green-400' : 'text-jcoder-muted'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {passwordRequirements.hasSpecialChar ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          )}
                        </svg>
                        <span className={passwordRequirements.hasSpecialChar ? 'text-green-400' : 'text-jcoder-muted'}>
                          One special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.password}</p>
                  )}
                  {password && !errors.password && Object.values(passwordRequirements).every(req => req === true) && (
                    <p className="mt-1 text-xs sm:text-sm text-green-400">Valid password!</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1 sm:mb-1.5">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      disabled={isLoading}
                      placeholder="••••••••"
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                      }}
                      className={`w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 pr-8 sm:pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted text-xs sm:text-sm transition-colors ${errors.confirmPassword
                        ? 'border-red-400'
                        : confirmPassword && password === confirmPassword
                          ? 'border-green-400'
                          : 'border-jcoder'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-jcoder-muted hover:text-jcoder-foreground transition-colors disabled:opacity-50"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                  {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
                    <p className="mt-1 text-xs sm:text-sm text-green-400">Passwords match!</p>
                  )}
                </div>

                <div className="pt-2 sm:pt-3 border-t border-jcoder">
                  <h3 className="text-xs sm:text-sm font-semibold text-jcoder-foreground mb-1.5 sm:mb-2 md:mb-3">About you (optional)</h3>

                  <div className="mb-1.5 sm:mb-2 md:mb-3">
                    <label htmlFor="occupation" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1 sm:mb-1.5">
                      Position / Title
                    </label>
                    <input
                      id="occupation"
                      type="text"
                      value={occupation}
                      disabled={isLoading}
                      placeholder="Ex: Full Stack Developer"
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-jcoder-muted mb-1 sm:mb-1.5">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      disabled={isLoading}
                      placeholder="Tell us a bit about yourself, your experience and passions..."
                      rows={2}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-2.5 sm:px-3 md:px-4 py-2 sm:py-2 md:py-2.5 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted resize-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-jcoder-foreground text-xs sm:text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold group text-xs sm:text-sm md:text-base"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs sm:text-sm md:text-base">Creating...</span>
                      </span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-2 sm:mt-3 md:mt-4 px-2">
            <p className="text-[10px] sm:text-xs md:text-sm text-jcoder-muted">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-jcoder-primary hover:text-jcoder-accent transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
            <Link
              href="/"
              className="text-[10px] sm:text-xs md:text-sm text-jcoder-muted hover:text-jcoder-primary transition-all duration-200 inline-flex items-center gap-1 hover:gap-2 mt-1.5 sm:mt-2 md:mt-3 group"
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
        @media (min-width: 768px) {
          main {
            overflow-y: hidden !important;
          }
        }
      `}</style>
    </div>
  );
}
