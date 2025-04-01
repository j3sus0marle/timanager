import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
  nombre: string;
  descripcion: string
  cantidad: number;
  precio: number;
}

const itemSchema = new Schema<IItem>({
  nombre: { type: String, required: true },
  descripcion: {type: String, required: true},
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
});

export const Item = mongoose.model<IItem>("Item", itemSchema);
