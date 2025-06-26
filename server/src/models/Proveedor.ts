import mongoose, { Schema, Document } from 'mongoose';

export interface IContactoProveedor {
  nombre: string;
  puesto: string;
  correo: string;
  telefono: string;
  extension?: string;
}

export interface IProveedor extends Document {
  empresa: string;
  direccion: string;
  telefono: string;
  contactos: IContactoProveedor[];
}

const ContactoProveedorSchema: Schema = new Schema({
  nombre: { type: String,  },
  puesto: { type: String,  },
  correo: { type: String,  },
  telefono: { type: String,  },
  extension: { type: String }
});

const ProveedorSchema: Schema = new Schema({
  empresa: { type: String,  },
  direccion: { type: String,  },
  telefono: { type: String,  },
  contactos: { type: [ContactoProveedorSchema], default: [] }
}, {
  timestamps: true
});

export default mongoose.model<IProveedor>('Proveedor', ProveedorSchema);
