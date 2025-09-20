import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Tarea, Curso } from '../models/types';
import { useAuth } from '../context/AuthContext';

const TareasDocente: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cursoId, setCursoId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleAddTarea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoId) return;
    await addDoc(collection(db, 'tareas'), {
      cursoId,
      titulo,
      descripcion,
      fechaEntrega,
      entregas: [],
    });
    setTitulo('');
    setDescripcion('');
    setFechaEntrega('');
    // Refrescar lista
    const q = query(collection(db, 'tareas'), where('cursoId', '==', cursoId));
    const snapshot = await getDocs(q);
    setTareas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tarea)));
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
      {cursoId && (
        <form onSubmit={handleAddTarea} className="mb-4 flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <input
            type="date"
            value={fechaEntrega}
            onChange={e => setFechaEntrega(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Agregar Tarea</button>
        </form>
      )}
      {loading ? (
        <div>Cargando tareas...</div>
      ) : (
        <ul>
          {tareas.map(tarea => (
            <li key={tarea.id} className="mb-2 border-b pb-1">
              <span className="font-semibold">{tarea.titulo}</span> - {tarea.descripcion} (Entrega: {tarea.fechaEntrega})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TareasDocente;
