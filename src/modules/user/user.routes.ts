import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser, updateUserRole } from './user.controller';
import { protect } from '../../middlewares/auth.middleware';
import { admin } from '../../middlewares/admin.middleware';

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers);

router.route('/role')
  .patch(protect, admin, updateUserRole);

router.route('/:id')
  .get(protect, getUserById)
  .patch(protect, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
