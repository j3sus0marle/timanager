import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  descripcion: string;
  marca: string;
  modelo: string;
  proveedor: string;
  unidad: "PZA" | "MTS";
  precioUnitario: number;
}


const itemSchema = new Schema<IItem>({
  descripcion: { type: String, required: true },
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  proveedor: { type: String, required: true },
  unidad: { type: String, enum: ["PZA", "MTS"], required: true },
  precioUnitario: { type: Number, required: true }
});

export const Item = mongoose.model<IItem>("Item", itemSchema);
