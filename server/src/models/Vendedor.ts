import mongoose, { Schema, Document } from 'mongoose';

export interface IVendedor extends Document {
  nombre: string;
  correo: string;
  telefono: string;
}

const VendedorSchema = new Schema<IVendedor>({
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
});

export default mongoose.model<IVendedor>('Vendedor', VendedorSchema);
