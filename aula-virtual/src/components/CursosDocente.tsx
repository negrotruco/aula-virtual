import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Curso } from '../models/types';
import { useAuth } from '../context/AuthContext';

const CursosDocente: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const fetchCursos = async () => {
      setLoading(true);
      const q = query(collection(db, 'cursos'), where('docenteId', '==', usuario.uid));
      const snapshot = await getDocs(q);
      setCursos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curso)));
      setLoading(false);
    };
    fetchCursos();
  }, [usuario]);

  const handleAddCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    await addDoc(collection(db, 'cursos'), {
      nombre,
      descripcion,
      docenteId: usuario.uid,
      estudiantes: [],
    });
    setNombre('');
    setDescripcion('');
    // Refrescar lista
    const q = query(collection(db, 'cursos'), where('docenteId', '==', usuario.uid));
    const snapshot = await getDocs(q);
    setCursos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curso)));
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'cursos', id));
    setCursos(cursos.filter(c => c.id !== id));
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Mis Cursos</h3>
      <form onSubmit={handleAddCurso} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Nombre del curso"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
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
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Agregar</button>
      </form>
      {loading ? (
        <div>Cargando cursos...</div>
      ) : (
        <ul>
          {cursos.map(curso => (
            <li key={curso.id} className="mb-2 flex justify-between items-center border-b pb-1">
              <span>{curso.nombre} - {curso.descripcion}</span>
              <button onClick={() => handleDelete(curso.id)} className="text-red-600">Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CursosDocente;
