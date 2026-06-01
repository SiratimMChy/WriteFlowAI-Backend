import express from 'express';
import { chat, generateDescription, reviewSummary } from './ai.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.post('/generate-description', generateDescription);
router.post('/review-summary', reviewSummary);

export default router;
