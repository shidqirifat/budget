# Budget — Personal Finance Tracker

A personal finance web app to record income and expenses, organize them by category, and visualize spending over time. Built with a React frontend and an Express + PostgreSQL backend.

---

## Features

- **Transaction Management** — Add, edit, and delete income and expense records with amount, date, note, category, sub-category, and optional event link
- **Categories & Sub-categories** — System-seeded defaults (Food & Drink, Transport, Salary, etc.) plus the ability to create your own per transaction type
- **Budget Events** — Group transactions under named periods (e.g. "Ramadan 2025", "Family Trip") to analyze spending by context
- **Dashboard Summary** — Total inflow, outflow, and net balance for any given month
- **Analytics** — Monthly bar chart and category breakdown pie chart powered by Chart.js
- **Authentication** — JWT-based register/login flow; tokens stored in localStorage and auto-attached to every API request
- **Month Navigation** — Browse transactions by month with previous/next controls; no fixed date range limit

---

## Tech Stack

### Frontend

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | React 18 (Vite)                   |
| Language    | TypeScript                        |
| Styling     | Tailwind CSS                      |
| Routing     | React Router v6                   |
| HTTP Client | Axios                             |
| Charts      | Chart.js + react-chartjs-2        |
| Dates       | Day.js (Indonesian locale)        |
| Auth        | JWT stored in localStorage        |

### Backend

| Layer      | Technology              |
|------------|-------------------------|
| Runtime    | Node.js                 |
| Framework  | Express                 |
| Language   | TypeScript              |
| Database   | PostgreSQL               |
| ORM        | Prisma                  |
| Auth       | JWT (jsonwebtoken)      |
| Validation | Zod                     |
| Password   | bcryptjs                |

---

## Project Structure

```
budget/
├── frontend/
│   ├── src/
│   │   ├── pages/            # Route-level components (Login, Dashboard, Transactions, Reports)
│   │   ├── components/       # Reusable UI (MonthNav, Sidebar, ProtectedRoute)
│   │   ├── services/         # Axios API call functions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # AuthContext (JWT state)
│   │   └── utils/            # dayjs setup, currency/date formatters
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routers
│   │   ├── controllers/      # Route handler logic
│   │   ├── middleware/        # JWT auth, validation, error handler
│   │   └── lib/db.ts         # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── .env
│   └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a remote instance)

### 1. Clone the repo

```bash
git clone <repo-url>
cd budget
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/budget"
JWT_SECRET="your-secret-key"
PORT=4000
```

### 3. Set up the database

```bash
cd backend
npm install
npx prisma migrate dev --name init   # creates tables
npx prisma db seed                   # seeds transaction types and default categories
```

### 4. Start the backend

```bash
npm run dev
# Server running on http://localhost:4000
```

### 5. Configure the frontend

```bash
cd ../frontend
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 6. Start the frontend

```bash
npm install
npm run dev
# App running on http://localhost:5173
```

---

## Seed Data

Running `npx prisma db seed` inserts:

**Transaction types:** `income`, `expense`

**Expense categories:** Food & Drink, Transport, Shopping, Bills, Health, Entertainment, Education, Other — each with default sub-categories

**Income categories:** Salary, Freelance, Investment, Gift, Other — each with default sub-categories

---

## Development Commands

### Backend

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript to dist/
npm run start     # Run compiled production build

npx prisma migrate dev    # Apply schema changes
npx prisma studio         # Open DB browser UI
npx prisma generate       # Regenerate Prisma client after schema edits
npx prisma db seed        # Re-run seed data
```

### Frontend

```bash
npm run dev       # Start Vite dev server on http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```
