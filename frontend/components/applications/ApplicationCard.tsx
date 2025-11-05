import Link from 'next/link';
import LazyImage from '@/components/ui/LazyImage';
import { Application } from '@/types/api/applications/application.entity';
import { ImagesService } from '@/services/administration-by-user/images.service';

interface ApplicationCardProps {
  application: Application;
  username?: string;
}

export default function ApplicationCard({ application, username }: ApplicationCardProps) {
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
  const appUsername = username || application.username;

  return (
    <div className="bg-jcoder-card border border-jcoder rounded-lg p-6 hover:shadow-lg hover:shadow-jcoder-primary/20 transition-all duration-300 hover:border-jcoder-primary">
      <div className="flex items-start gap-4">
        {/* Icon or Image */}
        {application.profileImage && appUsername ? (
          <LazyImage
            src={ImagesService.getApplicationProfileImageUrl(appUsername, application.id)}
            alt={application.name}
            fallback={getInitial(application.name)}
            size="custom"
            width="w-12"
            height="h-12"
            rounded="rounded-lg"
            objectFit="object-cover"
            rootMargin="100px"
          />
        ) : application.images && application.images.length > 0 && appUsername ? (
          <LazyImage
            src={ImagesService.getApplicationImageUrl(appUsername, application.id, application.images[0])}
            alt={application.name}
            fallback={getInitial(application.name)}
            size="custom"
            width="w-12"
            height="h-12"
            rounded="rounded-lg"
            objectFit="object-cover"
            rootMargin="100px"
          />
        ) : (
          <div className="w-12 h-12 bg-jcoder-gradient rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-lg">{getInitial(application.name)}</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2">
            {application.name}
          </h3>
          <p className="text-sm text-jcoder-muted mb-4 line-clamp-2">
            {application.description}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {appUsername ? (
              <Link
                href={`/${appUsername}/applications/${application.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-jcoder rounded-lg hover:bg-jcoder-secondary hover:border-jcoder-primary transition-colors text-jcoder-muted hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                See details
              </Link>
            ) : null}

            {componentUrl && (
              <a
                href={componentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-jcoder-gradient text-black rounded-lg hover:opacity-90 transition-opacity font-medium"
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
