import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApplications } from '../contexts/ApplicationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';

export function ApplicationDetail() {
  const { id } = useParams();
  const { selectedApplication, fetchApplicationById, isLoading, error } = useApplications();

  useEffect(() => {
    if (id) {
      fetchApplicationById(id);
    }
  }, [id]);

  const handleOpenApp = () => {
    if (selectedApplication?.url) {
      window.open(selectedApplication.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando aplicação...</span>
        </div>
      </div>
    );
  }

  if (error || !selectedApplication) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro ao carregar aplicação</p>
          <p className="text-gray-600 text-sm mb-4">{error || 'Aplicação não encontrada'}</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
        </Link>
      </div>

      {/* Application Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {selectedApplication.icon ? (
                <img 
                  src={selectedApplication.icon} 
                  alt={`${selectedApplication.name} icon`}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center ${selectedApplication.icon ? 'hidden' : 'flex'}`}
              >
                <span className="text-white font-bold text-2xl">
                  {selectedApplication.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">{selectedApplication.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">URL:</span>
                  <a 
                    href={selectedApplication.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {selectedApplication.url}
                  </a>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleOpenApp}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir Aplicação</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Descrição</h3>
              <CardDescription className="text-base leading-relaxed">
                {selectedApplication.description}
              </CardDescription>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Informações Técnicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">ID:</span>
                  <p className="text-sm text-gray-600">{selectedApplication.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">URL:</span>
                  <p className="text-sm text-gray-600 break-all">{selectedApplication.url}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-center">
                <Button 
                  onClick={handleOpenApp}
                  size="lg"
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Acessar {selectedApplication.name}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
