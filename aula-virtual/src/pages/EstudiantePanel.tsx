import React from 'react';



import CursosEstudiante from '../components/CursosEstudiante';

import ForosCurso from '../components/ForosCurso';

import MensajeriaPrivada from '../components/MensajeriaPrivada';
import MaterialesCurso from '../components/MaterialesCurso';


import TareasEstudiante from '../components/TareasEstudiante';

const EstudiantePanel: React.FC = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Panel de Estudiante</h2>
      <CursosEstudiante />
  <TareasEstudiante />
  <ForosCurso />
  <MensajeriaPrivada />
  <MaterialesCurso />
  {/* Fin del panel de estudiante */}
    </div>
  );
};

export default EstudiantePanel;
