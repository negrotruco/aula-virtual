import React from 'react';


import CursosDocente from '../components/CursosDocente';



import TareasDocente from '../components/TareasDocente';

import CalificarTareas from '../components/CalificarTareas';

import ForosCurso from '../components/ForosCurso';

import MensajeriaPrivada from '../components/MensajeriaPrivada';
import MaterialesCurso from '../components/MaterialesCurso';

const DocentePanel: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Panel de Docente</h2>
  <CursosDocente />
  <TareasDocente />
  <CalificarTareas />
  <ForosCurso />
  <MensajeriaPrivada />
  <MaterialesCurso />
  {/* Fin del panel de docente */}
    </div>
  );
};

export default DocentePanel;
