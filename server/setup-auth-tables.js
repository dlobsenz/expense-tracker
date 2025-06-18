import dotenv from "dotenv";
dotenv.config();

import { readFileSync } from "fs";
import { query } from "./src/db.js";

async function setupAuthTables() {
  try {
    console.log("🔧 Setting up authentication tables...");
    
    // Read and execute the migration
    const migration = readFileSync("./migrations/002_create_users.sql", "utf8");
    await query(migration);
    
    console.log("✅ Authentication tables created successfully!");
    console.log("📋 Created tables:");
    console.log("   - users");
    console.log("   - refresh_tokens");
    console.log("   - password_reset_tokens");
    console.log("   - Added user_id to expenses table");
    
  } catch (error) {
    console.error("❌ Error setting up authentication tables:", error.message);
    process.exit(1);
  }
}

setupAuthTables();
