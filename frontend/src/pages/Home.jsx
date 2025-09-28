import React, { useEffect, useState } from 'react';
import { ApplicationCard } from '../components/ApplicationCard';
import { useApplications } from '../contexts/ApplicationContext';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export function Home() {
  const { applications, fetchApplications, isLoading, error } = useApplications();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtrar aplicações baseado no termo de busca
  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando aplicações...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro ao carregar aplicações</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Portfólio de Aplicações
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore e acesse todas as aplicações disponíveis em nosso portfólio
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar aplicações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'Nenhuma aplicação encontrada para sua busca.' : 'Nenhuma aplicação disponível.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          {filteredApplications.length} aplicaç{filteredApplications.length === 1 ? 'ão' : 'ões'} 
          {searchTerm && ` encontrada${filteredApplications.length === 1 ? '' : 's'}`}
        </p>
      </div>
    </div>
  );
}
