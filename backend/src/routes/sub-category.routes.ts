import { Router } from 'express';
import { update, remove } from '../controllers/sub-category.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.put('/:id', update);
router.delete('/:id', remove);

export default router;
