import React from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import LinkDisplayBlock from './LinkDisplayBlock';
import { ApplicationComponentFrontend } from '@/types/entities/application-component-frontend.entity';

interface ApplicationFrontendDetailsProps {
  frontendDetails: ApplicationComponentFrontend;
}

const ApplicationFrontendDetails: React.FC<ApplicationFrontendDetailsProps> = ({ frontendDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-jcoder">
      <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">Frontend Details</h3>
      <div className="space-y-4">
        <LinkDisplayBlock
          label="Frontend URL"
          url={frontendDetails.frontendUrl}
          icon={
            <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          }
          actionLabel="Access"
          actionIcon={
            <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          }
        />
        {frontendDetails.screenshotUrl && (
          <div>
            <LinkDisplayBlock
              label="Screenshot URL"
              url={frontendDetails.screenshotUrl}
              icon={
                <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              actionLabel="View Screenshot"
              actionIcon={
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              className="mb-4"
            />
            <div className="border border-jcoder rounded-lg overflow-hidden">
              <img src={frontendDetails.screenshotUrl} alt="Frontend Screenshot" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationFrontendDetails;
