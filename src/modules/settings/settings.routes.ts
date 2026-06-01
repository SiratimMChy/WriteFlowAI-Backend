import express from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { protect } from '../../middlewares/auth.middleware';
import { admin } from '../../middlewares/admin.middleware';

const router = express.Router();

// Public: frontend maintenance-guard reads this
router.get('/', getSettings);

// Admin only: update settings
router.put('/', protect, admin, updateSettings);

export default router;
