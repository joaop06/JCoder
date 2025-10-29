'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { GitHubIcon } from '@/components/theme';
import LazyImage from './ui/LazyImage';

export default function Footer() {
  const { scrollToElement } = useSmoothScroll();
  return (
    <footer className="border-t border-jcoder bg-jcoder-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <LazyImage
                  src="/images/jcoder-logo.png"
                  alt="JCoder"
                  fallback="JC"
                  size="custom"
                  width="w-8"
                  height="h-8"
                  showSkeleton={false}
                />
                <span className="text-xl font-semibold text-jcoder-foreground">JCoder</span>
              </div>
              <p className="text-sm text-jcoder-muted">
                Backend Developer passionate about creating innovative solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Quick Links</h3>
              <div className="space-y-2">
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
              </div>
            </div>

            {/* Contact */}
            <div className="text-center">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Contact</h3>
              <div className="space-y-2">
                <a href="mailto:joaopedroborges@gmail.com" className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <LazyImage
                    src="/icons/gmail.png"
                    alt="Gmail"
                    fallback="@"
                    size="custom"
                    width="w-4"
                    height="h-4"
                    showSkeleton={false}
                  />
                  joaopedroborges@gmail.com
                </a>
                <a href="https://github.com/joaop06" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <GitHubIcon className="w-4 h-4" />
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/jo%C3%A3o-pedro-borges-ara%C3%BAjo-9a134116b " target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <LazyImage
                    src="/icons/linkedin.png"
                    alt="LinkedIn"
                    fallback="Li"
                    size="custom"
                    width="w-4"
                    height="h-4"
                    showSkeleton={false}
                  />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden mb-8">
            {/* Brand */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <LazyImage
                  src="/images/jcoder-logo.png"
                  alt="JCoder"
                  fallback="JC"
                  size="custom"
                  width="w-8"
                  height="h-8"
                  showSkeleton={false}
                />
                <span className="text-xl font-semibold text-jcoder-foreground">JCoder</span>
              </div>
              <p className="text-sm text-jcoder-muted">
                Backend Developer passionate about creating innovative solutions.
              </p>
            </div>

            {/* Quick Links and Contact side by side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Quick Links */}
              <div className="text-center">
                <h3 className="font-semibold text-jcoder-foreground mb-4">Quick Links</h3>
                <div className="space-y-2">
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
                </div>
              </div>

              {/* Contact - Icons only */}
              <div className="text-center">
                <h3 className="font-semibold text-jcoder-foreground mb-4">Contact</h3>
                <div className="flex justify-center gap-4">
                  <a href="mailto:joaopedroborges@gmail.com" className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="Gmail">
                    <LazyImage
                      src="/icons/gmail.png"
                      alt="Gmail"
                      fallback="@"
                      size="custom"
                      width="w-7"
                      height="h-7"
                      showSkeleton={false}
                    />
                  </a>
                  <a href="https://github.com/joaop06" target="_blank" rel="noopener noreferrer" className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="GitHub">
                    <GitHubIcon className="w-7 h-7" />
                  </a>
                  <a href="https://www.linkedin.com/in/jo%C3%A3o-pedro-borges-ara%C3%BAjo-9a134116b " target="_blank" rel="noopener noreferrer" className="text-jcoder-muted hover:text-jcoder-primary transition-colors" title="LinkedIn">
                    <LazyImage
                      src="/icons/linkedin.png"
                      alt="LinkedIn"
                      fallback="Li"
                      size="custom"
                      width="w-7"
                      height="h-7"
                      showSkeleton={false}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-jcoder pt-6 text-center">
            <p className="text-sm text-jcoder-muted">
              © {new Date().getFullYear()} JCoder. Built with Next.js, NestJS and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
