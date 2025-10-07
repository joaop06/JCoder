'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useParams, useRouter } from 'next/navigation';
import { Application } from '@/types/entities/application.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';

// Mock data - será substituído por chamada à API
const mockApplication: Application = {
  id: 1,
  userId: 1,
  name: 'Interpreter',
  description: 'Api do aplicativo de finanças pessoais MyMoney',
  applicationType: ApplicationTypeEnum.Api,
  isActive: true,
  githubUrl: 'https://github.com/example/interpreter',
  applicationComponentApi: {
    applicationId: 1,
    domain: 'api.interpreter.com',
    apiUrl: 'https://api.interpreter.com',
    documentationUrl: 'https://api.interpreter.com/docs',
    healthCheckEndpoint: '/health',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const application = mockApplication; // Substituir por fetch da API

  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getMainUrl = () => {
    if (application.applicationComponentFrontend) {
      return application.applicationComponentFrontend.frontendUrl;
    }
    if (application.applicationComponentApi) {
      return application.applicationComponentApi.apiUrl;
    }
    if (application.applicationComponentMobile) {
      return application.applicationComponentMobile.downloadUrl;
    }
    if (application.applicationComponentLibrary) {
      return application.applicationComponentLibrary.packageManagerUrl;
    }
    return null;
  };

  const mainUrl = getMainUrl();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuth={true} isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>

          {/* Application Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-2xl">{getInitial(application.name)}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {application.name}
                  </h1>
                  {mainUrl && (
                    <p className="text-sm text-gray-600">URL: {mainUrl}</p>
                  )}
                </div>
              </div>

              {mainUrl && (
                <a
                  href={mainUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir Aplicação
                </a>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
              <p className="text-gray-700">{application.description}</p>
            </div>

            {/* Technical Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Técnicas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">ID:</p>
                  <p className="text-gray-900">{application.id}</p>
                </div>
                {mainUrl && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">URL:</p>
                    <p className="text-gray-900 truncate">{mainUrl}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Component-specific details */}
            {application.applicationComponentApi && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da API</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Domínio:</p>
                    <p className="text-gray-900">{application.applicationComponentApi.domain}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Documentação:</p>
                    <a
                      href={application.applicationComponentApi.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {application.applicationComponentApi.documentationUrl}
                    </a>
                  </div>
                  {application.applicationComponentApi.healthCheckEndpoint && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Health Check:</p>
                      <p className="text-gray-900">{application.applicationComponentApi.healthCheckEndpoint}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Access Button */}
            {application.applicationComponentApi && (
              <div className="mt-6">
                <a
                  href={application.applicationComponentApi.apiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Acessar {application.name}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
