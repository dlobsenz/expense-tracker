import React, { useEffect, useState } from "react";
import axios from "axios";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Today";
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function RecentExpenses({ refresh }) {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/expenses/stats");
        setRecent(response.data.recent || []);
      } catch (error) {
        console.error("Failed to fetch recent expenses:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentExpenses();
  }, [refresh]);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  if (!recent.length) return <div className="text-gray-500">No recent expenses</div>;

  return (
    <ul className="space-y-2">
      {recent.map((exp) => (
        <li key={exp.id} className="flex justify-between items-center">
          <span>
            <span className="font-semibold">${parseFloat(exp.amount).toFixed(2)}</span> -{" "}
            <span className="text-blue-700">{exp.category}</span>
            {exp.description ? ` - ${exp.description}` : ""}
            {" "}
            <span className="text-gray-500 text-xs">({formatDate(exp.expense_date)})</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default RecentExpenses;
