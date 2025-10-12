import React, { useEffect, useState } from 'react';
import CopyToClipboardButton from './CopyToClipboardButton';
import { ApplicationComponentApi } from '@/types/entities/application-component-api.entity';

interface ApplicationApiDetailsProps {
  apiDetails: ApplicationComponentApi;
}

const ApplicationApiDetails: React.FC<ApplicationApiDetailsProps> = ({ apiDetails }) => {
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkHealth = async () => {
      if (!apiDetails.healthCheckEndpoint) return;

      try {
        const response = await fetch(apiDetails.healthCheckEndpoint);
        if (response.ok) {
          setHealthStatus('ok');
        } else {
          setHealthStatus('error');
        }
      } catch (error) {
        setHealthStatus('error');
      }
    };

    if (apiDetails.healthCheckEndpoint) {
      checkHealth(); // Initial check
      intervalId = setInterval(checkHealth, 30000); // Check every 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiDetails.healthCheckEndpoint]);

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API Detalhes</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Domain:</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 break-all">{apiDetails.domain}</p>
            <CopyToClipboardButton textToCopy={apiDetails.domain} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">URL:</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-900 break-all">{apiDetails.apiUrl}</p>
            <CopyToClipboardButton textToCopy={apiDetails.apiUrl} />
          </div>
        </div>
        {apiDetails.healthCheckEndpoint && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Endpoint de Health Check:</p>
            <div className="flex items-center gap-2">
              <p className="text-gray-900 break-all">{apiDetails.healthCheckEndpoint}</p>
              <CopyToClipboardButton textToCopy={apiDetails.healthCheckEndpoint} />
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold
                  ${healthStatus === 'ok' ? 'bg-green-100 text-green-800'
                    : healthStatus === 'error' ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'}`}
              >
                {healthStatus === 'ok' ? 'OK' : healthStatus === 'error' ? 'Erro' : 'Verificando...'}
              </span>
            </div>
          </div>
        )}
        {apiDetails.documentationUrl && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Documentation:</p>
            <div className="flex items-center gap-2 mb-2">
              <a
                href={apiDetails.documentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {apiDetails.documentationUrl}
              </a>
              <CopyToClipboardButton textToCopy={apiDetails.documentationUrl} />
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={apiDetails.documentationUrl}
                title="Documentação da API"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationApiDetails;

