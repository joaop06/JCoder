'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/ToastContext';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const toast = useToast();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchApplications = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await ApplicationService.getAll();
        setApplications(Array.isArray(data) ? data : []);
      } catch (err: any) {
        const errorMessage = 'The applications could not be loaded. Please try again.';
        toast.error(errorMessage);
        setFetchError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/');
  }, [router]);

  const handleDelete = useCallback(
    async (application: Application) => {
      const confirmed = await toast.confirm(`Are you sure you want to delete ${application.name}?`, {
        confirmText: 'Delete',
        cancelText: 'Cancel',
      });
      if (!confirmed) return;

      const prev = applications;

      try {
        await ApplicationService.delete(application.id);
        toast.success(`${application.name} successfully deleted!`);

        setApplications((apps) => apps.filter((a) => a.id !== application.id));

      } catch (err) {
        toast.error('The application could not be deleted. Returning to the previous state.');
        setApplications(prev);
      }
    },
    [applications]
  );

  const activeApplications = useMemo(
    () => applications.filter((app) => app.isActive).length,
    [applications]
  );

  const formatRelativeDate = (date: Date, locale = 'en-US'): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;

    // Same date of the current day -> “Today HH:mm”
    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (sameDay) {
      return `Today ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();
    if (isYesterday) {
      return `Yesterday ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleString(locale, {
      day: '2-digit',
      hour: '2-digit',
      year: 'numeric',
      month: '2-digit',
      minute: '2-digit',
    });
  }

  const parseToDate = (value: string | number | Date | null | undefined): Date | null => {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  const lastUpdate = useMemo(() => {
    if (!applications?.length) return 'Never';

    // For each application, we took the most recent one between updatedAt and createdAt
    const latestDates: Date[] = applications
      .map((app: Application) => {
        const created = parseToDate(app.createdAt);
        const updated = parseToDate(app.updatedAt);
        if (created && updated) return updated > created ? updated : created;
        return updated ?? created ?? null;
      })
      .filter((d): d is Date => d !== null);

    if (!latestDates.length) return 'Never';

    // Select the most recent date from all of them
    const mostRecent = latestDates.reduce((a, b) => (a > b ? a : b));

    return formatRelativeDate(mostRecent, 'en-US');
  }, [applications]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuth={true} isAdmin={true} onLogout={handleLogout} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your portfolio applications</p>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="mb-6 text-gray-600">Loading applications...</div>
          )}
          {fetchError && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded">
              {fetchError}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Active Applications</p>
              <p className="text-3xl font-bold text-green-600">{activeApplications}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Last Update</p>
              <p className="text-3xl font-bold text-gray-900">{lastUpdate}</p>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Applications</h2>
                  <p className="text-sm text-gray-600">Manage all portfolio applications</p>
                </div>
                <button
                  onClick={() => router.push('/admin/applications/new')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Application
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      URL (GitHub)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {!loading && applications.map((app) => {
                    return (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {app.name?.charAt(0)?.toUpperCase() ?? '?'}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{app.applicationType}</span>
                        </td>
                        <td className="px-6 py-4">
                          {app.githubUrl ? (
                            <a
                              href={app.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              title={app.githubUrl}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open GitHub
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 truncate max-w-md">{app.description}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${app.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {app.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => router.push(`/admin/applications/${app.id}/edit`)}
                              className="p-2 text-gray-600 hover:text-black transition-colors"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(app)}
                              className="p-2 text-red-600 hover:text-red-700 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  )}
                  {!loading && !applications.length && !fetchError && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
