import express from 'express';
import { createItem, getItems, getItemById, updateItem, deleteItem } from './item.controller';
import { protect } from '../../middlewares/auth.middleware';
import { admin } from '../../middlewares/admin.middleware';

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(protect, admin, createItem);

router.route('/:id')
  .get(getItemById)
  .patch(protect, admin, updateItem)
  .delete(protect, admin, deleteItem);

export default router;
