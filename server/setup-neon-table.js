import dotenv from "dotenv";
dotenv.config();

import { query } from "./src/db.js";

async function setupTable() {
  try {
    console.log("🔧 Setting up expenses table in Neon database...");
    
    // Create the expenses table
    await query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("✅ Expenses table created successfully!");
    
    // Check if table exists and show count
    const result = await query("SELECT COUNT(*) FROM expenses");
    console.log(`📊 Current expenses in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error("❌ Failed to setup table:", error.message);
  }
  
  process.exit(0);
}

setupTable();
