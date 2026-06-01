import express from 'express';
import { getStats, getChartData } from './dashboard.controller';
import { protect } from '../../middlewares/auth.middleware';
import { admin } from '../../middlewares/admin.middleware';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/chart-data', getChartData);

export default router;
