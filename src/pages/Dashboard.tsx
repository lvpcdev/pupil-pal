import { Header } from '@/components/dashboard/Header';
import { AlunosList } from '@/components/alunos/AlunosList';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />
      <AlunosList />
    </div>
  );
};

export default Dashboard;