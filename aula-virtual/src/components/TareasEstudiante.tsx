import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Tarea, Curso, EntregaTarea } from '../models/types';
import { useAuth } from '../context/AuthContext';

const TareasEstudiante: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState('');
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!usuario) return;
    const fetchCursos = async () => {
      const snapshot = await getDocs(collection(db, 'cursos'));
      const cursosInscritos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Curso))
        .filter(curso => curso.estudiantes.includes(usuario.uid));
      setCursos(cursosInscritos);
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

  const handleEntrega = async (tareaId: string) => {
    if (!usuario) return;
    // Simulación: solo guarda el nombre del archivo, no sube a storage
    const entrega: EntregaTarea = {
      estudianteId: usuario.uid,
      archivoUrl: archivo ? archivo.name : '',
    };
  const tareaRef = doc(db, 'tareas', tareaId);
  const tareaSnap = await (await import('firebase/firestore')).getDoc(tareaRef);
  const tareaData = tareaSnap.data() as Tarea;
  const nuevasEntregas = tareaData.entregas ? [...tareaData.entregas, entrega] : [entrega];
  await updateDoc(tareaRef, { entregas: nuevasEntregas });
  setMensaje('¡Entrega realizada! (Simulación, falta integración con Storage)');
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-2">Tareas por Curso</h3>
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
            <li key={tarea.id} className="mb-2 border-b pb-1">
              <span className="font-semibold">{tarea.titulo}</span> - {tarea.descripcion} (Entrega: {tarea.fechaEntrega})
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleEntrega(tarea.id);
                }}
                className="flex gap-2 mt-2"
              >
                <input
                  type="file"
                  onChange={e => setArchivo(e.target.files ? e.target.files[0] : null)}
                  className="p-2 border rounded"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">Entregar</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {mensaje && <div className="text-green-600 mt-2">{mensaje}</div>}
    </div>
  );
};

export default TareasEstudiante;
