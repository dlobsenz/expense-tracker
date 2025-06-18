import dotenv from "dotenv";
dotenv.config();

import { query } from "./src/db.js";

async function testConnection() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Loaded" : "❌ Not found");
    console.log("First 50 chars:", process.env.DATABASE_URL?.substring(0, 50) + "...");
    const result = await query("SELECT NOW() as current_time");
    console.log("✅ Database connection successful!");
    console.log("Current time from database:", result.rows[0].current_time);
    
    // Test if expenses table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'expenses'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log("✅ Expenses table exists!");
      
      // Count existing expenses
      const count = await query("SELECT COUNT(*) FROM expenses");
      console.log(`📊 Current expenses in database: ${count.rows[0].count}`);
    } else {
      console.log("❌ Expenses table does not exist!");
      console.log("Run this SQL to create it:");
      console.log(`
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`);
    }
    
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error("Error:", error.message);
    console.error("\nPossible solutions:");
    console.error("1. Check your DATABASE_URL in server/.env");
    console.error("2. Make sure PostgreSQL is running");
    console.error("3. Verify the database exists");
    console.error("4. Check network connectivity if using cloud database");
  }
  
  process.exit(0);
}

testConnection();
