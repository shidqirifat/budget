import { Router } from 'express';
import { getAll, create, update, remove, getSubCategories, createSubCategory, getCategoryStats } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { categorySchema } from '../validators/category.validator';

const router = Router();

router.use(authenticate);
router.get('/', getAll);
router.post('/', validate(categorySchema), create);
router.put('/:id', validate(categorySchema), update);
router.delete('/:id', remove);
router.get('/:id/sub-categories', getSubCategories);
router.post('/:id/sub-categories', createSubCategory);
router.get('/:id/stats', getCategoryStats);

export default router;
