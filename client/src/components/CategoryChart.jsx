import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

function CategoryChart({ refresh }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/expenses/stats");
        setData(response.data.byCategory || []);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [refresh]);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!data.length) {
    return <div className="text-gray-500">No data</div>;
  }

  const chartData = {
    labels: data.map((c) => c.category),
    datasets: [
      {
        data: data.map((c) => c.total),
        backgroundColor: [
          "#2563eb", // blue-600
          "#f59e42", // orange-400
          "#10b981", // green-500
          "#f43f5e", // rose-500
          "#a78bfa", // purple-400
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Pie
      data={chartData}
      options={{
        plugins: {
          legend: { position: "bottom" },
          title: { display: false },
        },
        maintainAspectRatio: false,
      }}
    />
  );
}

export default CategoryChart;
