import React from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import { ApplicationComponentLibrary } from '@/types/entities/application-component-library.entity';

interface ApplicationLibraryDetailsProps {
  libraryDetails: ApplicationComponentLibrary;
}

const ApplicationLibraryDetails: React.FC<ApplicationLibraryDetailsProps> = ({ libraryDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-jcoder">
      <h3 className="text-lg font-semibold text-white mb-4">Library Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-jcoder-muted mb-1">Package Manager URL:</p>
          <div className="flex items-center gap-2">
            <a
              href={libraryDetails.packageManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-jcoder-primary hover:text-jcoder-accent transition-colors break-all"
            >
              {libraryDetails.packageManagerUrl}
            </a>
            <CopyToClipboardButton textToCopy={libraryDetails.packageManagerUrl} />
            <a
              href={libraryDetails.packageManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-jcoder-primary text-jcoder-primary rounded-md text-sm font-medium hover:bg-jcoder-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-jcoder-primary transition-colors"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Access
            </a>
          </div>
        </div>
        {libraryDetails.readmeContent && (
          <div>
            <p className="text-sm font-medium text-jcoder-muted mb-1">README Content:</p>
            <div className="border border-jcoder rounded-lg p-4 bg-jcoder-secondary overflow-auto max-h-96">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {libraryDetails.readmeContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationLibraryDetails;
