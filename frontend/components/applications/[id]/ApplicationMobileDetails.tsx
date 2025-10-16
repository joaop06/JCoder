import React from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import LinkDisplayBlock from './LinkDisplayBlock';
import { ApplicationComponentMobile } from '@/types/entities/application-component-mobile.entity';

interface ApplicationMobileDetailsProps {
  mobileDetails: ApplicationComponentMobile;
}

const ApplicationMobileDetails: React.FC<ApplicationMobileDetailsProps> = ({ mobileDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-jcoder">
      <h3 className="text-lg font-semibold text-white mb-4">Mobile Application Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-jcoder-muted mb-1">Platform:</p>
          <p className="text-white">{mobileDetails.platform}</p>
        </div>
        {mobileDetails.downloadUrl && (
          <LinkDisplayBlock
            label="Download URL"
            url={mobileDetails.downloadUrl}
            icon={
              <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            actionLabel="Download"
            actionIcon={
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationMobileDetails;
