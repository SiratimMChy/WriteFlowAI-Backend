import { Request, Response } from 'express';
import { Item } from './item.model';

export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = new Item({
      ...req.body,
      createdBy: req.user?._id,
    });
    const createdItem = await item.save();
    res.status(201).json({ success: true, message: 'Item created', data: createdItem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, rating, priceMin, priceMax, sort, page = '1', limit = '10' } = req.query;

    const query: any = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (rating) query.rating = { $gte: Number(rating) };
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    let sortObj: any = { createdAt: -1 };
    if (sort) {
      const sortStr = sort as string;
      const sortField = sortStr.startsWith('-') ? sortStr.substring(1) : sortStr;
      const sortOrder = sortStr.startsWith('-') ? -1 : 1;
      sortObj = { [sortField]: sortOrder };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Request successful',
      data: items,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('createdBy', 'name email');
    if (item) {
      res.json({ success: true, message: 'Request successful', data: item });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (item) {
      res.json({ success: true, message: 'Item updated', data: item });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (item) {
      res.json({ success: true, message: 'Item removed' });
    } else {
      res.status(404).json({ success: false, message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
