'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';
import ApplicationCard from '@/components/applications/ApplicationCard';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const toast = useToast();
  const { scrollToElement } = useSmoothScroll();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    ApplicationService
      .getAll()
      .then(data => {
        if (!isMounted) return;
        setApplications(Array.isArray(data) ? data : []);
        setError(null);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('Failure to load applications', err);
        const errorMessage = 'The applications could not be loaded. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    scrollToElement(sectionId, 80); // 80px offset para o header
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={false} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jcoder-cyan/10 via-transparent to-jcoder-blue/10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jcoder-cyan/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-jcoder-blue/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Profile Image */}
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-jcoder-gradient p-1">
                <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center">
                  <img
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    className="w-20 h-20 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-jcoder-cyan">
                JCoder
              </span>
            </h1>

            {/* Subtitle */}
            <h2 className="text-2xl md:text-3xl font-semibold text-jcoder-foreground mb-4">
              Full Stack Developer
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-jcoder-muted mb-8 max-w-2xl mx-auto leading-relaxed">
              Desenvolvedor apaixonado por criar soluções inovadoras e eficientes.
              Especializado em tecnologias modernas e sempre em busca de novos desafios.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => scrollToSection('projects')}
                className="px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
              >
                Ver Projetos
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="px-8 py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300"
              >
                Entrar em Contato
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg
                className="w-6 h-6 text-jcoder-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-jcoder-foreground mb-8">
                Sobre Mim
              </h2>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                  <p className="text-lg text-jcoder-muted mb-6 leading-relaxed">
                    Sou um desenvolvedor full stack com mais de 5 anos de experiência
                    criando aplicações web modernas e escaláveis. Minha paixão é transformar
                    ideias em código funcional e elegante.
                  </p>
                  <p className="text-lg text-jcoder-muted mb-6 leading-relaxed">
                    Especializado em JavaScript, TypeScript, React, Node.js e outras
                    tecnologias do ecossistema moderno. Sempre em busca de aprender
                    novas tecnologias e melhorar minhas habilidades.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 bg-jcoder-secondary rounded-full text-jcoder-foreground">
                      🚀 Inovação
                    </div>
                    <div className="px-4 py-2 bg-jcoder-secondary rounded-full text-jcoder-foreground">
                      💡 Criatividade
                    </div>
                    <div className="px-4 py-2 bg-jcoder-secondary rounded-full text-jcoder-foreground">
                      🎯 Foco em Resultados
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full h-80 bg-jcoder-gradient rounded-2xl flex items-center justify-center">
                    <div className="text-6xl">💻</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section id="tech-stack" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                Tecnologias & Stacks
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {/* Frontend */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">⚛️</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">React</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🔷</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">TypeScript</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Tailwind</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Next.js</h3>
                </div>

                {/* Backend */}
                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🟢</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Node.js</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🏗️</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">NestJS</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🐘</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">PostgreSQL</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🐳</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Docker</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">☁️</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">AWS</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🔧</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Git</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">🧪</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">Jest</h3>
                </div>

                <div className="text-center group">
                  <div className="w-20 h-20 mx-auto mb-4 bg-jcoder-card rounded-2xl flex items-center justify-center group-hover:bg-jcoder-gradient transition-all duration-300">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h3 className="font-semibold text-jcoder-foreground">React Native</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-20 bg-jcoder-card/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-jcoder-foreground text-center mb-12">
                Projetos & Aplicações
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jcoder-primary"></div>
                  <p className="mt-4 text-jcoder-muted">Carregando projetos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      ApplicationService
                        .getAll()
                        .then((data) => setApplications(Array.isArray(data) ? data : []))
                        .catch(() => {
                          const errorMessage = 'The applications could not be loaded.';
                          setError(errorMessage);
                          toast.error(errorMessage);
                        })
                        .finally(() => setLoading(false));
                    }}
                    className="px-6 py-3 bg-jcoder-primary text-black font-semibold rounded-lg hover:bg-jcoder-accent transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {applications.map((app) => (
                    <ApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-jcoder-muted text-lg">Nenhum projeto encontrado.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Social & Contact Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-jcoder-foreground mb-8">
                Vamos Conectar
              </h2>
              <p className="text-lg text-jcoder-muted mb-12 max-w-2xl mx-auto">
                Estou sempre aberto a novas oportunidades e colaborações.
                Entre em contato comigo através das redes sociais ou por email.
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-6 mb-12">
                <a
                  href="https://github.com/jcoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <span className="text-2xl">🐙</span>
                  <span className="font-semibold">GitHub</span>
                </a>

                <a
                  href="https://linkedin.com/in/jcoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <span className="text-2xl">💼</span>
                  <span className="font-semibold">LinkedIn</span>
                </a>

                <a
                  href="https://twitter.com/jcoder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <span className="text-2xl">🐦</span>
                  <span className="font-semibold">Twitter</span>
                </a>

                <a
                  href="mailto:contato@jcoder.dev"
                  className="group flex items-center gap-3 px-6 py-3 bg-jcoder-card rounded-lg hover:bg-jcoder-gradient transition-all duration-300"
                >
                  <span className="text-2xl">📧</span>
                  <span className="font-semibold">Email</span>
                </a>
              </div>

              {/* Contact Form */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-jcoder-card rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-jcoder-foreground mb-6">
                    Envie uma Mensagem
                  </h3>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        placeholder="Seu Nome"
                        className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted"
                      />
                      <input
                        type="email"
                        placeholder="Seu Email"
                        className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted"
                      />
                    </div>
                    <textarea
                      placeholder="Sua Mensagem"
                      rows={4}
                      className="w-full px-4 py-3 bg-jcoder-secondary border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary text-jcoder-foreground placeholder-jcoder-muted resize-none"
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary transition-all duration-300 transform hover:scale-105"
                    >
                      Enviar Mensagem
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};
