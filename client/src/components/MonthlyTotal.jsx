import React, { useEffect, useState } from "react";
import axios from "axios";

function MonthlyTotal({ refresh }) {
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotal = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/expenses/stats");
        setTotal(response.data.totalThisMonth);
      } catch (error) {
        console.error("Failed to fetch monthly total:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTotal();
  }, [refresh]);

  if (loading) return <div className="animate-pulse">Loading...</div>;
  return (
    <div className="text-2xl font-bold text-blue-700">
      ${total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </div>
  );
}

export default MonthlyTotal;
