import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInventoryExteriorItem extends Document {
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

const InventoryExteriorItemSchema = new Schema<IInventoryExteriorItem>({
  descripcion: { type: String },
  marca: { type: String },
  modelo: { type: String },
  proveedor: { type: String },
  unidad: { type: String },
  precioUnitario: { type: Number },
  cantidad: { type: Number },
  numerosSerie: { type: [String], default: [] },
  categorias: { type: [String], default: [] },
});

export const InventoryExteriorItem = mongoose.model<IInventoryExteriorItem>(
  "InventoryExteriorItem",
  InventoryExteriorItemSchema
);
