import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

const router = express.Router();

// Registro de usuario
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contraseña requeridos' });
    return;
  }
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(409).json({ message: 'El usuario ya existe' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// Login de usuario
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, username });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Middleware de autenticación
import { NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }
  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) {
      res.status(403).json({ message: 'Token inválido' });
      return;
    }
    (req as any).user = user;
    next();
  });
}

// POST /update-user
router.post('/update-user', authMiddleware, async (req: Request, res: Response) => {
  const { username, newUsername, password, newPassword } = req.body;
  if (!username) {
    res.status(400).json({ message: 'Usuario actual requerido' });
    return;
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    // Cambiar solo el nombre de usuario
    if (newUsername && newUsername !== username && !password && !newPassword) {
      const exists = await User.findOne({ username: newUsername });
      if (exists) {
        res.status(409).json({ message: 'El nuevo usuario ya existe' });
        return;
      }
      user.username = newUsername;
      await user.save();
      res.json({ message: 'Nombre de usuario actualizado correctamente' });
      return;
    }
    // Cambiar contraseña (requiere password y newPassword)
    if (password && newPassword) {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(401).json({ message: 'Contraseña actual incorrecta' });
        return;
      }
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
      res.json({ message: 'Contraseña actualizada correctamente' });
      return;
    }
    res.status(400).json({ message: 'Datos insuficientes para actualizar' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

export default router;
