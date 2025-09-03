import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Colaborador from '../src/models/Colaborador';

dotenv.config();

async function updateEmployeeIds() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log('Conectado a MongoDB');

        // Obtener todos los colaboradores ordenados por fecha de creación
        const colaboradores = await Colaborador.find().sort({ createdAt: 1 });
        
        console.log(`Encontrados ${colaboradores.length} colaboradores para actualizar`);

        // Actualizar cada colaborador con un nuevo número secuencial
        for (let i = 0; i < colaboradores.length; i++) {
            const newId = i + 1;
            const oldId = colaboradores[i].numeroEmpleado;
            
            await Colaborador.findByIdAndUpdate(
                colaboradores[i]._id,
                { numeroEmpleado: newId }
            );
            
            console.log(`Actualizado colaborador: ${oldId} -> ${newId}`);
        }

        console.log('Actualización completada');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateEmployeeIds();
