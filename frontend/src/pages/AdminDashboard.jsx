import React, { useEffect, useState } from 'react';
import { useApplications } from '../contexts/ApplicationContext';
import { ApplicationForm } from '../components/ApplicationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Loader2,
  AlertTriangle 
} from 'lucide-react';

export function AdminDashboard() {
  const { 
    applications, 
    fetchApplications, 
    createApplication, 
    updateApplication, 
    deleteApplication, 
    isLoading, 
    error 
  } = useApplications();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreateApplication = async (formData) => {
    const result = await createApplication(formData);
    if (result.success) {
      setIsFormOpen(false);
      setSuccess('Aplicação criada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
    return result;
  };

  const handleUpdateApplication = async (formData) => {
    const result = await updateApplication(editingApplication.id, formData);
    if (result.success) {
      setIsFormOpen(false);
      setEditingApplication(null);
      setSuccess('Aplicação atualizada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
    return result;
  };

  const handleDeleteApplication = async (id) => {
    setDeletingId(id);
    const result = await deleteApplication(id);
    if (result.success) {
      setSuccess('Aplicação removida com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setDeletingId(null);
  };

  const openCreateForm = () => {
    setEditingApplication(null);
    setIsFormOpen(true);
  };

  const openEditForm = (application) => {
    setEditingApplication(application);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingApplication(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">
          Gerencie as aplicações do seu portfólio
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Aplicações</CardDescription>
            <CardTitle className="text-3xl">{applications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aplicações Ativas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{applications.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Última Atualização</CardDescription>
            <CardTitle className="text-lg">Hoje</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Applications Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Aplicações</CardTitle>
              <CardDescription>
                Gerencie todas as aplicações do portfólio
              </CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateForm} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nova Aplicação</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingApplication ? 'Editar Aplicação' : 'Nova Aplicação'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingApplication 
                      ? 'Atualize as informações da aplicação' 
                      : 'Preencha os dados para criar uma nova aplicação'
                    }
                  </DialogDescription>
                </DialogHeader>
                <ApplicationForm
                  application={editingApplication}
                  onSubmit={editingApplication ? handleUpdateApplication : handleCreateApplication}
                  onCancel={closeForm}
                  isLoading={isLoading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && applications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando aplicações...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhuma aplicação cadastrada</p>
              <Button onClick={openCreateForm}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira aplicação
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        {application.icon ? (
                          <img 
                            src={application.icon} 
                            alt={`${application.name} icon`}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {application.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span>{application.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={application.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-1"
                      >
                        <span className="truncate max-w-xs">{application.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-xs block">
                        {application.description}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(application)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteApplication(application.id)}
                          disabled={deletingId === application.id}
                          className="text-red-600 hover:text-red-700"
                        >
                          {deletingId === application.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
