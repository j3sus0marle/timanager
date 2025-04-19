import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  descripcion: string;
  marca: string;
  modelo: string;
  proveedor: string;
  unidad: "PZA" | "MTS";
  cantidad: number;
  precioUnitario: number;
  categoria: string[]; // <-- CAMBIO AQUÍ
}


const itemSchema = new Schema<IItem>({
  descripcion: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  proveedor: { type: String, required: true },
  unidad: { type: String, enum: ["PZA", "MTS"], required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: { type: Number, required: true },
  categoria: { type: [String], required: true }, 
});

export const Item = mongoose.model<IItem>("Item", itemSchema);
