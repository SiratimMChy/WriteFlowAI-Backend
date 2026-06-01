import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  image?: string;
  category: string;
  location?: string;
  price: number;
  rating: number;
  ratingCount: number;
  usageCount: number;
  tone?: string;
  wordCount?: number;
  prompt: string;
  sampleOutput?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    category: { type: String, required: true },
    location: { type: String },
    price: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
    tone: { type: String },
    wordCount: { type: Number },
    prompt: { type: String, required: true },
    sampleOutput: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Item = mongoose.model<IItem>('Item', itemSchema);
