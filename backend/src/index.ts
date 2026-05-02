import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import transactionTypeRoutes from './routes/transaction-type.routes';
import categoryRoutes from './routes/category.routes';
import subCategoryRoutes from './routes/sub-category.routes';
import eventRoutes from './routes/event.routes';
import transactionRoutes from './routes/transaction.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transaction-types', transactionTypeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sub-categories', subCategoryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
