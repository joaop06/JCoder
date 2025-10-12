import React from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import { ApplicationComponentLibrary } from '@/types/entities/application-component-library.entity';

interface ApplicationLibraryDetailsProps {
  libraryDetails: ApplicationComponentLibrary;
}

const ApplicationLibraryDetails: React.FC<ApplicationLibraryDetailsProps> = ({ libraryDetails }) => {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Biblioteca</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">URL do Gerenciador de Pacotes:</p>
          <div className="flex items-center gap-2">
            <a
              href={libraryDetails.packageManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {libraryDetails.packageManagerUrl}
            </a>
            <CopyToClipboardButton textToCopy={libraryDetails.packageManagerUrl} />
            <a
              href={libraryDetails.packageManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              Acessar
            </a>
          </div>
        </div>
        {libraryDetails.readmeContent && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Conteúdo do README:</p>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
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
