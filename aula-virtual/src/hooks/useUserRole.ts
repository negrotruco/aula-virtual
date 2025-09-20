import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Usuario } from '../models/types';

export function useUserRole(uid: string | undefined) {
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRol(null);
      setLoading(false);
      return;
    }
    const fetchRole = async () => {
      setLoading(true);
      const ref = doc(db, 'usuarios', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Usuario;
        setRol(data.rol);
      } else {
        setRol(null);
      }
      setLoading(false);
    };
    fetchRole();
  }, [uid]);

  return { rol, loading };
}
