import { Request, Response } from 'express';
import { Booking } from './booking.model';
import { Item } from '../item/item.model';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId, quantity = 1 } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    const price = item.price * quantity;

    const booking = new Booking({
      userId: req.user?._id,
      itemId,
      quantity,
      price,
    });

    const createdBooking = await booking.save();
    
    // Update item usageCount
    item.usageCount += 1;
    await item.save();

    res.status(201).json({ success: true, message: 'Booking created', data: createdBooking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = req.user?.role === 'ADMIN' ? {} : { userId: req.user?._id };
    const bookings = await Booking.find(filter)
      .populate('itemId', 'title image category')
      .populate('userId', 'name email');
    
    res.json({ success: true, message: 'Request successful', data: bookings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      if (booking.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      booking.status = req.body.status || booking.status;
      const updatedBooking = await booking.save();

      res.json({ success: true, message: 'Booking updated', data: updatedBooking });
    } else {
      res.status(404).json({ success: false, message: 'Booking not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      if (booking.userId.toString() !== req.user?._id.toString() && req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }
      
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Booking removed' });
    } else {
      res.status(404).json({ success: false, message: 'Booking not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
