import { FileTransferObject } from '@ionic-native/file-transfer/ngx';

export interface RespuestaPosts {
  ok: boolean;
  pagina: number;
  posts: Post[];
}

export interface Post {
  imgs?: string[];
  _id?: string;
  mensaje?: string;
  coords?: string;
  usuario?: Usuario;
  created?: string;
}

export interface Usuario {
  rol?: string;
  estado: boolean;
  google: boolean;
  nombre?: string;
  correo?: string;
  uid?: string;
  password?: string;
  avatar?: string;
}

export interface Respuesta {
  ok?: boolean;
  msg?: string;
}

