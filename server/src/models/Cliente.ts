import mongoose, { Schema, Document } from 'mongoose';

export interface IContacto {
  nombre: string;
  puesto: string;
  contacto: {
    correo: string;
    telefono: string;
    extension?: string;
  };
}

export interface ICliente extends Document {
  nombreEmpresa: string;
  direccion: string;
  telefono: string;
  contactos: IContacto[];
}

const ContactoSchema: Schema = new Schema({
  nombre: { type: String },
  puesto: { type: String },
  contacto: {
    correo: { type: String },
    telefono: { type: String },
    extension: { type: String }
  }
});

const ClienteSchema: Schema = new Schema({
  nombreEmpresa: { type: String },
  direccion: { type: String },
  telefono: { type: String },
  contactos: { type: [ContactoSchema], default: [] }
});

export default mongoose.model<ICliente>('Cliente', ClienteSchema);
