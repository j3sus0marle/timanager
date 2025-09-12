import mongoose from 'mongoose';
import User from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timanager';

async function updateAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Buscar el usuario admin
        const adminUser = await User.findOne({ username: 'admin' });
        
        if (!adminUser) {
            console.log('Usuario admin no encontrado');
            return;
        }

        // Actualizar el flag isAdmin
        adminUser.isAdmin = true;
        await adminUser.save();

        console.log('Usuario admin actualizado correctamente');
        console.log('ID:', adminUser._id);
        console.log('Username:', adminUser.username);
        console.log('isAdmin:', adminUser.isAdmin);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Desconectado de MongoDB');
    }
}

updateAdmin();
