import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import MonthlyTotal from "./components/MonthlyTotal.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import CategoryChart from "./components/CategoryChart.jsx";
import RecentExpenses from "./components/RecentExpenses.jsx";
import ExpenseList from "./components/ExpenseList.jsx";

function App() {
  return (
    <AuthProvider>
      <PrivateRoute>
        <ExpenseTracker />
      </PrivateRoute>
    </AuthProvider>
  );
}

function ExpenseTracker() {
  // Used to trigger refresh of dashboard/list after adding/deleting expenses
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <ExpenseHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard: Monthly total, Add Expense, Category Chart, Recent Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="md:col-span-1">
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">This Month</h2>
              {/* MonthlyTotal component */}
              <div className="bg-white rounded shadow p-4 mb-4">
                <MonthlyTotal refresh={refresh} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Add New Expense</h2>
              {/* ExpenseForm component */}
              <div className="bg-white rounded shadow p-4">
                <ExpenseForm onAdd={() => setRefresh((r) => r + 1)} />
              </div>
            </div>
          </section>
          <section className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-2">Category Chart</h2>
            {/* CategoryChart component */}
            <div className="bg-white rounded shadow p-4 h-64 flex items-center justify-center">
              <CategoryChart refresh={refresh} />
            </div>
          </section>
          <section className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-2">Recent Expenses</h2>
            {/* RecentExpenses component */}
            <div className="bg-white rounded shadow p-4">
              <RecentExpenses refresh={refresh} />
            </div>
          </section>
        </div>
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-2">All Expenses</h2>
          {/* ExpenseList component */}
          <div className="bg-white rounded shadow p-4">
            <ExpenseList refresh={refresh} onDelete={() => setRefresh((r) => r + 1)} />
          </div>
        </div>
      </main>
    </div>
  );
}

function ExpenseHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-blue-600 text-white py-4 shadow">
      <div className="container mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default App;
