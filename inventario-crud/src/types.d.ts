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
}

export interface Persona {
  nombre: string;
  correo: string;
  telefono: string;
}

export interface Cliente {
  _id?: string;
  compania: string;
  direccion: string;
  personas: Persona[];
}
