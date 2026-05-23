import { Router } from 'express';
import { getAll, getSummary, getAnalytics, create, update, remove, patchEvent, importTransactions, exportTransactions } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { transactionSchema } from '../validators/transaction.validator';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);
router.get('/export', exportTransactions);
router.post('/import', importTransactions);
router.post('/', validate(transactionSchema), create);
router.put('/:id', validate(transactionSchema), update);
router.patch('/:id/event', patchEvent);
router.delete('/:id', remove);

export default router;
