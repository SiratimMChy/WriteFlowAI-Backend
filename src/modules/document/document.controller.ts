import { Request, Response } from 'express';
import { DocumentModel } from './document.model';

export const createDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = new DocumentModel({
      ...req.body,
    });
    const createdDocument = await document.save();
    res.status(201).json({ success: true, message: 'Document created', data: createdDocument });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, search, status, page = '1', limit = '10' } = req.query;

    const query: any = {};
    if (userId) query.userId = userId;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (status && status !== 'all') query.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await DocumentModel.countDocuments(query);
    const documents = await DocumentModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      message: 'Request successful',
      data: documents,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findById(req.params.id);
    if (document) {
      res.json({ success: true, message: 'Request successful', data: document });
    } else {
      res.status(404).json({ success: false, message: 'Document not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (document) {
      res.json({ success: true, message: 'Document updated', data: document });
    } else {
      res.status(404).json({ success: false, message: 'Document not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await DocumentModel.findByIdAndDelete(req.params.id);
    if (document) {
      res.json({ success: true, message: 'Document removed' });
    } else {
      res.status(404).json({ success: false, message: 'Document not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
