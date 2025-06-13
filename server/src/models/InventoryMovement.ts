import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInventoryMovement extends Document {
  itemId: Types.ObjectId; // Referencia a InventoryItem
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: Date;
  comentario?: string; // Nuevo campo opcional
  usuario?: string; // Nuevo campo para el usuario
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  itemId: { type: Schema.Types.ObjectId, ref: "InventoryItem", required: true },
  tipo: { type: String, enum: ["entrada", "salida"], required: true },
  cantidad: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  comentario: { type: String }, // Nuevo campo
  usuario: { type: String }, // Nuevo campo
});

export const InventoryMovement = mongoose.model<IInventoryMovement>(
  "InventoryMovement",
  InventoryMovementSchema
);
