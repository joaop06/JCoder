
'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';

// Import new components
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

  const toast = useToast();

  // Found the application ID
  const appId = useMemo(() => {
    const raw = params?.id;
    const idStr = Array.isArray(raw) ? raw[0] : raw;
    const parsed = Number(idStr);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [params]);

  useEffect(() => {
    let isMounted = true;

    // If is invalid ID, don't call the api and show error
    if (appId === null) {
      const errorMessage = 'Invalid ID Application';
      setError(errorMessage);
      toast.error(errorMessage);

      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    ApplicationService.getById(appId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          const errorMessage = 'Application not found';
          setError(errorMessage);
          toast.error(errorMessage);

          setApplication(null);
          return;
        }
        setApplication(data);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        const status = err?.response?.status;

        let errorMessage: string;
        if (status === 404) errorMessage = 'Application not found';
        else errorMessage = 'The application could not be loaded. Please try again';

        setApplication(null);
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
  }, [appId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuth={true} isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          {/* States: loading / error / content */}
          {loading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
              Loading application...
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-lg p-8 text-center">
              <p className="text-red-600">{error}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    // force reload (if appId is valid, the effect runs again when changing the dummy state if necessary)
                    if (appId !== null) {
                      setLoading(true);
                      setError(null);
                      ApplicationService.getById(appId)
                        .then((data) => setApplication(data ?? null))
                        .catch(() => {
                          const errorMessage = 'The application could not be loaded. Please try again';
                          setError(errorMessage);
                          toast.error(errorMessage);
                        })
                        .finally(() => setLoading(false));
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Try again
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800"
                >
                  Go to top
                </button>
              </div>
            </div>
          ) : !application ? (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
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
                  {application.applicationComponentApi && (
                    <ApplicationApiDetails apiDetails={application.applicationComponentApi} />
                  )}
                  {application.applicationComponentFrontend && (
                    <ApplicationFrontendDetails frontendDetails={application.applicationComponentFrontend} />
                  )}
                </>
              )}
            </ApplicationDetailsLayout>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
