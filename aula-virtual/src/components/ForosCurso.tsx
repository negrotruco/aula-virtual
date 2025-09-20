import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Foro, ForoMensaje, Curso } from '../models/types';
import { useAuth } from '../context/AuthContext';

const ForosCurso: React.FC = () => {
  const { usuario } = useAuth();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState('');
  const [foros, setForos] = useState<Foro[]>([]);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [foroId, setForoId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const fetchCursos = async () => {
      // Mostrar cursos donde el usuario es estudiante o docente
      const snapshot = await getDocs(collection(db, 'cursos'));
      const cursosUsuario = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Curso))
        .filter(curso => curso.estudiantes.includes(usuario.uid) || curso.docenteId === usuario.uid);
      setCursos(cursosUsuario);
    };
    fetchCursos();
  }, [usuario]);

  useEffect(() => {
    if (!cursoId) return;
    const fetchForos = async () => {
      setLoading(true);
      const q = query(collection(db, 'foros'), where('cursoId', '==', cursoId));
      const snapshot = await getDocs(q);
      setForos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Foro)));
      setLoading(false);
    };
    fetchForos();
  }, [cursoId]);

  const handleCrearForo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoId) return;
    await addDoc(collection(db, 'foros'), {
      cursoId,
      titulo,
      mensajes: [],
    });
    setTitulo('');
    // Refrescar foros
    const q = query(collection(db, 'foros'), where('cursoId', '==', cursoId));
    const snapshot = await getDocs(q);
    setForos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Foro)));
  };

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foroId || !usuario) return;
    const foroRef = doc(db, 'foros', foroId);
    const foroSnap = await (await import('firebase/firestore')).getDoc(foroRef);
    const foroData = foroSnap.data() as Foro;
    const nuevo: ForoMensaje = {
      id: Date.now().toString(),
      autorId: usuario.uid,
      contenido: nuevoMensaje,
      fecha: new Date().toISOString(),
    };
    const nuevosMensajes = foroData.mensajes ? [...foroData.mensajes, nuevo] : [nuevo];
    await updateDoc(foroRef, { mensajes: nuevosMensajes });
    setNuevoMensaje('');
    // Refrescar foros
    const q = query(collection(db, 'foros'), where('cursoId', '==', cursoId));
    const snapshot = await getDocs(q);
    setForos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Foro)));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-2">Foros de Curso</h3>
      <select value={cursoId} onChange={e => setCursoId(e.target.value)} className="mb-2 p-2 border rounded">
        <option value="">Selecciona un curso</option>
        {cursos.map(curso => (
          <option key={curso.id} value={curso.id}>{curso.nombre}</option>
        ))}
      </select>
      {cursoId && (
        <form onSubmit={handleCrearForo} className="mb-4 flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Título del foro"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Crear Foro</button>
        </form>
      )}
      {loading ? (
        <div>Cargando foros...</div>
      ) : (
        <ul>
          {foros.map(foro => (
            <li key={foro.id} className="mb-4 border-b pb-2">
              <span className="font-semibold">{foro.titulo}</span>
              <ul className="ml-4 mt-2">
                {foro.mensajes && foro.mensajes.length > 0 ? (
                  foro.mensajes.map((msg: ForoMensaje) => (
                    <li key={msg.id} className="mb-1">
                      <span className="font-bold">{msg.autorId}:</span> {msg.contenido} <span className="text-xs text-gray-500">({msg.fecha})</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">Sin mensajes</li>
                )}
              </ul>
              <form
                onSubmit={e => {
                  setForoId(foro.id);
                  setTimeout(() => handleEnviarMensaje(e), 0);
                }}
                className="flex gap-2 mt-2"
              >
                <input
                  type="text"
                  placeholder="Escribe un mensaje"
                  value={foroId === foro.id ? nuevoMensaje : ''}
                  onChange={e => {
                    setForoId(foro.id);
                    setNuevoMensaje(e.target.value);
                  }}
                  className="p-2 border rounded"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">Enviar</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ForosCurso;
