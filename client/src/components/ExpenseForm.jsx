import React, { useState } from "react";
import axios from "axios";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"];

function ExpenseForm({ onAdd }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [expenseDate, setExpenseDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/expenses", {
        amount: Number(amount),
        category,
        description,
        expense_date: expenseDate,
      });
      setAmount("");
      setCategory(CATEGORIES[0]);
      setDescription("");
      setExpenseDate(new Date().toISOString().slice(0, 10));
      if (onAdd) onAdd();
    } catch {
      setError("Failed to add expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full border rounded px-2 py-1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          className="w-full border rounded px-2 py-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={100}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          className="w-full border rounded px-2 py-1"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Expense"}
      </button>
    </form>
  );
}

export default ExpenseForm;
