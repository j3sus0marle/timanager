import mongoose, { Document, Schema, Types } from "mongoose";

export interface IInventoryExteriorMovement extends Document {
  itemId: Types.ObjectId;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: Date;
  comentario?: string; // Nuevo campo opcional
  usuario?: string; // Nuevo campo para el usuario
}

const InventoryExteriorMovementSchema = new Schema<IInventoryExteriorMovement>({
  itemId: { type: Schema.Types.ObjectId, ref: "InventoryExteriorItem",  },
  tipo: { type: String, enum: ["entrada", "salida"], },
  cantidad: { type: Number, },
  fecha: { type: Date, default: Date.now },
  comentario: { type: String }, // Nuevo campo
  usuario: { type: String }, // Nuevo campo
});

export const InventoryExteriorMovement = mongoose.model<IInventoryExteriorMovement>(
  "InventoryExteriorMovement",
  InventoryExteriorMovementSchema
);
