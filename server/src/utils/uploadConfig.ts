import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear la carpeta de uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
const fotografiasDir = path.join(uploadDir, 'fotografias');

// Asegurarse de que existan las carpetas
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(fotografiasDir)) {
    fs.mkdirSync(fotografiasDir);
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fotografiasDir);
    },
    filename: function (req, file, cb) {
        // Generar un nombre único usando timestamp y un número aleatorio
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Mantener la extensión original del archivo
        cb(null, 'foto-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes (jpeg, png, gif, webp)'));
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

export default upload;
