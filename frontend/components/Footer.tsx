'use client';

import Link from 'next/link';
import LazyImage from './ui/LazyImage';
import { GitHubIcon } from '@/components/theme';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { User } from '@/types/api/users/user.entity';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface FooterProps {
  user?: User | null;
  username?: string;
}

export default function Footer({ user, username }: FooterProps) {
  const { scrollToElement } = useSmoothScroll();
  const isUserFooter = !!user;

  // Get user-specific data or use generic platform defaults
  const displayName = isUserFooter
    ? (user?.fullName || user?.firstName || username || 'JCoder')
    : 'JCoder';
  const displayEmail = isUserFooter ? user?.email : undefined;
  const displayGithubUrl = isUserFooter ? user?.githubUrl : undefined;
  const displayLinkedinUrl = isUserFooter ? user?.linkedinUrl : undefined;
  const displayDescription = isUserFooter
    ? `${displayName}'s professional portfolio`
    : 'Plataforma de gerenciamento de portfólio profissional. Crie, gerencie e compartilhe seu portfólio de forma simples e elegante.';

  return (
    <footer className="border-t border-jcoder bg-jcoder-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                {isUserFooter && user?.profileImage && username ? (
                  <LazyImage
                    src={ImagesService.getUserProfileImageUrl(username, user.id)}
                    alt={displayName}
                    fallback={username.charAt(0).toUpperCase()}
                    size="custom"
                    width="w-8"
                    height="h-8"
                    rounded="rounded-full"
                    showSkeleton={false}
                  />
                ) : (
                  <LazyImage
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    fallback="JC"
                    size="custom"
                    width="w-8"
                    height="h-8"
                    showSkeleton={false}
                  />
                )}
                <span className="text-xl font-semibold text-jcoder-foreground">
                  {isUserFooter ? displayName : 'JCoder'}
                </span>
              </div>
              <p className="text-sm text-jcoder-muted">
                {displayDescription}
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
                {isUserFooter ? (
                  <>
                    <button
                      onClick={() => scrollToElement('about', 80)}
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                    >
                      About Me
                    </button>
                    <button
                      onClick={() => scrollToElement('tech-stack', 80)}
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                    >
                      Technologies
                    </button>
                    <button
                      onClick={() => scrollToElement('projects', 80)}
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                    >
                      Projects
                    </button>
                    <button
                      onClick={() => scrollToElement('contact', 80)}
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                    >
                      Contact
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors"
                    >
                      Cadastrar
                    </Link>
                    <Link
                      href="/sign-in"
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors"
                    >
                      Entrar
                    </Link>
                    <a
                      href="#features"
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById('features');
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                    >
                      Recursos
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="text-center">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Contact</h3>
              <div className="space-y-2">
                {isUserFooter ? (
                  <>
                    {displayEmail && (
                      <a href={`mailto:${displayEmail}`} className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                        <LazyImage
                          src="/images/icons/gmail.png"
                          alt="Gmail"
                          fallback="@"
                          size="custom"
                          width="w-4"
                          height="h-4"
                          showSkeleton={false}
                        />
                        {displayEmail}
                      </a>
                    )}
                    {displayGithubUrl && (
                      <a href={displayGithubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                        <GitHubIcon className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {displayLinkedinUrl && (
                      <a href={displayLinkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                        <LazyImage
                          src="/images/icons/linkedin.png"
                          alt="LinkedIn"
                          fallback="Li"
                          size="custom"
                          width="w-4"
                          height="h-4"
                          showSkeleton={false}
                        />
                        LinkedIn
                      </a>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-jcoder-muted">
                    Entre em contato através do nosso sistema de suporte
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden mb-8">
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {isUserFooter && user?.profileImage && username ? (
                  <LazyImage
                    src={ImagesService.getUserProfileImageUrl(username, user.id)}
                    alt={displayName}
                    fallback={username.charAt(0).toUpperCase()}
                    size="custom"
                    width="w-8"
                    height="h-8"
                    rounded="rounded-full"
                    showSkeleton={false}
                  />
                ) : (
                  <LazyImage
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    fallback="JC"
                    size="custom"
                    width="w-8"
                    height="h-8"
                    showSkeleton={false}
                  />
                )}
                <span className="text-xl font-semibold text-jcoder-foreground">
                  {isUserFooter ? displayName : 'JCoder'}
                </span>
              </div>
              <p className="text-sm text-jcoder-muted">
                {displayDescription}
              </p>
            </div>

            {/* Quick Links and Contact side by side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Quick Links */}
              <div className="text-center">
                <h3 className="font-semibold text-jcoder-foreground mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {isUserFooter ? (
                    <>
                      <button
                        onClick={() => scrollToElement('about', 80)}
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                      >
                        About Me
                      </button>
                      <button
                        onClick={() => scrollToElement('tech-stack', 80)}
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                      >
                        Technologies
                      </button>
                      <button
                        onClick={() => scrollToElement('projects', 80)}
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                      >
                        Projects
                      </button>
                      <button
                        onClick={() => scrollToElement('contact', 80)}
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                      >
                        Contact
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/register"
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors"
                      >
                        Cadastrar
                      </Link>
                      <Link
                        href="/sign-in"
                        className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors"
                      >
                        Entrar
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Contact - Icons only */}
              <div className="text-center">
                <h3 className="font-semibold text-jcoder-foreground mb-4">Contact</h3>
                {isUserFooter ? (
                  <div className="flex justify-center gap-4">
                    {displayEmail && (
                      <a href={`mailto:${displayEmail}`} className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="Gmail">
                        <LazyImage
                          src="/images/icons/gmail.png"
                          alt="Gmail"
                          fallback="@"
                          size="custom"
                          width="w-7"
                          height="h-7"
                          showSkeleton={false}
                        />
                      </a>
                    )}
                    {displayGithubUrl && (
                      <a href={displayGithubUrl} target="_blank" rel="noopener noreferrer" className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="GitHub">
                        <GitHubIcon className="w-7 h-7" />
                      </a>
                    )}
                    {displayLinkedinUrl && (
                      <a href={displayLinkedinUrl} target="_blank" rel="noopener noreferrer" className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="LinkedIn">
                        <LazyImage
                          src="/images/icons/linkedin.png"
                          alt="LinkedIn"
                          fallback="Li"
                          size="custom"
                          width="w-7"
                          height="h-7"
                          showSkeleton={false}
                        />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-jcoder-muted">
                    Suporte via plataforma
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-jcoder pt-6 text-center">
            <p className="text-sm text-jcoder-muted">
              {isUserFooter ? (
                <>© {new Date().getFullYear()} {displayName}. All rights reserved.</>
              ) : (
                <>© {new Date().getFullYear()} JCoder Portfolio Platform. Built with Next.js, NestJS and Tailwind CSS.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
