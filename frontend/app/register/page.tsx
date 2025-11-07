'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { CreateUserDto } from '@/types/api/auth/create-user.dto';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

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

  // Step 3: Password and About Me
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [occupation, setOccupation] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { number: 1, title: 'Escolha seu username', description: 'Este será seu identificador único' },
    { number: 2, title: 'Verifique seu email', description: 'Enviaremos um código de verificação' },
    { number: 3, title: 'Complete seu perfil', description: 'Defina sua senha e informações básicas' },
  ];

  // Verificação em tempo real da disponibilidade do username
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
            username: 'Este username já está em uso. Por favor, escolha outro.',
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

  // Verificação em tempo real da disponibilidade do email
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
            email: 'Este email já está em uso. Por favor, use outro email.',
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
        setErrors({ username: 'Username deve ter pelo menos 3 caracteres' });
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        setErrors({ username: 'Username pode conter apenas letras, números, underscores e hífens' });
        return;
      }
      if (usernameStatus.available !== true) {
        setErrors({ username: 'Por favor, escolha um username disponível' });
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors({ email: 'Por favor, insira um email válido' });
        return;
      }
      if (emailStatus.available !== true) {
        setErrors({ email: 'Por favor, use um email disponível' });
        return;
      }
      if (!isEmailVerified) {
        setErrors({ email: 'Por favor, verifique seu email antes de continuar' });
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
      setErrors({ email: 'Por favor, insira um email válido' });
      return;
    }

    if (emailStatus.available !== true) {
      setErrors({ email: 'Este email já está em uso. Por favor, use outro email.' });
      return;
    }

    setIsSendingCode(true);
    setErrors({});

    try {
      await PortfolioViewService.sendEmailVerification(email);
      setCodeSent(true);
      setIsEmailVerified(false);
      setVerificationCode('');
      toast.success('Código de verificação enviado! Verifique sua caixa de entrada.');
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao enviar código de verificação. Tente novamente.';
      setErrors({ email: apiMessage });
      toast.error(apiMessage);
    } finally {
      setIsSendingCode(false);
    }
  }, [email, emailStatus, toast]);

  const handleVerifyCode = useCallback(async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ code: 'Por favor, insira o código de 6 dígitos' });
      return;
    }

    setIsVerifyingCode(true);
    setErrors({});

    try {
      const result = await PortfolioViewService.verifyEmailCode(email, verificationCode);
      if (result.verified) {
        setIsEmailVerified(true);
        toast.success('Email verificado com sucesso!');
      }
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Código inválido ou expirado. Tente novamente.';
      setErrors({ code: apiMessage });
      toast.error(apiMessage);
    } finally {
      setIsVerifyingCode(false);
    }
  }, [email, verificationCode, toast]);

  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor, confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

      toast.success('Conta criada com sucesso! Faça login para continuar.');
      router.push('/sign-in');
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Falha ao criar conta. Tente novamente.';
      toast.error(apiMessage);
    } finally {
      setIsLoading(false);
    }
  }, [username, password, confirmPassword, email, occupation, description, router, toast]);

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
        <div className="w-full max-w-2xl">
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
              Crie sua conta
            </h1>
            <p className="text-jcoder-muted">
              Comece a construir seu portfólio profissional
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep === step.number
                          ? 'bg-jcoder-primary text-black'
                          : currentStep > step.number
                            ? 'bg-green-500 text-white'
                            : 'bg-jcoder-secondary text-jcoder-muted border-2 border-jcoder'
                        }`}
                    >
                      {currentStep > step.number ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-medium ${currentStep === step.number ? 'text-jcoder-foreground' : 'text-jcoder-muted'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${currentStep > step.number ? 'bg-green-500' : 'bg-jcoder'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-jcoder-card border border-jcoder rounded-lg p-8">
            {/* Step 1: Username */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-jcoder-foreground">Escolha seu username</h2>
                  <p className="text-sm text-jcoder-muted mb-4">
                    Este será seu identificador único no JCoder
                  </p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-jcoder-muted mb-2">
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
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.username ? 'border-red-400' :
                          usernameStatus.available === true ? 'border-green-400' :
                            usernameStatus.available === false ? 'border-red-400' :
                              'border-jcoder'
                        }`}
                    />
                    {username.length >= 3 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameStatus.checking ? (
                          <svg className="animate-spin h-5 w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : usernameStatus.available === true ? (
                          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : usernameStatus.available === false ? (
                          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                  )}
                  {!errors.username && usernameStatus.available === true && username.length >= 3 && (
                    <p className="mt-1 text-sm text-green-400">Username disponível!</p>
                  )}
                  <p className="mt-1 text-xs text-jcoder-muted">
                    Mínimo de 3 caracteres. Apenas letras, números, underscores e hífens.
                  </p>
                </div>

                <button
                  onClick={handleNextStep}
                  disabled={isLoading || usernameStatus.available !== true}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continuar
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Email Verification */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-jcoder-foreground">Verifique seu email</h2>
                  <p className="text-sm text-jcoder-muted mb-4">
                    Enviaremos um código de verificação para seu email
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-jcoder-muted mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled={isLoading || isEmailVerified}
                        placeholder="seu@email.com"
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
                        className={`w-full px-4 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.email ? 'border-red-400' :
                            emailStatus.available === true ? 'border-green-400' :
                              emailStatus.available === false ? 'border-red-400' :
                                isEmailVerified ? 'border-green-400' :
                                  'border-jcoder'
                          }`}
                      />
                      {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailStatus.checking ? (
                            <svg className="animate-spin h-5 w-5 text-jcoder-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : emailStatus.available === true ? (
                            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : emailStatus.available === false ? (
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : null}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSendVerificationCode}
                      disabled={isLoading || isSendingCode || isEmailVerified || !email || emailStatus.available !== true}
                      className="px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-jcoder-foreground font-medium whitespace-nowrap"
                    >
                      {isSendingCode ? 'Enviando...' : codeSent ? 'Reenviar' : 'Enviar código'}
                    </button>
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                  {!errors.email && emailStatus.available === true && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="mt-1 text-sm text-green-400">Email disponível!</p>
                  )}
                  {isEmailVerified && (
                    <p className="mt-1 text-sm text-green-400">Email verificado com sucesso!</p>
                  )}
                </div>

                {codeSent && !isEmailVerified && (
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-jcoder-muted mb-2">
                      Código de verificação <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="code"
                        type="text"
                        value={verificationCode}
                        disabled={isLoading || isVerifyingCode}
                        placeholder="000000"
                        maxLength={6}
                        onChange={(e) => {
                          setVerificationCode(e.target.value.replace(/\D/g, ''));
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.code;
                            return newErrors;
                          });
                        }}
                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted text-center text-2xl tracking-widest ${errors.code ? 'border-red-400' : 'border-jcoder'
                          }`}
                      />
                      <button
                        onClick={handleVerifyCode}
                        disabled={isLoading || isVerifyingCode || verificationCode.length !== 6}
                        className="px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap"
                      >
                        {isVerifyingCode ? 'Verificando...' : 'Verificar'}
                      </button>
                    </div>
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-400">{errors.code}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-jcoder-foreground"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={isLoading || !isEmailVerified}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Continuar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password and About Me */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-1 text-jcoder-foreground">Complete seu perfil</h2>
                  <p className="text-sm text-jcoder-muted mb-4">
                    Defina sua senha e informações básicas (opcional)
                  </p>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-jcoder-muted mb-2">
                    Senha <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    id="password"
                    type="password"
                    value={password}
                    disabled={isLoading}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.password;
                        return newErrors;
                      });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.password ? 'border-red-400' : 'border-jcoder'
                      }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-jcoder-muted mb-2">
                    Confirmar Senha <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    disabled={isLoading}
                    placeholder="••••••••"
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirmPassword;
                        return newErrors;
                      });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.confirmPassword ? 'border-red-400' : 'border-jcoder'
                      }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-jcoder">
                  <h3 className="text-sm font-semibold text-jcoder-foreground mb-4">Sobre você (opcional)</h3>

                  <div className="mb-4">
                    <label htmlFor="occupation" className="block text-sm font-medium text-jcoder-muted mb-2">
                      Cargo / Título
                    </label>
                    <input
                      id="occupation"
                      type="text"
                      value={occupation}
                      disabled={isLoading}
                      placeholder="Ex: Desenvolvedor Full Stack"
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-jcoder-muted mb-2">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      disabled={isLoading}
                      placeholder="Conte um pouco sobre você, sua experiência e paixões..."
                      rows={4}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg hover:bg-jcoder hover:border-jcoder-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-jcoder-foreground"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isLoading ? (
                      <span>Criando conta...</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Criar Conta
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-jcoder-muted">
              Já tem uma conta?{' '}
              <Link
                href="/sign-in"
                className="text-jcoder-primary hover:text-jcoder-accent transition-colors font-medium"
              >
                Fazer login
              </Link>
            </p>
            <Link
              href="/"
              className="text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors inline-flex items-center gap-1 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
