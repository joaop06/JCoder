import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, X } from 'lucide-react';

export function ApplicationForm({ 
  application = null, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    icon: '',
  });
  const [error, setError] = useState('');

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (application) {
      setFormData({
        name: application.name || '',
        description: application.description || '',
        url: application.url || '',
        icon: application.icon || '',
      });
    }
  }, [application]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações básicas
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }
    if (!formData.url.trim()) {
      setError('URL é obrigatória');
      return;
    }

    // Validar URL
    try {
      new URL(formData.url);
    } catch {
      setError('URL inválida');
      return;
    }

    const result = await onSubmit(formData);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {application ? 'Editar Aplicação' : 'Nova Aplicação'}
        </CardTitle>
        <CardDescription>
          {application 
            ? 'Atualize as informações da aplicação' 
            : 'Preencha os dados para criar uma nova aplicação'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da aplicação"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva a aplicação..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              name="url"
              type="url"
              required
              value={formData.url}
              onChange={handleChange}
              placeholder="https://exemplo.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">URL do Ícone</Label>
            <Input
              id="icon"
              name="icon"
              type="url"
              value={formData.icon}
              onChange={handleChange}
              placeholder="https://exemplo.com/icon.png (opcional)"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              URL de uma imagem para usar como ícone da aplicação (opcional)
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {application ? 'Atualizar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
