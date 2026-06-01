import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  maintenanceMode: boolean;
  siteName: string;
  siteDescription: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    maintenanceMode: { type: Boolean, default: false },
    siteName: { type: String, default: 'WriteFlow AI' },
    siteDescription: { type: String, default: 'AI-powered writing platform' },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
