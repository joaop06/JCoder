import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Plus, Search } from 'lucide-react';

export function EmptyState({ 
  icon: Icon = Package, 
  title, 
  description, 
  action, 
  actionLabel,
  type = 'default' 
}) {
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: 'Nenhum resultado encontrado',
          description: 'Tente ajustar sua busca ou limpar os filtros.'
        };
      case 'applications':
        return {
          icon: Package,
          title: 'Nenhuma aplicação disponível',
          description: 'Ainda não há aplicações cadastradas no portfólio.'
        };
      default:
        return {
          icon: Icon,
          title: title || 'Nenhum item encontrado',
          description: description || 'Não há itens para exibir no momento.'
        };
    }
  };

  const content = getDefaultContent();
  const FinalIcon = Icon || content.icon;
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FinalIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {finalTitle}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md">
        {finalDescription}
      </p>
      {action && actionLabel && (
        <Button onClick={action} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  );
}
