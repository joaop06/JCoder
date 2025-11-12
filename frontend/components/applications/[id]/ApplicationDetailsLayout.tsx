import React from 'react';
import { LazyImage } from '@/components/ui';
import LinkDisplayBlock from './LinkDisplayBlock';
import ApplicationTechnologies from './ApplicationTechnologies';
import ApplicationImagesGallery from './ApplicationImagesGallery';
import { Application } from '@/types/api/applications/application.entity';
import { UsersService } from '@/services/administration-by-user/users.service';
import { ImagesService } from '@/services/administration-by-user/images.service';

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
    <div className="bg-jcoder-card/80 backdrop-blur-sm border border-jcoder rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl shadow-jcoder-primary/10 hover:shadow-jcoder-primary/20 transition-all duration-500 transform hover:-translate-y-1">
      {/* Application Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-6">
        <div className="flex items-start gap-4 sm:gap-6 min-w-0">
          {application.profileImage ? (
            <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
              <LazyImage
                src={(() => {
                  const userSession = UsersService.getUserSession();
                  const username = userSession?.user?.username || '';
                  return username ? ImagesService.getApplicationProfileImageUrl(username, application.id) : '';
                })()}
                alt={application.name}
                fallback={application.name}
                className="object-cover rounded-2xl shadow-lg"
                size="custom"
                width="w-16 sm:w-20 md:w-24"
                height="h-16 sm:h-20 md:h-24"
              />
            </div>
          ) : application.images && application.images.length > 0 ? (
            <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-300">
              <LazyImage
                src={(() => {
                  const userSession = UsersService.getUserSession();
                  const username = userSession?.user?.username || '';
                  return ImagesService.getApplicationImageUrl(username, application.id, application.images[0]);
                })()}
                alt={application.name}
                fallback={application.name}
                className="object-cover rounded-2xl shadow-lg"
                size="custom"
                width="w-16 sm:w-20 md:w-24"
                height="h-16 sm:h-20 md:h-24"
              />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-jcoder-gradient rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <span className="text-black font-bold text-2xl sm:text-3xl md:text-4xl">
                {getInitial(application.name)}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-jcoder-foreground mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-jcoder-cyan via-jcoder-primary to-jcoder-blue">
              {application.name}
            </h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-jcoder-secondary/50 border border-jcoder-primary/30 rounded-full">
              <span className="text-xs sm:text-sm font-semibold text-jcoder-primary uppercase tracking-wide">
                {application.applicationType}
              </span>
            </div>
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
      <div className="mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-jcoder-foreground mb-4 sm:mb-5 flex items-center gap-2">
          <span className="w-1 h-6 sm:h-8 bg-jcoder-gradient rounded-full"></span>
          <span>Description</span>
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-jcoder-muted leading-relaxed pl-3 sm:pl-4">{application.description}</p>
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
