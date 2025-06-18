import express from "express";
import { query } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/expenses - List all expenses for authenticated user
router.get("/", async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC, created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST /api/expenses - Add a new expense for authenticated user
router.post("/", async (req, res) => {
  const { amount, category, description, expense_date } = req.body;
  if (
    typeof amount !== "number" ||
    !category ||
    !expense_date ||
    isNaN(new Date(expense_date))
  ) {
    return res.status(400).json({ error: "Invalid expense data" });
  }
  try {
    const result = await query(
      `INSERT INTO expenses (amount, category, description, expense_date, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [amount, category, description || "", expense_date, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding expense:", err);
    res.status(500).json({ error: "Failed to add expense", details: err.message });
  }
});

// DELETE /api/expenses/:id - Delete an expense for authenticated user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// GET /api/expenses/stats - Analytics for authenticated user
router.get("/stats", async (req, res) => {
  try {
    // Total spent this month
    const totalResult = await query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM expenses
       WHERE user_id = $1 AND date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)`,
      [req.user.id]
    );
    // Spending by category
    const categoryResult = await query(
      `SELECT category, COALESCE(SUM(amount),0) AS total
       FROM expenses
       WHERE user_id = $1 AND date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)
       GROUP BY category`,
      [req.user.id]
    );
    // Recent expenses (last 10)
    const recentResult = await query(
      `SELECT * FROM expenses WHERE user_id = $1 ORDER BY expense_date DESC, created_at DESC LIMIT 10`,
      [req.user.id]
    );
    res.json({
      totalThisMonth: parseFloat(totalResult.rows[0].total),
      byCategory: categoryResult.rows.map(row => ({
        category: row.category,
        total: parseFloat(row.total)
      })),
      recent: recentResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
