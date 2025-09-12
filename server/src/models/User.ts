import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string; // hashed
  isAdmin: boolean;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
});

export type UserDocument = mongoose.Document & IUser;

const User = mongoose.model<UserDocument>('User', UserSchema);
export default User;
