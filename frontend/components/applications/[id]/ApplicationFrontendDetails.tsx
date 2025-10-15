import React from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import { ApplicationComponentFrontend } from '@/types/entities/application-component-frontend.entity';

interface ApplicationFrontendDetailsProps {
  frontendDetails: ApplicationComponentFrontend;
}

const ApplicationFrontendDetails: React.FC<ApplicationFrontendDetailsProps> = ({ frontendDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Frontend Details</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Frontend URL:</p>
          <div className="flex items-center gap-2">
            <a
              href={frontendDetails.frontendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {frontendDetails.frontendUrl}
            </a>
            <CopyToClipboardButton textToCopy={frontendDetails.frontendUrl} />
            <a
              href={frontendDetails.frontendUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Access
            </a>
          </div>
        </div>
        {frontendDetails.screenshotUrl && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Screenshot URL:</p>
            <div className="flex items-center gap-2">
              <a
                href={frontendDetails.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {frontendDetails.screenshotUrl}
              </a>
              <CopyToClipboardButton textToCopy={frontendDetails.screenshotUrl} />
              <a
                href={frontendDetails.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                Access
              </a>
            </div>
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <img src={frontendDetails.screenshotUrl} alt="Frontend Screenshot" className="w-full h-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationFrontendDetails;
