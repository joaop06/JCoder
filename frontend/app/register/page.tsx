'use client';

import Link from 'next/link';
import { LazyImage } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { AuthService } from '@/services/administration-by-user/auth.service';
import type { CreateUserDto } from '@/types/api/auth/create-user.dto';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserDto>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    fullName: '',
    githubUrl: '',
    linkedinUrl: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // URL validations (optional but must be valid if provided)
    if (formData.githubUrl && !/^https?:\/\/.+\..+/.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL';
    }
    if (formData.linkedinUrl && !/^https?:\/\/.+\..+/.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, confirmPassword]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare payload - only send non-empty optional fields
      const payload: CreateUserDto = {
        username: formData.username,
        password: formData.password,
      };

      if (formData.email) payload.email = formData.email;
      if (formData.firstName) payload.firstName = formData.firstName;
      if (formData.fullName) payload.fullName = formData.fullName;
      if (formData.githubUrl) payload.githubUrl = formData.githubUrl;
      if (formData.linkedinUrl) payload.linkedinUrl = formData.linkedinUrl;

      await AuthService.register(payload);

      toast.success('Account created successfully! Please log in.');
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
  }, [formData, confirmPassword, validateForm, router, toast]);

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
              Create your account
            </h1>
            <p className="text-jcoder-muted">
              Start building your professional portfolio
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-jcoder-card border border-jcoder rounded-lg p-8">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold mb-1 text-jcoder-foreground">Sign up</h2>
              <p className="text-sm text-jcoder-muted">
                Fill in your information to get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  disabled={isLoading}
                  placeholder="johndoe"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.username ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-jcoder-muted">
                  At least 3 characters. Letters, numbers, underscores, and hyphens only.
                </p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled={isLoading}
                  placeholder="your@email.com"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.email ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-jcoder-muted mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  disabled={isLoading}
                  placeholder="John"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  disabled={isLoading}
                  placeholder="John Doe"
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  disabled={isLoading}
                  placeholder="••••••••"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.password ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-jcoder-muted">
                  At least 8 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-jcoder-muted mb-2">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  disabled={isLoading}
                  placeholder="••••••••"
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.confirmPassword ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* GitHub URL */}
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-jcoder-muted mb-2">
                  GitHub URL
                </label>
                <input
                  id="githubUrl"
                  name="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  disabled={isLoading}
                  placeholder="https://github.com/username"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.githubUrl ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.githubUrl && (
                  <p className="mt-1 text-sm text-red-400">{errors.githubUrl}</p>
                )}
              </div>

              {/* LinkedIn URL */}
              <div>
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-jcoder-muted mb-2">
                  LinkedIn URL
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  disabled={isLoading}
                  placeholder="https://linkedin.com/in/username"
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent disabled:opacity-60 bg-jcoder-secondary text-jcoder-foreground placeholder-jcoder-muted ${errors.linkedinUrl ? 'border-red-400' : 'border-jcoder'
                    }`}
                />
                {errors.linkedinUrl && (
                  <p className="mt-1 text-sm text-red-400">{errors.linkedinUrl}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <span>Creating account...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Create Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-jcoder-muted">
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
              className="text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors inline-flex items-center gap-1 mt-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

