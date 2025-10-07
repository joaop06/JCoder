import Link from 'next/link';
import { Application } from '@/types';

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getComponentUrl = () => {
    if (application.applicationComponentFrontend) {
      return application.applicationComponentFrontend.frontendUrl;
    }
    if (application.applicationComponentApi) {
      return application.applicationComponentApi.apiUrl;
    }
    if (application.applicationComponentMobile) {
      return application.applicationComponentMobile.downloadUrl;
    }
    if (application.applicationComponentLibrary) {
      return application.applicationComponentLibrary.packageManagerUrl;
    }
    return null;
  };

  const componentUrl = getComponentUrl();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">{getInitial(application.name)}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {application.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {application.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href={`/applications/${application.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver detalhes
            </Link>

            {componentUrl && (
              <a
                href={componentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Abrir
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
