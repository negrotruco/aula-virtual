
import React from 'react';
import AdminUsuarios from '../components/AdminUsuarios';

const AdminPanel: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Panel de Administración</h2>
  <AdminUsuarios />
  {/* Aquí se gestionan reportes, configuración global, etc. */}
    </div>
  );
};

export default AdminPanel;
