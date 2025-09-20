import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Curso } from '../models/types';
import { useAuth } from '../context/AuthContext';

const CursosEstudiante: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [inscritos, setInscritos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const fetchCursos = async () => {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'cursos'));
      setCursos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curso)));
      setLoading(false);
    };
    fetchCursos();
  }, [usuario]);

  useEffect(() => {
    if (!usuario) return;
    // Buscar cursos donde el estudiante ya está inscrito
    const fetchInscritos = async () => {
      const snapshot = await getDocs(collection(db, 'cursos'));
      const inscritos = snapshot.docs.filter(docSnap => {
        const data = docSnap.data() as Curso;
        return data.estudiantes && data.estudiantes.includes(usuario.uid);
      }).map(docSnap => docSnap.id);
      setInscritos(inscritos);
    };
    fetchInscritos();
  }, [usuario, cursos]);

  const handleInscribirse = async (cursoId: string) => {
    if (!usuario) return;
    const ref = doc(db, 'cursos', cursoId);
    await updateDoc(ref, {
      estudiantes: arrayUnion(usuario.uid),
    });
    setInscritos([...inscritos, cursoId]);
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-2">Cursos Disponibles</h3>
      {loading ? (
        <div>Cargando cursos...</div>
      ) : (
        <ul>
          {cursos.map(curso => (
            <li key={curso.id} className="mb-2 flex justify-between items-center border-b pb-1">
              <span>{curso.nombre} - {curso.descripcion}</span>
              {inscritos.includes(curso.id) ? (
                <span className="text-green-600 font-semibold">Inscrito</span>
              ) : (
                <button onClick={() => handleInscribirse(curso.id)} className="bg-blue-600 text-white px-2 py-1 rounded">Inscribirse</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CursosEstudiante;
