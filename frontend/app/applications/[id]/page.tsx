'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [application, setApplication] = useState<Application | null>(null);

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
      setError('Invalid ID Application');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    ApplicationService.getById(appId)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setError('Aplication not found.');
          setApplication(null);
          return;
        }
        setApplication(data);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        const status = err?.response?.status;
        if (status === 404) {
          setError('Aplication not found.');
        } else {
          setError('The application could not be loaded. Please try again.');
        }
        setApplication(null);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? '';

  const getMainUrl = (app: Application | null) => {
    if (!app) return null;
    if (app.applicationComponentFrontend) {
      return app.applicationComponentFrontend.frontendUrl;
    }
    if (app.applicationComponentApi) {
      return app.applicationComponentApi.apiUrl;
    }
    if (app.applicationComponentMobile) {
      return app.applicationComponentMobile.downloadUrl;
    }
    if (app.applicationComponentLibrary) {
      return app.applicationComponentLibrary.packageManagerUrl;
    }
    return null;
  };

  const mainUrl = getMainUrl(application);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuth={true} isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
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
                        .catch(() => setError('The application could not be loaded. Please try again.'))
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
              Application not found.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
              {/* Application Header */}
              <div className="flex items-start justify-between mb-6 gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-2xl">
                      {getInitial(application.name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 truncate">
                      {application.name}
                    </h1>
                    {mainUrl && (
                      <p className="text-sm text-gray-600 overflow-hidden text-ellipsis">
                        URL: <span className="break-all">{mainUrl}</span>
                      </p>
                    )}
                  </div>
                </div>

                {mainUrl && (
                  <a
                    href={mainUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Application
                  </a>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700">{application.description}</p>
              </div>

              {/* Technical Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">ID:</p>
                    <p className="text-gray-900">{application.id}</p>
                  </div>
                  {mainUrl && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">URL:</p>
                      <p className="text-gray-900 break-all">{mainUrl}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Component-specific details */}
              {application.applicationComponentApi && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Details</h3>
                  <div className="space-y-3">
                    {application.applicationComponentApi.domain && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Domain:</p>
                        <p className="text-gray-900 break-all">{application.applicationComponentApi.domain}</p>
                      </div>
                    )}
                    {application.applicationComponentApi.documentationUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Documentation:</p>
                        <a
                          href={application.applicationComponentApi.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline break-all"
                        >
                          {application.applicationComponentApi.documentationUrl}
                        </a>
                      </div>
                    )}
                    {application.applicationComponentApi.healthCheckEndpoint && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Health Check:</p>
                        <p className="text-gray-900 break-all">
                          {application.applicationComponentApi.healthCheckEndpoint}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Access Button */}
              {application.applicationComponentApi && (
                <div className="mt-6">
                  <a
                    href={application.applicationComponentApi.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Access {application.name}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
