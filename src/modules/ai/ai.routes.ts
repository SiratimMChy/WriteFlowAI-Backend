import express from 'express';
import { chat, generateDescription, reviewSummary, draft, rewrite } from './ai.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/chat', chat);
router.post('/generate-description', generateDescription);
router.post('/review-summary', reviewSummary);
router.post('/draft', draft);
router.post('/rewrite', rewrite);

export default router;
