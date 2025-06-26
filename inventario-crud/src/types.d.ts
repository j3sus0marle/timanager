export interface IItem {
  _id?: string;
  descripcion: string;
  marca: string;
  modelo: string;
  proveedor: string;
  unidad: string;
  precioUnitario: number;
}

export interface Vendedor {
  _id?: string;
  nombre: string;
  correo: string;
  telefono: string;
}

export interface IInventoryItem {
  _id?: string;
  descripcion: string;
  marca: string;
  modelo: string;
  proveedor: string;
  unidad: string;
  precioUnitario: number;
  cantidad: number;
  numerosSerie: string[];
  categorias: string[];
}

export interface IInventoryMovement {
  _id?: string;
  itemId: any; // Puede ser objeto o string
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
  comentario?: string;
  usuario?: string;
}

export interface Persona {
  nombre: string;
  correo: string;
  telefono: string;
}

export interface IContacto {
  nombre: string;
  puesto: string;
  contacto: {
    correo: string;
    telefono: string;
    extension?: string;
  };
}

export interface Cliente {
  _id?: string;
  nombreEmpresa: string;
  direccion: string;
  telefono: string;
  contactos: IContacto[];
}

export interface Guia {
  _id?: string;
  numeroGuia: string;
  proveedor: string;
  paqueteria: string;
  fechaPedido: string;
  fechaLlegada: string;
  proyectos: string[];
  estado: 'entregado' | 'no entregado' | 'en transito' | 'atrasado';
  comentarios?: string; // Nuevo campo
}

export interface IContactoProveedor {
  nombre: string;
  puesto: string;
  correo: string;
  telefono: string;
  extension?: string;
}

export interface Proveedor {
  _id?: string;
  empresa: string;
  direccion: string;
  telefono: string;
  contactos: IContactoProveedor[];
}
