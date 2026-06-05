import express from 'express';
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
} from './document.controller';

const router = express.Router();

router.route('/').post(createDocument).get(getDocuments);
router.route('/:id').get(getDocumentById).patch(updateDocument).delete(deleteDocument);

export default router;
