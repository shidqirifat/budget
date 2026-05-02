import { Router } from 'express';
import { getAll } from '../controllers/transaction-type.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getAll);

export default router;
