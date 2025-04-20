import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema({
  nombre: String,
  correo: String,
  telefono: String,
});

const clienteSchema = new mongoose.Schema({
  compania: String,
  direccion: String,
  personas: [personaSchema], // arreglo de personas
});

const Cliente = mongoose.model('Cliente', clienteSchema);
export default Cliente;
