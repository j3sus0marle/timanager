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

export interface IDireccionEnvio {
  nombre: string;
  direccion: string;
  telefono?: string;
  contacto?: string;
}

export interface RazonSocial {
  _id?: string;
  nombre: string;
  rfc: string;
  emailEmpresa: string;
  telEmpresa: string;
  celEmpresa: string;
  direccionEmpresa: string;
  emailFacturacion: string;
  direccionEnvio: IDireccionEnvio[];
}

export interface OrdenCompra {
  _id?: string;
  numeroOrden: string;
  numeroCotizacion?: string; // Número de cotización extraído del PDF
  fecha: Date | string;
  proveedor: string | Proveedor;
  razonSocial: string | RazonSocial;
  vendedor?: string | Vendedor;
  datosOrden: any;
  rutaPdf?: string; // Ruta del PDF generado
  createdAt?: string;
  updatedAt?: string;
}

export interface MaterialCanalizacion {
  _id?: string;
  tipo: string;
  material: string;
  medida: string;
  unidad: "PZA" | "MTS";
  proveedor: string;
  precio: number;
  fechaActualizacion: Date | string;
}

export interface CotizacionCanalizacion {
  _id?: string;
  numeroPresupuesto: string;
  cliente: string | Cliente;
  razonSocial?: string | RazonSocial; // Referencia a la razón social (opcional)
  fecha: Date | string;
  vigencia: Date | string;
  subtotal: number;
  utilidad: number; // Porcentaje de utilidad
  total: number;
  estado: "Borrador" | "Enviada" | "Aceptada" | "Rechazada" | "Vencida";
  items: ItemCotizacionCanalizacion[];
  comentarios?: string;
  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;
}

export interface ItemCotizacionCanalizacion {
  _id?: string;
  materialCanalizacion?: string | MaterialCanalizacion; // Referencia al material (opcional)
  descripcion: string;
  cantidad: number;
  unidad: "PZA" | "MTS";
  precioUnitario: number;
  subtotal: number;
}
