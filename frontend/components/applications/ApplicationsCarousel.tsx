'use client';

import { Application } from '@/types';
import ApplicationCard from './ApplicationCard';
import { useState, useEffect, useRef, useCallback } from 'react';
import FeatureCard3D from '@/components/webgl/FeatureCard3D';

interface ApplicationsCarouselProps {
  applications: Application[];
  username: string;
  mouse: { x: number; y: number };
}

export default function ApplicationsCarousel({ applications, username, mouse }: ApplicationsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1); // Responsive: 1 mobile, 2 tablet, 3 desktop
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // Progresso da barra (0-100)
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationStartTimeRef = useRef<number>(Date.now());

  // Auto-play configuration
  const AUTO_PLAY_INTERVAL = 5000; // 5 segundos
  const PAUSE_ON_INTERACTION = 3000; // Pausa por 3 segundos após interação
  const PROGRESS_UPDATE_INTERVAL = 50; // Atualiza progresso a cada 50ms para animação suave

  // Update itemsPerView based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablet: 2 items
      } else {
        setItemsPerView(3); // Desktop: 3 items
      }
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  // Reset index when number of applications or itemsPerView changes
  useEffect(() => {
    const maxIndex = Math.max(0, applications.length - itemsPerView);
    setCurrentIndex((prevIndex) => {
      return prevIndex > maxIndex ? maxIndex : prevIndex;
    });
  }, [applications.length, itemsPerView]);

  const maxIndex = Math.max(0, applications.length - itemsPerView);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrevious = currentIndex > 0;

  // Função para animar a barra de progresso
  const startProgressAnimation = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    animationStartTimeRef.current = Date.now();
    
    progressIntervalRef.current = setInterval(() => {
      if (isPaused || !isAutoPlaying) {
        setProgress(0);
        return;
      }

      const elapsed = Date.now() - animationStartTimeRef.current;
      const newProgress = Math.min((elapsed / AUTO_PLAY_INTERVAL) * 100, 100);
      setProgress(newProgress);
    }, PROGRESS_UPDATE_INTERVAL);
  }, [isPaused, isAutoPlaying]);

  // Função para pausar auto-play temporariamente após interação
  const handleUserInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    setIsPaused(true);
    setProgress(0); // Reset progresso

    // Limpar timers anteriores
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Retomar auto-play após período de inatividade
    pauseTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      animationStartTimeRef.current = Date.now();
      startProgressAnimation();
    }, PAUSE_ON_INTERACTION);
  }, [startProgressAnimation]);

  // Função para avançar automaticamente
  const autoAdvance = useCallback(() => {
    if (isPaused || !isAutoPlaying) return;

    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerView;
      if (nextIndex > maxIndex) {
        // Volta ao início quando chega ao fim
        return 0;
      }
      return nextIndex;
    });

    // Reset progresso e reinicia animação
    setProgress(0);
    animationStartTimeRef.current = Date.now();
  }, [isPaused, isAutoPlaying, itemsPerView, maxIndex]);

  // Auto-play effect
  useEffect(() => {
    // Só ativa auto-play se houver mais itens do que o que cabe na tela
    if (applications.length <= itemsPerView) {
      setIsAutoPlaying(false);
      setProgress(0);
      return;
    }

    // Limpar timers anteriores
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }

    // Configurar auto-play
    if (isAutoPlaying && !isPaused) {
      animationStartTimeRef.current = Date.now();
      startProgressAnimation();
      
      autoPlayTimerRef.current = setInterval(() => {
        autoAdvance();
      }, AUTO_PLAY_INTERVAL);
    } else {
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, autoAdvance, applications.length, itemsPerView, startProgressAnimation]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Detectar interações do usuário (hover, touch, etc)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      handleUserInteraction();
    };

    const handleMouseLeave = () => {
      // Não pausa ao sair, apenas ao entrar
    };

    const handleTouchStart = () => {
      handleUserInteraction();
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleUserInteraction]);

  const goToNext = () => {
    handleUserInteraction();
    if (canGoNext) {
      // Always advance by itemsPerView (a complete page)
      setCurrentIndex(Math.min(currentIndex + itemsPerView, maxIndex));
    } else {
      // Volta ao início se estiver no fim
      setCurrentIndex(0);
    }
  };

  const goToPrevious = () => {
    handleUserInteraction();
    if (canGoPrevious) {
      // Always go back by itemsPerView (a complete page)
      setCurrentIndex(Math.max(currentIndex - itemsPerView, 0));
    } else {
      // Vai para o fim se estiver no início
      setCurrentIndex(maxIndex);
    }
  };

  const goToIndex = (index: number) => {
    handleUserInteraction();
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚀</div>
        <p className="text-jcoder-muted text-lg">No projects found.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full group">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        {/* Efeito de brilho sutil nas bordas quando em auto-play */}
        {isAutoPlaying && !isPaused && applications.length > itemsPerView && (
          <>
            {canGoNext && (
              <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-l from-jcoder-primary/10 via-transparent to-transparent z-10 pointer-events-none animate-pulse-slow"></div>
            )}
            {canGoPrevious && (
              <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 md:w-40 bg-gradient-to-r from-jcoder-primary/10 via-transparent to-transparent z-10 pointer-events-none animate-pulse-slow"></div>
            )}
          </>
        )}

        {/* Shimmer effect nas bordas para indicar mais conteúdo */}
        {canGoNext && (
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 bg-gradient-to-l from-background/90 via-background/50 to-transparent z-0 pointer-events-none"></div>
        )}
        {canGoPrevious && (
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 md:w-28 bg-gradient-to-r from-background/90 via-background/50 to-transparent z-0 pointer-events-none"></div>
        )}

        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {applications.map((app, index) => (
            <div
              key={app.id}
              className="flex-shrink-0 px-2 sm:px-3 md:px-4"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <FeatureCard3D mouse={mouse} index={index}>
                <ApplicationCard application={app} username={username} />
              </FeatureCard3D>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {applications.length > itemsPerView && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 md:-translate-x-12 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-jcoder-card border-2 border-jcoder-primary hover:bg-jcoder-gradient hover:text-black transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-jcoder-card disabled:hover:text-jcoder-primary shadow-lg ${
              isAutoPlaying && !isPaused && canGoPrevious ? 'ring-2 ring-jcoder-primary/30 ring-offset-2 ring-offset-background' : ''
            }`}
            aria-label="Previous applications"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 md:translate-x-12 z-10 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-jcoder-card border-2 border-jcoder-primary hover:bg-jcoder-gradient hover:text-black transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-jcoder-card disabled:hover:text-jcoder-primary shadow-lg ${
              isAutoPlaying && !isPaused && canGoNext ? 'ring-2 ring-jcoder-primary/30 ring-offset-2 ring-offset-background animate-pulse-glow' : ''
            }`}
            aria-label="Next applications"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Barra de Progresso - Estilo moderno e elegante */}
      {isAutoPlaying && applications.length > itemsPerView && (
        <div className="mt-6 sm:mt-8 relative">
          <div className="h-0.5 sm:h-1 bg-jcoder-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue rounded-full transition-all duration-75 ease-linear relative"
              style={{
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 8px rgba(0, 200, 255, 0.5)' : 'none',
              }}
            >
              {/* Efeito de brilho animado na barra */}
              {progress > 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indicators */}
      {applications.length > itemsPerView && (
        <div className="flex justify-center items-center gap-1.5 sm:gap-2 mt-6 sm:mt-8 px-2">
          {Array.from({ length: Math.ceil(applications.length / itemsPerView) }).map((_, index) => {
            const startIndex = index * itemsPerView;
            const isActive = currentIndex >= startIndex && currentIndex < startIndex + itemsPerView;
            return (
              <button
                key={index}
                onClick={() => goToIndex(startIndex)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-jcoder-primary w-6 sm:w-8'
                  : 'bg-jcoder-secondary w-1.5 sm:w-2 hover:bg-jcoder-primary/50'
                  }`}
                aria-label={`Go to page ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Counter */}
      <div className="text-center mt-4 text-xs sm:text-sm text-jcoder-muted px-2">
        Showing {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, applications.length)} of {applications.length} {applications.length === 1 ? 'project' : 'projects'}
      </div>

      {/* Estilos customizados para animações */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 200, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(0, 200, 255, 0);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

