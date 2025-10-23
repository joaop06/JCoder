'use client';

import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { GitHubIcon } from '@/components/theme';

export default function Footer() {
  const { scrollToElement } = useSmoothScroll();
  return (
    <footer className="border-t border-jcoder bg-jcoder-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <img
                  src="/images/jcoder-logo.png"
                  alt="JCoder"
                  className="w-8 h-8"
                />
                <span className="text-xl font-semibold text-jcoder-foreground">JCoder</span>
              </div>
              <p className="text-sm text-jcoder-muted">
                Desenvolvedor Full Stack apaixonado por criar soluções inovadoras.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Links Rápidos</h3>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToElement('about', 80)}
                  className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                >
                  Sobre Mim
                </button>
                <button
                  onClick={() => scrollToElement('tech-stack', 80)}
                  className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                >
                  Tecnologias
                </button>
                <button
                  onClick={() => scrollToElement('projects', 80)}
                  className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                >
                  Projetos
                </button>
                <button
                  onClick={() => scrollToElement('contact', 80)}
                  className="block w-full text-center text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors cursor-pointer"
                >
                  Contato
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center md:text-right">
              <h3 className="font-semibold text-jcoder-foreground mb-4">Contato</h3>
              <div className="space-y-2">
                <a href="mailto:joaopedroborges@gmail.com" className="flex items-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <img src="/icons/gmail.png" alt="Gmail" className="w-4 h-4" />
                  joaopedroborges@gmail.com
                </a>
                <a href="https://github.com/joaop06" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <GitHubIcon className="w-4 h-4" />
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/jo%C3%A3o-pedro-borges-ara%C3%BAjo-9a134116b " target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-jcoder-muted hover:text-jcoder-primary transition-colors">
                  <img src="/icons/linkedin.png" alt="LinkedIn" className="w-4 h-4 dark" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-jcoder pt-6 text-center">
            <p className="text-sm text-jcoder-muted">
              © {new Date().getFullYear()} JCoder. Desenvolvido com Next.js, NestJS e muito ❤️.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
