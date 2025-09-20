import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Tarea, Curso, EntregaTarea } from '../models/types';
import { useAuth } from '../context/AuthContext';

const CalificarTareas: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState('');
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!usuario) return;
    const fetchCursos = async () => {
      const q = query(collection(db, 'cursos'), where('docenteId', '==', usuario.uid));
      const snapshot = await getDocs(q);
      setCursos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curso)));
    };
    fetchCursos();
  }, [usuario]);

  useEffect(() => {
    if (!cursoId) return;
    const fetchTareas = async () => {
      setLoading(true);
      const q = query(collection(db, 'tareas'), where('cursoId', '==', cursoId));
      const snapshot = await getDocs(q);
      setTareas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tarea)));
      setLoading(false);
    };
    fetchTareas();
  }, [cursoId]);

  const handleCalificar = async (tareaId: string, estudianteId: string, calificacion: number, retroalimentacion: string) => {
    const tareaRef = doc(db, 'tareas', tareaId);
    const tareaSnap = await (await import('firebase/firestore')).getDoc(tareaRef);
    const tareaData = tareaSnap.data() as Tarea;
    const nuevasEntregas = tareaData.entregas.map((entrega: EntregaTarea) =>
      entrega.estudianteId === estudianteId
        ? { ...entrega, calificacion, retroalimentacion }
        : entrega
    );
    await updateDoc(tareaRef, { entregas: nuevasEntregas });
    setMensaje('Calificación guardada');
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-2">Calificar Entregas</h3>
      <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="mb-2 p-2 border rounded">
        <option value="">Selecciona un curso</option>
        {cursos.map(curso => (
          <option key={curso.id} value={curso.id}>{curso.nombre}</option>
        ))}
      </select>
      {loading ? (
        <div>Cargando tareas...</div>
      ) : (
        <ul>
          {tareas.map(tarea => (
            <li key={tarea.id} className="mb-4 border-b pb-2">
              <span className="font-semibold">{tarea.titulo}</span>
              <ul className="ml-4 mt-2">
                {tarea.entregas && tarea.entregas.length > 0 ? (
                  tarea.entregas.map((entrega: EntregaTarea) => (
                    <li key={entrega.estudianteId} className="mb-2">
                      <span>Estudiante: {entrega.estudianteId}</span>
                      <form
                        onSubmit={e => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const calificacion = Number((form.elements.namedItem('calificacion') as HTMLInputElement).value);
                          const retroalimentacion = (form.elements.namedItem('retroalimentacion') as HTMLInputElement).value;
                          handleCalificar(tarea.id, entrega.estudianteId, calificacion, retroalimentacion);
                        }}
                        className="flex gap-2 mt-1"
                      >
                        <input
                          type="number"
                          name="calificacion"
                          min="0"
                          max="100"
                          defaultValue={entrega.calificacion ?? ''}
                          placeholder="Calificación"
                          className="p-1 border rounded w-20"
                          required
                        />
                        <input
                          type="text"
                          name="retroalimentacion"
                          defaultValue={entrega.retroalimentacion ?? ''}
                          placeholder="Retroalimentación"
                          className="p-1 border rounded"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">Guardar</button>
                        {entrega.calificacion !== undefined && (
                          <span className="ml-2 text-green-600">Calificado</span>
                        )}
                      </form>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Sin entregas</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {mensaje && <div className="text-green-600 mt-2">{mensaje}</div>}
    </div>
  );
};

export default CalificarTareas;
