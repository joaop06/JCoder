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
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6 shadow-sm">
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
            <p className="text-sm text-gray-600 overflow-hidden text-ellipsis">
              Tipo: {application.applicationType}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
        <p className="text-gray-700">{application.description}</p>
      </div>

      {/* Technical Information - Common */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Técnicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">ID:</p>
            <p className="text-gray-900">{application.id}</p>
          </div>
          {application.githubUrl && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">GitHub URL:</p>
              <a
                href={application.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
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
