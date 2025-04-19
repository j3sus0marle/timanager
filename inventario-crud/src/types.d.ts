export interface IItem {
  _id?: string;
  descripcion: string;
  marca: string;
  modelo: string;
  proveedor: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  categoria: string[];
}
