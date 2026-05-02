import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { eventSchema } from '../validators/event.validator';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', validate(eventSchema), create);
router.put('/:id', validate(eventSchema), update);
router.delete('/:id', remove);

export default router;
