import express from 'express';
import { createBooking, getBookings, updateBooking, deleteBooking } from './booking.controller';
import { protect } from '../../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createBooking)
  .get(getBookings);

router.route('/:id')
  .patch(updateBooking)
  .delete(deleteBooking);

export default router;
