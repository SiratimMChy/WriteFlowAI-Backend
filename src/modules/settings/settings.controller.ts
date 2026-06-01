import { Request, Response } from 'express';
import { Settings } from './settings.model';

// Helper: get or create the single settings document
const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

// GET /api/settings  — public
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/settings  — admin only
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await getOrCreateSettings();

    if (typeof req.body.maintenanceMode === 'boolean') {
      settings.maintenanceMode = req.body.maintenanceMode;
    }
    if (req.body.siteName !== undefined) {
      settings.siteName = req.body.siteName;
    }
    if (req.body.siteDescription !== undefined) {
      settings.siteDescription = req.body.siteDescription;
    }

    const updated = await settings.save();
    res.json({ success: true, message: 'Settings updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
