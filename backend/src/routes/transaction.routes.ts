import { Router } from 'express';
import { getAll, getSummary, getAnalytics, create, update, remove } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { transactionSchema } from '../validators/transaction.validator';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.get('/summary', getSummary);
router.get('/analytics', getAnalytics);
router.post('/', validate(transactionSchema), create);
router.put('/:id', validate(transactionSchema), update);
router.delete('/:id', remove);

export default router;
