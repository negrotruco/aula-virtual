
import HomePage from './pages/HomePage';
import EstudiantePanel from './pages/EstudiantePanel';
import DocentePanel from './pages/DocentePanel';
import AdminPanel from './pages/AdminPanel';
import { AuthProvider, useAuth } from './context/AuthContext';


import { useUserRole } from './hooks/useUserRole';

const AppRouter: React.FC = () => {
  const { usuario, loading } = useAuth();
  const { rol, loading: loadingRol } = useUserRole(usuario?.uid);

  if (loading || loadingRol) return <div>Cargando...</div>;
  if (!usuario) return <HomePage />;

  if (rol === 'estudiante') return <EstudiantePanel />;
  if (rol === 'docente') return <DocentePanel />;
  if (rol === 'admin') return <AdminPanel />;

  return <div>Rol no reconocido</div>;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
