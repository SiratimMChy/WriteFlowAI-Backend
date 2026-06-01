import express from 'express';
import { createReview, getReviewsByItem, deleteReview } from './review.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
  .post(protect, createReview);

router.route('/item/:itemId')
  .get(getReviewsByItem);

router.route('/:id')
  .delete(protect, deleteReview);

export default router;
