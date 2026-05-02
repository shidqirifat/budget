# Budget Transaction Tracker

## Project Overview

A personal finance web app to record income and expenses, organize them by category, and visualize spending over time with charts and reports. The app is split into a separate frontend and backend.

## Tech Stack

### Frontend (`/frontend`)
| Layer | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| HTTP Client | Axios |
| Auth | JWT (stored in localStorage) |

### Backend (`/backend`)
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |

## Project Structure

```
budget/
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route-level components (Login, Dashboard, Transactions, Reports)
│   │   ├── components/
│   │   │   ├── ui/           # Reusable primitives (Button, Input, Modal)
│   │   │   └── transactions/ # Transaction-specific components
│   │   ├── hooks/            # Custom React hooks (useAuth, useTransactions)
│   │   ├── services/         # Axios API call functions
│   │   ├── context/          # AuthContext (JWT state)
│   │   ├── utils/            # Formatting helpers (currency, date)
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routers (auth, transactions)
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/        # JWT auth middleware, error handler
│   │   ├── lib/
│   │   │   └── db.ts         # Prisma client singleton
│   │   └── index.ts          # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
```

## Database Schema

```prisma
model User {
  id              String          @id @default(cuid())
  email           String          @unique
  name            String?
  password        String          // bcrypt hashed
  transactions    Transaction[]
  categories      Category[]
  subCategories   SubCategory[]
  events          Event[]
  createdAt       DateTime        @default(now())
}

// Seeded system types + user cannot modify these
model TransactionType {
  id           String        @id @default(cuid())
  name         String        @unique // "income" | "expense"
  transactions Transaction[]
  categories   Category[]
}

model Category {
  id            String          @id @default(cuid())
  name          String
  typeId        String
  type          TransactionType @relation(fields: [typeId], references: [id])
  userId        String?         // null = system/seeded, set = user-created
  user          User?           @relation(fields: [userId], references: [id])
  subCategories SubCategory[]
  transactions  Transaction[]
  createdAt     DateTime        @default(now())

  @@unique([name, typeId, userId])
}

model SubCategory {
  id           String        @id @default(cuid())
  name         String
  categoryId   String
  category     Category      @relation(fields: [categoryId], references: [id])
  userId       String?       // null = system/seeded, set = user-created
  user         User?         @relation(fields: [userId], references: [id])
  transactions Transaction[]
  createdAt    DateTime      @default(now())

  @@unique([name, categoryId, userId])
}

// Named budget period (e.g. "Ramadan 2025", "Family Trip June")
model Event {
  id           String        @id @default(cuid())
  name         String
  description  String?
  startDate    DateTime
  endDate      DateTime?
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model Transaction {
  id            String          @id @default(cuid())
  amount        Float
  typeId        String
  type          TransactionType @relation(fields: [typeId], references: [id])
  categoryId    String
  category      Category        @relation(fields: [categoryId], references: [id])
  subCategoryId String?
  subCategory   SubCategory?    @relation(fields: [subCategoryId], references: [id])
  eventId       String?         // optional — link to a budget event
  event         Event?          @relation(fields: [eventId], references: [id])
  date          DateTime
  note          String?
  userId        String
  user          User            @relation(fields: [userId], references: [id])
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

### Seed Data

`TransactionType`: `income`, `expense`

**Expense categories (seeded, `userId = null`):**
- Food & Drink → Restaurant, Groceries, Coffee
- Transport → Fuel, Public Transit, Parking
- Shopping → Clothing, Electronics, Household
- Bills → Electricity, Water, Internet, Rent
- Health → Medicine, Doctor, Gym
- Entertainment → Movies, Streaming, Games
- Education → Books, Courses, Stationery
- Other

**Income categories (seeded, `userId = null`):**
- Salary → Base Salary, Bonus
- Freelance → Project, Consultation
- Investment → Dividends, Capital Gain
- Gift
- Other

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL="postgresql://user:password@localhost:5432/budget"
JWT_SECRET="your-jwt-secret-here"
PORT=4000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000/api
```

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev              # ts-node-dev, restarts on change
npm run build            # tsc compile to dist/

npx prisma migrate dev   # Apply schema changes
npx prisma studio        # DB browser UI
npx prisma generate      # Regenerate client after schema edit
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # Vite dev server on http://localhost:5173
npm run build            # Production build to dist/
npm run lint             # ESLint check
```

## API Routes (Backend)

```
POST   /api/auth/register              # Create account
POST   /api/auth/login                 # Returns JWT token

GET    /api/transaction-types          # List income/expense types (seeded)

GET    /api/categories                 # List (system + user's own, supports ?typeId=)
POST   /api/categories                 # Create user-defined category
PUT    /api/categories/:id             # Update (own only)
DELETE /api/categories/:id             # Delete (own only)

GET    /api/categories/:id/sub-categories       # List sub-categories
POST   /api/categories/:id/sub-categories       # Create sub-category
PUT    /api/sub-categories/:id                  # Update (own only)
DELETE /api/sub-categories/:id                  # Delete (own only)

GET    /api/events                     # List user's events
POST   /api/events                     # Create event
PUT    /api/events/:id                 # Update
DELETE /api/events/:id                 # Delete

GET    /api/transactions               # List (supports ?typeId=&categoryId=&eventId=&from=&to=)
POST   /api/transactions               # Create
PUT    /api/transactions/:id           # Update
DELETE /api/transactions/:id           # Delete
GET    /api/transactions/summary       # Totals and chart data
```

All routes except `auth` require `Authorization: Bearer <token>` header.

## Auth Flow

1. User logs in → backend validates credentials, returns signed JWT
2. Frontend stores JWT in `localStorage`, attaches it via Axios interceptor
3. Backend `authMiddleware` verifies JWT on every protected route, injects `req.userId`

## Key Features

- **Transaction CRUD** — add, edit, delete records linked to type, category, sub-category, and optional event
- **Categories & Sub-categories** — seeded defaults + user can create custom ones per transaction type
- **Events** — named budget periods (e.g. "Ramadan 2025") to group and filter transactions
- **Dashboard** — summary cards (total income, total expenses, balance)
- **Reports** — monthly bar chart and category pie chart using Chart.js

## Conventions

- **File naming**: `kebab-case` for files, `PascalCase` for React components
- **API responses**: always `{ data, message }` shape; errors `{ error }` with appropriate HTTP status
- **Prisma client**: import only from `backend/src/lib/db.ts`, never instantiate directly
- **Formatting**: amounts in IDR — `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`
- **Dates**: store as UTC in DB, display in local timezone using `date-fns`

## Default Categories

**Expense**: Food & Drink, Transport, Shopping, Bills, Health, Entertainment, Education, Other  
**Income**: Salary, Freelance, Investment, Gift, Other
