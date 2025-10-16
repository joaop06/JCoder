import React from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import LinkDisplayBlock from './LinkDisplayBlock';
import { ApplicationComponentLibrary } from '@/types/entities/application-component-library.entity';

interface ApplicationLibraryDetailsProps {
  libraryDetails: ApplicationComponentLibrary;
}

const ApplicationLibraryDetails: React.FC<ApplicationLibraryDetailsProps> = ({ libraryDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-jcoder">
      <h3 className="text-lg font-semibold text-white mb-4">Library Details</h3>
      <div className="space-y-4">
        <LinkDisplayBlock
          label="Package Manager URL"
          url={libraryDetails.packageManagerUrl}
          icon={
            <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          actionLabel="Access"
          actionIcon={
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          }
        />
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
