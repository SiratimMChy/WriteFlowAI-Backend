import express from 'express';
import { getStats, getChartData, getPublicStats } from './dashboard.controller';
import { protect } from '../../middlewares/auth.middleware';
import { admin } from '../../middlewares/admin.middleware';

const router = express.Router();

// Public route — no auth required
router.get('/public-stats', getPublicStats);

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/chart-data', getChartData);

export default router;
