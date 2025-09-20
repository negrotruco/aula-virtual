export type Rol = 'estudiante' | 'docente' | 'admin';

export interface Usuario {
  uid: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface Curso {
  id: string;
  nombre: string;
  descripcion: string;
  docenteId: string;
  estudiantes: string[];
}

export interface Tarea {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  fechaEntrega: string;
  entregas: EntregaTarea[];
}

export interface EntregaTarea {
  estudianteId: string;
  archivoUrl: string;
  calificacion?: number;
  retroalimentacion?: string;
}

export interface Mensaje {
  id: string;
  remitenteId: string;
  destinatarioId: string;
  contenido: string;
  fecha: string;
}

export interface Foro {
  id: string;
  cursoId: string;
  titulo: string;
  mensajes: ForoMensaje[];
}

export interface ForoMensaje {
  id: string;
  autorId: string;
  contenido: string;
  fecha: string;
}
