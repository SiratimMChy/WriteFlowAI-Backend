import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  title: string;
  content: string;
  status: string; // draft, published, archived
  type: string; // rewrite, draft, blog, etc
  wordCount: number;
  userId: string; // Using string to map from NextAuth PostgreSQL user ID
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, default: 'draft' },
    type: { type: String, default: 'draft' },
    wordCount: { type: Number, default: 0 },
    userId: { type: String, required: true }, // Store NextAuth user ID
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);
