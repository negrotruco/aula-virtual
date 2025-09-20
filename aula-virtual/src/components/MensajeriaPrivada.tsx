import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Mensaje, Usuario } from '../models/types';
import { useAuth } from '../context/AuthContext';

const MensajeriaPrivada: React.FC = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [destinatarioId, setDestinatarioId] = useState('');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      setUsuarios(snapshot.docs.map(doc => doc.data() as Usuario).filter(u => u.uid !== usuario?.uid));
    };
    fetchUsuarios();
  }, [usuario]);

  useEffect(() => {
    if (!usuario || !destinatarioId) return;
    const fetchMensajes = async () => {
      setLoading(true);
      const q = query(
        collection(db, 'mensajes'),
        where('remitenteId', 'in', [usuario.uid, destinatarioId]),
        where('destinatarioId', 'in', [usuario.uid, destinatarioId]),
        orderBy('fecha', 'asc')
      );
      const snapshot = await getDocs(q);
      setMensajes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
      setLoading(false);
    };
    fetchMensajes();
  }, [usuario, destinatarioId]);

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !destinatarioId) return;
    await addDoc(collection(db, 'mensajes'), {
      remitenteId: usuario.uid,
      destinatarioId,
      contenido,
      fecha: new Date().toISOString(),
    });
    setContenido('');
    // Refrescar mensajes
    const q = query(
      collection(db, 'mensajes'),
      where('remitenteId', 'in', [usuario.uid, destinatarioId]),
      where('destinatarioId', 'in', [usuario.uid, destinatarioId]),
      orderBy('fecha', 'asc')
    );
    const snapshot = await getDocs(q);
    setMensajes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mensaje)));
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-2">Mensajería Privada</h3>
      <select value={destinatarioId} onChange={e => setDestinatarioId(e.target.value)} className="mb-2 p-2 border rounded">
        <option value="">Selecciona un usuario</option>
        {usuarios.map(u => (
          <option key={u.uid} value={u.uid}>{u.nombre} ({u.rol})</option>
        ))}
      </select>
      {loading ? (
        <div>Cargando mensajes...</div>
      ) : (
        <ul className="mb-2 max-h-64 overflow-y-auto">
          {mensajes.map(m => (
            <li key={m.id} className={m.remitenteId === usuario?.uid ? 'text-right' : 'text-left'}>
              <span className={m.remitenteId === usuario?.uid ? 'bg-blue-100 px-2 py-1 rounded' : 'bg-gray-200 px-2 py-1 rounded'}>
                {m.contenido} <span className="text-xs text-gray-500">({new Date(m.fecha).toLocaleString()})</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {destinatarioId && (
        <form onSubmit={handleEnviar} className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje"
            value={contenido}
            onChange={e => setContenido(e.target.value)}
            className="p-2 border rounded w-full"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
        </form>
      )}
    </div>
  );
};

export default MensajeriaPrivada;
