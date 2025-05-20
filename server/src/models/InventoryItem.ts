import mongoose, { Document, Schema } from "mongoose";

export interface IInventoryItem extends Document {
  marca: string;
  modelo: string;
  descripcion: string;
  proveedor: string;
  unidad: string;
  precioUnitario: number;
  cantidad: number;
  numerosSerie: string[]; // Puede ser una lista vacía si no aplica
  categorias: string[];
}

const InventoryItemSchema: Schema = new Schema({
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  descripcion: { type: String, required: true },
  proveedor: { type: String, required: true },
  unidad: { type: String, required: true },
  precioUnitario: { type: Number, required: true },
  cantidad: { type: Number, required: true },
  numerosSerie: { type: [String], default: [] }, // Arreglo de números de serie
  categorias: { type: [String], default: [] },
});

export const InventoryItem = mongoose.model<IInventoryItem>(
  "InventoryItem",
  InventoryItemSchema
);
