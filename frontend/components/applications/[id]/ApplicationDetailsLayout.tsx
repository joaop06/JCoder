import React from 'react';
import LinkDisplayBlock from './LinkDisplayBlock';
import ApplicationTechnologies from './ApplicationTechnologies';
import ApplicationImagesGallery from './ApplicationImagesGallery';
import { Application } from '@/types/entities/application.entity';
import { ApplicationService } from '@/services/applications.service';
import { LazyImage } from '@/components/ui';

interface ApplicationDetailsLayoutProps {
  application: Application;
  children: React.ReactNode;
}

const ApplicationDetailsLayout: React.FC<ApplicationDetailsLayoutProps> = ({
  application,
  children,
}) => {
  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() ?? '';

  return (
    <div className="bg-jcoder-card border border-jcoder rounded-lg p-4 sm:p-8 mb-6 shadow-lg hover:shadow-xl hover:shadow-jcoder-primary/20 transition-all duration-300">
      {/* Application Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          {application.profileImage ? (
            <LazyImage
              src={ApplicationService.getProfileImageUrl(application.id)}
              alt={application.name}
              fallback={application.name}
              className="object-cover"
              size="custom"
              width="w-12 sm:w-16"
              height="h-12 sm:h-16"
            />
          ) : application.images && application.images.length > 0 ? (
            <LazyImage
              src={ApplicationService.getImageUrl(application.id, application.images[0])}
              alt={application.name}
              fallback={application.name}
              className="object-cover"
              size="custom"
              width="w-12 sm:w-16"
              height="h-12 sm:h-16"
            />
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-jcoder-gradient rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-lg sm:text-2xl">
                {getInitial(application.name)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-jcoder-foreground mb-1 sm:mb-2 truncate">
              {application.name}
            </h1>
            <p className="text-xs sm:text-sm text-jcoder-muted overflow-hidden text-ellipsis">
              Type: {application.applicationType}
            </p>
          </div>
        </div>

        {/* GitHub URL Card */}
        {application.githubUrl && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            <LinkDisplayBlock
              label="GitHub URL"
              url={application.githubUrl}
              icon={
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-jcoder-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              }
              showCopyButton={false}
              showUrl={false}
              verticalLayout={true}
              actionLabel="View Repository"
              actionIcon={
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              }
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-jcoder-foreground mb-2 sm:mb-3">Description</h2>
        <p className="text-sm sm:text-base text-jcoder-muted">{application.description}</p>
      </div>

      {/* Technologies */}
      {application.technologies && application.technologies.length > 0 && (
        <ApplicationTechnologies technologies={application.technologies} />
      )}

      {/* Images Gallery */}
      {application.images && application.images.length > 0 && (
        <ApplicationImagesGallery
          applicationId={application.id}
          images={application.images}
        />
      )}

      {/* Component-specific details will be rendered here */}
      {children}
    </div>
  );
};

export default ApplicationDetailsLayout;
