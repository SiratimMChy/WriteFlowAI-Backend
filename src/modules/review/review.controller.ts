import { Request, Response } from 'express';
import { Review } from './review.model';
import { Item } from '../item/item.model';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rating, comment, itemId } = req.body;

    const review = new Review({
      rating,
      comment,
      itemId,
      userId: req.user?._id,
    });

    const createdReview = await review.save();

    // Update item rating and ratingCount
    const reviews = await Review.find({ itemId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    await Item.findByIdAndUpdate(itemId, {
      rating: avgRating,
      ratingCount: numReviews,
    });

    res.status(201).json({ success: true, message: 'Review created', data: createdReview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviewsByItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ itemId: req.params.itemId }).populate('userId', 'name image');
    res.json({ success: true, message: 'Request successful', data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (review) {
      if (review.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        return;
      }
      
      const itemId = review.itemId;
      await Review.findByIdAndDelete(req.params.id);

      // Update item rating and ratingCount
      const reviews = await Review.find({ itemId });
      const numReviews = reviews.length;
      const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

      await Item.findByIdAndUpdate(itemId, {
        rating: avgRating,
        ratingCount: numReviews,
      });

      res.json({ success: true, message: 'Review removed' });
    } else {
      res.status(404).json({ success: false, message: 'Review not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
