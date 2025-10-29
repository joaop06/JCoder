'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/');
  }, [router]);

  const adminSections = useMemo(() => [
    {
      title: 'Applications',
      description: 'Manage your portfolio applications - create, update, and delete',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/admin/applications',
      color: 'from-blue-500 to-cyan-500',
      available: true,
    },
    {
      title: 'Profile',
      description: 'Manage your administrator profile and settings',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      href: '/admin/profile',
      color: 'from-purple-500 to-pink-500',
      available: true,
    },
    {
      title: 'Technologies',
      description: 'Manage technologies and tech stack for your portfolio',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      href: '/admin/technologies',
      color: 'from-green-500 to-emerald-500',
      available: true,
    },
  ], []);

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header isAdmin={true} onLogout={handleLogout} />
        <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="h-12 w-80 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
              <div className="h-6 w-96 bg-jcoder-secondary rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-jcoder-card border border-jcoder rounded-xl p-8">
                  <div className="w-16 h-16 bg-jcoder-secondary rounded-xl mb-6 animate-pulse"></div>
                  <div className="h-8 w-40 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
                  <div className="h-4 w-full bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="mt-12 bg-jcoder-card border border-jcoder rounded-xl p-8">
              <div className="h-8 w-48 bg-jcoder-secondary rounded-lg mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-jcoder-secondary border border-jcoder rounded-lg">
                    <div className="w-12 h-12 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-5 w-40 bg-jcoder-secondary rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-56 bg-jcoder-secondary rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={true} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-jcoder-foreground mb-3">Admin Dashboard</h1>
            <p className="text-lg text-jcoder-muted">Welcome to your administration panel. Choose a section to manage.</p>
          </div>

          {/* Admin Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
              <button
                key={section.title}
                onClick={() => section.available && router.push(section.href)}
                disabled={!section.available}
                className={`relative bg-jcoder-card border border-jcoder rounded-xl p-8 text-left transition-all duration-300 ${section.available
                  ? 'hover:border-jcoder-primary hover:shadow-lg hover:shadow-jcoder-primary/20 hover:-translate-y-1 cursor-pointer'
                  : 'opacity-60 cursor-not-allowed'
                  }`}
              >
                {!section.available && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} mb-6`}>
                  <div className="text-white">
                    {section.icon}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-jcoder-foreground mb-3">
                  {section.title}
                </h2>

                <p className="text-jcoder-muted leading-relaxed">
                  {section.description}
                </p>

                {section.available && (
                  <div className="mt-6 inline-flex items-center gap-2 text-jcoder-primary font-medium">
                    <span>Manage</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 bg-jcoder-card border border-jcoder rounded-xl p-8">
            <h2 className="text-2xl font-bold text-jcoder-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/applications/new')}
                className="flex items-center gap-4 p-4 bg-jcoder-secondary border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-jcoder-foreground">New Application</h3>
                  <p className="text-sm text-jcoder-muted">Create a new portfolio application</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/admin/applications')}
                className="flex items-center gap-4 p-4 bg-jcoder-secondary border border-jcoder rounded-lg hover:border-jcoder-primary transition-colors text-left"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-jcoder-foreground">View All Applications</h3>
                  <p className="text-sm text-jcoder-muted">Browse and manage existing applications</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
