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
