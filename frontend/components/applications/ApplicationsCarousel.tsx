'use client';

import { useState, useEffect, useRef } from 'react';
import { Application } from '@/types';
import ApplicationCard from './ApplicationCard';
import FeatureCard3D from '@/components/webgl/FeatureCard3D';

interface ApplicationsCarouselProps {
  applications: Application[];
  username: string;
  mouse: { x: number; y: number };
}

export default function ApplicationsCarousel({ applications, username, mouse }: ApplicationsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3; // Fixo em 3 aplicações por página
  const carouselRef = useRef<HTMLDivElement>(null);

  // Resetar índice quando o número de aplicações mudar
  useEffect(() => {
    const maxIndex = Math.max(0, applications.length - itemsPerView);
    setCurrentIndex((prevIndex) => {
      return prevIndex > maxIndex ? maxIndex : prevIndex;
    });
  }, [applications.length]);

  const maxIndex = Math.max(0, applications.length - itemsPerView);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrevious = currentIndex > 0;

  const goToNext = () => {
    if (canGoNext) {
      // Avançar sempre 3 itens (uma página completa)
      setCurrentIndex(Math.min(currentIndex + itemsPerView, maxIndex));
    }
  };

  const goToPrevious = () => {
    if (canGoPrevious) {
      // Retroceder sempre 3 itens (uma página completa)
      setCurrentIndex(Math.max(currentIndex - itemsPerView, 0));
    }
  };

  const goToIndex = (index: number) => {
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
    <div className="relative w-full">
      {/* Carrossel Container */}
      <div className="relative overflow-hidden">
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
              className="flex-shrink-0 px-4"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-jcoder-card border-2 border-jcoder-primary hover:bg-jcoder-gradient hover:text-black transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-jcoder-card disabled:hover:text-jcoder-primary shadow-lg"
            aria-label="Previous applications"
          >
            <svg
              className="w-6 h-6"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-jcoder-card border-2 border-jcoder-primary hover:bg-jcoder-gradient hover:text-black transition-all duration-300 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-jcoder-card disabled:hover:text-jcoder-primary shadow-lg"
            aria-label="Next applications"
          >
            <svg
              className="w-6 h-6"
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

      {/* Indicators */}
      {applications.length > itemsPerView && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(applications.length / itemsPerView) }).map((_, index) => {
            const startIndex = index * itemsPerView;
            const isActive = currentIndex >= startIndex && currentIndex < startIndex + itemsPerView;
            return (
              <button
                key={index}
                onClick={() => goToIndex(startIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-jcoder-primary w-8'
                  : 'bg-jcoder-secondary w-2 hover:bg-jcoder-primary/50'
                  }`}
                aria-label={`Go to page ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Counter */}
      <div className="text-center mt-4 text-sm text-jcoder-muted">
        Showing {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, applications.length)} of {applications.length} {applications.length === 1 ? 'project' : 'projects'}
      </div>
    </div>
  );
}

