'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { User } from '@/types/api/users/user.entity';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Application } from '@/types/api/applications/application.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';
import { PortfolioViewService } from '@/services/portfolio-view/portfolio-view.service';
import { ApplicationService } from '@/services/administration-by-user/applications.service';

// Import new components
import { TableSkeleton } from '@/components/ui';
import { useToast } from '@/components/toast/ToastContext';
import ApplicationApiDetails from '@/components/applications/[id]/ApplicationApiDetails';
import ApplicationDetailsLayout from '@/components/applications/[id]/ApplicationDetailsLayout';
import ApplicationMobileDetails from '@/components/applications/[id]/ApplicationMobileDetails';
import ApplicationLibraryDetails from '@/components/applications/[id]/ApplicationLibraryDetails';
import ApplicationFrontendDetails from '@/components/applications/[id]/ApplicationFrontendDetails';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const toast = useToast();

  // Get username and appId from URL params
  const username = useMemo(() => {
    const raw = params?.username;
    return Array.isArray(raw) ? raw[0] : raw || '';
  }, [params]);

  const appId = useMemo(() => {
    const raw = params?.id;
    const idStr = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(idStr);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  const fetchApplication = useCallback(async () => {
    if (appId === null || !username) {
      const errorMessage = 'Invalid Application ID or Username';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch application and user profile in parallel
      const [appData, profileData] = await Promise.all([
        ApplicationService.getById(username, appId),
        PortfolioViewService.getProfileWithAboutMe(username).catch(() => null),
      ]);

      if (!appData) {
        const errorMessage = 'Application not found';
        setError(errorMessage);
        toast.error(errorMessage);
        setApplication(null);
        return;
      }
      setApplication(appData);
      setUser(profileData || null);
    } catch (err: any) {
      const status = err?.response?.status;
      const errorMessage = status === 404
        ? 'Application not found'
        : 'The application could not be loaded. Please try again';

      setApplication(null);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [appId, username, toast]);

  const handleRetry = useCallback(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleGoHome = useCallback(() => {
    if (username) {
      router.push(`/${username}`);
    } else {
      router.push('/');
    }
  }, [router, username]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-jcoder-muted hover:text-jcoder-primary transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* States: loading / error / content */}
          {loading ? (
            <div className="bg-jcoder-card border border-jcoder rounded-lg p-4 sm:p-8 shadow-lg">
              {/* Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-jcoder-secondary rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="h-7 w-48 bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                    <div className="h-4 w-32 bg-jcoder-secondary rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="w-full sm:w-48 h-24 bg-jcoder-secondary rounded-lg animate-pulse"></div>
              </div>

              {/* Description Skeleton */}
              <div className="mb-6">
                <div className="h-6 w-32 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
                <div className="h-4 w-full bg-jcoder-secondary rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 w-5/6 bg-jcoder-secondary rounded-lg animate-pulse"></div>
              </div>

              {/* Technologies Skeleton */}
              <div className="mb-6">
                <div className="h-6 w-32 bg-jcoder-secondary rounded-lg mb-3 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-24 h-8 bg-jcoder-secondary rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Content Skeleton */}
              <div className="p-6">
                <TableSkeleton />
              </div>
            </div>
          ) : error ? (
            <div className="bg-jcoder-card border border-red-400 rounded-lg p-8 text-center">
              <p className="text-red-400">{error}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center px-4 py-2 border border-jcoder-primary text-jcoder-primary rounded-md text-sm hover:bg-jcoder-secondary transition-colors"
                >
                  Try again
                </button>
                <button
                  onClick={handleGoHome}
                  className="inline-flex items-center px-4 py-2 bg-jcoder-gradient text-black rounded-md text-sm hover:opacity-90 transition-opacity font-medium"
                >
                  Go to portfolio
                </button>
              </div>
            </div>
          ) : !application ? (
            <div className="bg-jcoder-card border border-jcoder rounded-lg p-8 text-center text-jcoder-muted">
              Application not found
            </div>
          ) : (
            <ApplicationDetailsLayout application={application}>
              {application.applicationType === ApplicationTypeEnum.API &&
                application.applicationComponentApi && (
                  <ApplicationApiDetails apiDetails={application.applicationComponentApi} />
                )}

              {application.applicationType === ApplicationTypeEnum.MOBILE &&
                application.applicationComponentMobile && (
                  <ApplicationMobileDetails mobileDetails={application.applicationComponentMobile} />
                )}

              {application.applicationType === ApplicationTypeEnum.LIBRARY &&
                application.applicationComponentLibrary && (
                  <ApplicationLibraryDetails libraryDetails={application.applicationComponentLibrary} />
                )}

              {application.applicationType === ApplicationTypeEnum.FRONTEND &&
                application.applicationComponentFrontend && (
                  <ApplicationFrontendDetails frontendDetails={application.applicationComponentFrontend} />
                )}

              {application.applicationType === ApplicationTypeEnum.FULLSTACK && (
                <>
                  {application.applicationComponentFrontend && (
                    <ApplicationFrontendDetails frontendDetails={application.applicationComponentFrontend} />
                  )}
                  {application.applicationComponentApi && (
                    <ApplicationApiDetails apiDetails={application.applicationComponentApi} />
                  )}
                </>
              )}
            </ApplicationDetailsLayout>
          )}
        </div>
      </main>

      <Footer user={user} username={username} />
    </div>
  );
};

