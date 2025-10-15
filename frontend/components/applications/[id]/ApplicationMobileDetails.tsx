import React from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import { ApplicationComponentMobile } from '@/types/entities/application-component-mobile.entity';

interface ApplicationMobileDetailsProps {
  mobileDetails: ApplicationComponentMobile;
}

const ApplicationMobileDetails: React.FC<ApplicationMobileDetailsProps> = ({ mobileDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Application Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Platform:</p>
          <p className="text-gray-900">{mobileDetails.platform}</p>
        </div>
        {mobileDetails.downloadUrl && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Download URL:</p>
            <div className="flex items-center gap-2">
              <a
                href={mobileDetails.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {mobileDetails.downloadUrl}
              </a>
              <CopyToClipboardButton textToCopy={mobileDetails.downloadUrl} />
              <a
                href={mobileDetails.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationMobileDetails;
