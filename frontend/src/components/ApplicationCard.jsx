import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';

export function ApplicationCard({ application }) {
  const handleOpenApp = () => {
    window.open(application.url, '_blank');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {application.icon ? (
              <img 
                src={application.icon} 
                alt={`${application.name} icon`}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center ${application.icon ? 'hidden' : 'flex'}`}
            >
              <span className="text-white font-bold text-lg">
                {application.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {application.name}
              </CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-gray-600 mb-4 line-clamp-3">
          {application.description}
        </CardDescription>
        
        <div className="flex items-center justify-between">
          <Link to={`/application/${application.id}`}>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Ver detalhes</span>
            </Button>
          </Link>
          
          <Button 
            onClick={handleOpenApp}
            size="sm"
            className="flex items-center space-x-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
