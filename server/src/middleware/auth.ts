import { RequestHandler, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Types, Document } from 'mongoose';
import { IUser } from '../models/User';
import User from '../models/User';

import { UserDocument } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

interface JwtPayload {
  id: string;
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'No token proporcionado' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado' });
      return;
    }

    console.log('Usuario autenticado:', {
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin
    });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
    return;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Verificando permisos de administrador:', {
    user: req.user?.username,
    isAdmin: req.user?.isAdmin
  });

  if (!req.user?.isAdmin) {
    console.log('Acceso denegado: usuario no es administrador');
    res.status(403).json({ message: 'Acceso denegado: se requieren privilegios de administrador' });
    return;
  }
  
  console.log('Usuario autorizado como administrador');
  next();
};
