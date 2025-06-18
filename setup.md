# Quick Setup Guide

Follow these steps to get the Expense Tracker running locally:

## 1. Install Dependencies

```bash
cd expense-tracker
npm install
```

## 2. Set up PostgreSQL Database

### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE expense_tracker;
   ```
3. Run the migration:
   ```sql
   \c expense_tracker;
   CREATE TABLE IF NOT EXISTS expenses (
     id SERIAL PRIMARY KEY,
     amount DECIMAL(10,2) NOT NULL,
     category VARCHAR(50) NOT NULL,
     description TEXT,
     expense_date DATE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### Option B: Free Cloud PostgreSQL (Recommended)
1. Sign up for a free account at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
2. Create a new database
3. Copy the connection string
4. Run the migration SQL in their web interface

## 3. Configure Environment

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your database URL:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
PORT=4000
NODE_ENV=development
```

## 4. Start the Application

From the root directory:
```bash
npm run dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:4000

## 5. Test the Application

1. Open http://localhost:5173 in your browser
2. Try adding an expense
3. Check that it appears in the list and updates the monthly total

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check that PostgreSQL is running
- Ensure the database exists

### Port Conflicts
- If port 5173 or 4000 is in use, you can change them in:
  - `client/vite.config.js` (frontend port)
  - `server/.env` (backend port)

### Module Import Errors
- Make sure you ran `npm install` in the root directory
- Check that Node.js version is 18 or higher

## Next Steps

Once everything is working:
- Add some sample expenses to see the charts
- Customize categories in `client/src/components/ExpenseForm.jsx`
- Deploy to production using the deployment guide in README.md
