# Quick Database Setup - Fix "Failed to add expense" Error

The error occurs because the database connection in `server/.env` has placeholder values. Here are two quick solutions:

## Option 1: Free Cloud Database (Recommended - 2 minutes)

1. **Go to [Neon.tech](https://neon.tech)** and create a free account
2. **Create a new project** (choose any name like "expense-tracker")
3. **Copy the connection string** they provide (looks like: `postgresql://username:password@host/database`)
4. **Update your `server/.env` file** with the real connection string:
   ```env
   DATABASE_URL=postgresql://your_real_connection_string_here
   PORT=4000
   NODE_ENV=development
   ```
5. **In Neon's SQL Editor**, run this command to create the table:
   ```sql
   CREATE TABLE IF NOT EXISTS expenses (
     id SERIAL PRIMARY KEY,
     amount DECIMAL(10,2) NOT NULL,
     category VARCHAR(50) NOT NULL,
     description TEXT,
     expense_date DATE NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Option 2: Local PostgreSQL

1. **Install PostgreSQL** on your Mac:
   ```bash
   brew install postgresql
   brew services start postgresql
   ```
2. **Create database**:
   ```bash
   createdb expense_tracker
   ```
3. **Update `server/.env`**:
   ```env
   DATABASE_URL=postgresql://localhost:5432/expense_tracker
   PORT=4000
   NODE_ENV=development
   ```
4. **Create the table**:
   ```bash
   psql expense_tracker -f server/migrations/001_create_expenses.sql
   ```

## After Setup

1. **Restart the server**:
   ```bash
   npm run dev
   ```
2. **Try adding an expense** - it should work now!

## If Still Having Issues

Check the server console for detailed error messages. The improved error logging will show exactly what's wrong.
