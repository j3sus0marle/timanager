import mongoose, { Schema, Document } from 'mongoose';

export interface IDireccionEnvio {
  nombre: string;
  direccion: string;
  telefono?: string;
  contacto?: string;
}

export interface IRazonSocial extends Document {
  nombre: string;
  rfc: string;
  emailEmpresa: string;
  telEmpresa: string;
  celEmpresa: string;
  direccionEmpresa: string;
  emailFacturacion: string;
  direccionEnvio: IDireccionEnvio[];
}

const DireccionEnvioSchema: Schema = new Schema({
  nombre: { type: String,  },
  direccion: { type: String,  },
  telefono: { type: String },
  contacto: { type: String }
});

const RazonSocialSchema: Schema = new Schema({
  nombre: { type: String,  },
  rfc: { type: String, unique: true },
  emailEmpresa: { type: String,  },
  telEmpresa: { type: String,  },
  celEmpresa: { type: String,  },
  direccionEmpresa: { type: String,  },
  emailFacturacion: { type: String,  },
  direccionEnvio: { type: [DireccionEnvioSchema], default: [] }
}, {
  timestamps: true
});

export default mongoose.model<IRazonSocial>('RazonSocial', RazonSocialSchema);
