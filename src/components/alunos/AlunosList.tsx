import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlunoForm } from './AlunoForm';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2, Search, UserPlus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  data_nascimento: string;
  created_at: string;
}

export const AlunosList = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alunoToDelete, setAlunoToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlunos();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = alunos.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAlunos(filtered);
    } else {
      setFilteredAlunos(alunos);
    }
  }, [searchTerm, alunos]);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar alunos',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { nome: string; email: string; data_nascimento: string }) => {
    try {
      const { error } = await supabase.from('alunos').insert({
        ...data,
        created_by: user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Aluno criado!',
        description: 'O aluno foi cadastrado com sucesso.',
      });

      fetchAlunos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar aluno',
        description: error.message,
      });
    }
  };

  const handleUpdate = async (data: { nome: string; email: string; data_nascimento: string }) => {
    if (!editingAluno) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .update(data)
        .eq('id', editingAluno.id);

      if (error) throw error;

      toast({
        title: 'Aluno atualizado!',
        description: 'As informações foram atualizadas com sucesso.',
      });

      setEditingAluno(null);
      fetchAlunos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar aluno',
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (!alunoToDelete) return;

    try {
      const { error } = await supabase.from('alunos').delete().eq('id', alunoToDelete);

      if (error) throw error;

      toast({
        title: 'Aluno excluído',
        description: 'O aluno foi removido com sucesso.',
      });

      fetchAlunos();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir aluno',
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setAlunoToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    setAlunoToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Alunos Cadastrados</h2>
          <p className="text-muted-foreground">Gerencie os alunos da sua instituição</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg">
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Aluno
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando alunos...</p>
        </div>
      ) : filteredAlunos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum aluno encontrado com esse termo.' : 'Nenhum aluno cadastrado ainda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlunos.map((aluno) => (
            <Card key={aluno.id} className="hover:shadow-[var(--shadow-hover)] transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{aluno.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{aluno.email}</p>
                <p className="text-sm text-muted-foreground">
                  Nascimento: {new Date(aluno.data_nascimento).toLocaleDateString('pt-BR')}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingAluno(aluno);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => confirmDelete(aluno.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlunoForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingAluno(null);
        }}
        onSubmit={editingAluno ? handleUpdate : handleCreate}
        initialData={editingAluno ? {
          nome: editingAluno.nome,
          email: editingAluno.email,
          data_nascimento: editingAluno.data_nascimento
        } : undefined}
        isEdit={!!editingAluno}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};