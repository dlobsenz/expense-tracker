import React, { useEffect, useState } from "react";
import axios from "axios";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function ExpenseList({ refresh, onDelete }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/expenses");
        setExpenses(response.data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setError("Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExpenses();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Failed to delete expense:", error);
      setError("Failed to delete expense.");
    }
  };

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!expenses.length) return <div className="text-gray-500">No expenses yet</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Category</th>
            <th className="text-left py-2">Description</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id} className="border-b hover:bg-gray-50">
              <td className="py-2">{formatDate(exp.expense_date)}</td>
              <td className="py-2 font-semibold">${parseFloat(exp.amount).toFixed(2)}</td>
              <td className="py-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {exp.category}
                </span>
              </td>
              <td className="py-2">{exp.description || "-"}</td>
              <td className="py-2">
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseList;
