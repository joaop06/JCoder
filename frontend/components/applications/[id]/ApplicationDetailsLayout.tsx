import React from 'react';
import { Application } from '@/types/entities/application.entity';

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
    <div className="bg-jcoder-card border border-jcoder rounded-lg p-8 mb-6 shadow-lg hover:shadow-xl hover:shadow-jcoder-primary/20 transition-all duration-300">
      {/* Application Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-16 h-16 bg-jcoder-gradient rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-2xl">
              {getInitial(application.name)}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white mb-2 truncate">
              {application.name}
            </h1>
            <p className="text-sm text-jcoder-muted overflow-hidden text-ellipsis">
              Type: {application.applicationType}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
        <p className="text-jcoder-muted">{application.description}</p>
      </div>

      {/* Technical Information - Common */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Technical Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-jcoder-muted mb-1">ID:</p>
            <p className="text-white">{application.id}</p>
          </div>
          {application.githubUrl && (
            <div>
              <p className="text-sm font-medium text-jcoder-muted mb-1">GitHub URL:</p>
              <a
                href={application.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-jcoder-primary hover:text-jcoder-accent transition-colors break-all"
              >
                {application.githubUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Component-specific details will be rendered here */}
      {children}
    </div>
  );
};

export default ApplicationDetailsLayout;
