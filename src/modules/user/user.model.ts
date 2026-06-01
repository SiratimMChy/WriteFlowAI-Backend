import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: 'USER' | 'ADMIN';
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'banned';
  bio?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    googleId: { type: String, select: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    plan: { type: String, enum: ['free', 'pro', 'team'], default: 'free' },
    status: { type: String, enum: ['active', 'banned'], default: 'active' },
    bio: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
