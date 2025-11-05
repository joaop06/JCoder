'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LazyImage from '@/components/ui/LazyImage';
import Footer from '@/components/Footer';

export default function HomePage() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-jcoder-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className={`max-w-6xl mx-auto text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Logo */}
            <div className="mb-8 animate-bounce-slow">
              <div className="w-24 h-24 mx-auto rounded-full bg-jcoder-gradient p-1 shadow-lg shadow-jcoder-primary/50">
                <div className="w-full h-full rounded-full bg-jcoder-card flex items-center justify-center">
                  <LazyImage
                    src="/images/jcoder-logo.png"
                    alt="JCoder"
                    fallback="JC"
                    size="custom"
                    width="w-16"
                    height="h-16"
                    rounded="rounded-full"
                    rootMargin="200px"
                  />
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue animate-gradient">
              <span className="block">JCoder</span>
              <span className="block text-3xl md:text-5xl lg:text-6xl mt-2 text-jcoder-foreground">Portfolio Platform</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-jcoder-muted mb-8 max-w-3xl mx-auto leading-relaxed">
              Crie, gerencie e compartilhe seu portfólio profissional de forma simples e elegante.
              <br />
              <span className="text-jcoder-primary">Destaque seus projetos e conquiste novas oportunidades.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/register"
                className="group px-8 py-4 bg-jcoder-gradient text-black font-semibold rounded-lg hover:shadow-jcoder-primary hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <span>Começar Agora</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center gap-2"
              >
                <span>Entrar</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </Link>
              <button
                onClick={() => {
                  const element = document.getElementById('features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border-2 border-jcoder-primary text-jcoder-primary font-semibold rounded-lg hover:bg-jcoder-primary hover:text-black transition-all duration-300 flex items-center gap-2"
              >
                <span>Saiba Mais</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <svg className="w-6 h-6 mx-auto text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-jcoder-foreground mb-4">
                Por que escolher o <span className="text-jcoder-primary">JCoder</span>?
              </h2>
              <p className="text-lg text-jcoder-muted max-w-2xl mx-auto">
                Uma plataforma completa para gerenciar e exibir seu portfólio profissional
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Gerenciamento Completo</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Gerencie projetos, tecnologias, experiência profissional, educação e certificações tudo em um só lugar.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Design Personalizado</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Portfólios com design moderno e responsivo, totalmente personalizável para refletir sua identidade.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Rápido e Eficiente</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Interface intuitiva e sistema otimizado para que você possa focar no que realmente importa: seus projetos.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">URL Personalizada</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Seu portfólio acessível através de uma URL única baseada no seu username, fácil de compartilhar.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Área Administrativa</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Painel completo para gerenciar todas as informações do seu portfólio de forma simples e organizada.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group bg-jcoder-card border border-jcoder rounded-2xl p-8 hover:border-jcoder-primary transition-all duration-300 hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Exportação de Currículo</h3>
                <p className="text-jcoder-muted leading-relaxed">
                  Gere e baixe seu currículo em PDF com todas as informações do seu portfólio formatadas profissionalmente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-jcoder-card/30 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-jcoder-foreground mb-4">
                Como Funciona
              </h2>
              <p className="text-lg text-jcoder-muted max-w-2xl mx-auto">
                Três passos simples para ter seu portfólio online
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-jcoder-card border border-jcoder-primary rounded-2xl p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-jcoder-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-xl">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Crie sua Conta</h3>
                  <p className="text-jcoder-muted">
                    Faça o cadastro e escolha seu username único para acessar sua área administrativa.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-jcoder-primary z-0" />
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-jcoder-card border border-jcoder-primary rounded-2xl p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-jcoder-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-xl">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Configure seu Perfil</h3>
                  <p className="text-jcoder-muted">
                    Adicione informações pessoais, projetos, tecnologias, experiência e muito mais.
                  </p>
                </div>
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-jcoder-primary z-0" />
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-jcoder-card border border-jcoder-primary rounded-2xl p-8 text-center relative z-10">
                  <div className="w-12 h-12 bg-jcoder-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-black font-bold text-xl">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-jcoder-foreground mb-4">Compartilhe</h3>
                  <p className="text-jcoder-muted">
                    Seu portfólio estará disponível em uma URL única e personalizada. Compartilhe com o mundo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-jcoder-gradient rounded-3xl p-12 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/jcoder-logo.png')] bg-contain bg-center opacity-5" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
                  Pronto para começar?
                </h2>
                <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
                  Crie sua conta agora e transforme seu portfólio profissional em minutos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-black/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Cadastrar Agora</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/sign-in"
                    className="px-8 py-4 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Já tenho conta</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
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
}