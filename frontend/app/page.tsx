'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/toast/ToastContext';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';
import ApplicationCard from '@/components/applications/ApplicationCard';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const toast = useToast();

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

  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((app) =>
      app.name.toLowerCase().includes(q) ||
      app.description.toLowerCase().includes(q)
    );
  }, [applications, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-jcoder-foreground mb-4">
            Application Portfolio
          </h1>
          <p className="text-lg text-jcoder-muted">
            Explore and access all the applications available in our portfolio
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-jcoder-muted"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              placeholder="Search for applications..."
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-jcoder rounded-lg focus:outline-none focus:ring-2 focus:ring-jcoder-primary focus:border-transparent bg-jcoder-card text-jcoder-foreground placeholder-jcoder-muted"
            />
          </div>
        </div>

        {/* Applications Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-jcoder-muted">Loading applications...</div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
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
                className="mt-4 inline-flex items-center px-4 py-2 border border-jcoder-primary text-jcoder-primary rounded-md text-sm hover:bg-jcoder-secondary transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredApplications.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>

              {/* Pagination Info */}
              <div className="text-center text-sm text-jcoder-muted">
                {filteredApplications.length} application(s) found
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-jcoder-muted">No applications found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
