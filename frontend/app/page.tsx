'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ApplicationCard from '@/components/ApplicationCard';
import { Application } from '@/types/entities/application.entity';
import { ApplicationTypeEnum } from '@/types/enums/application-type.enum';

// Mock data - será substituído por chamadas à API
const mockApplications: Application[] = [
  {
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
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [applications] = useState<Application[]>(mockApplications);

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header showAuth={true} isAdmin={false} />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Application Portfolio
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore and access all the applications available in our portfolio
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search for applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Applications Grid */}
        <div className="max-w-5xl mx-auto">
          {filteredApplications.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {filteredApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>

              {/* Pagination Info */}
              <div className="text-center text-sm text-gray-600">
                {filteredApplications.length} application(s) found
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No applications found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
