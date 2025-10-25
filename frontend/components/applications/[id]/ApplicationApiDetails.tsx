import React, { useEffect, useState } from 'react';
import CopyToClipboardButton from '@/components/clipboard/CopyToClipboardButton';
import LinkDisplayBlock from './LinkDisplayBlock';
import { ApplicationComponentApi } from '@/types/entities/application-component-api.entity';

// Retry function for external API health checks
const retryFetch = async (url: string, maxRetries: number = 3): Promise<Response> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

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
        const response = await retryFetch(apiDetails.healthCheckEndpoint);
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
    <div className="mt-6 pt-6 border-t border-jcoder">
      <h3 className="text-lg font-semibold text-jcoder-foreground mb-4">API Details</h3>
      <div className="space-y-4">
        <LinkDisplayBlock
          label="Domain"
          url={apiDetails.domain}
          icon={
            <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          }
          showActionButton={false}
        />

        <LinkDisplayBlock
          label="API URL"
          url={apiDetails.apiUrl}
          icon={
            <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          actionLabel="Access"
        />

        {apiDetails.healthCheckEndpoint && (
          <div className="bg-jcoder-card border border-jcoder rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-jcoder-muted mb-1">Health Check Endpoint</p>
                  <p className="text-jcoder-foreground break-all text-sm">{apiDetails.healthCheckEndpoint}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <CopyToClipboardButton
                  textToCopy={apiDetails.healthCheckEndpoint}
                  label="Copy"
                />

                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${healthStatus === 'ok' ? 'status-active'
                      : healthStatus === 'error' ? 'status-inactive'
                        : 'bg-jcoder-secondary text-jcoder-muted border border-jcoder'}`}
                >
                  {healthStatus === 'ok' ? 'OK' : healthStatus === 'error' ? 'Error' : 'Checking...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {apiDetails.documentationUrl && (
          <div>
            <LinkDisplayBlock
              label="Documentation"
              url={apiDetails.documentationUrl}
              icon={
                <svg className="w-5 h-5 text-jcoder-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              actionLabel="View Docs"
              className="mb-4"
            />
            <div className="border border-jcoder rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={apiDetails.documentationUrl}
                title="API Documentation"
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