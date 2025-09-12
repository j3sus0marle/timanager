import { Request } from 'express';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: Types.ObjectId };
    }
  }
}

export interface AuthRequest extends Request {
  user: IUser & {
    _id: Types.ObjectId;
  };
}
