import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Components
import Sidebar from './components/Sidebar';
import BottomNavigation from './components/BottomNavigation';

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Income from './pages/Income';       // ✅ ໃໝ່
import Expense from './pages/Expense';     // ✅ ໃໝ່
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Recurring from './pages/Recurring';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen">
          <Sidebar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/income" element={<Income />} />      // ✅ ໃຊ້ component ໃໝ່
              <Route path="/expense" element={<Expense />} />    // ✅ ໃຊ້ component ໃໝ່
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/recurring" element={<Recurring />} />
            </Routes>
          </main>

          <BottomNavigation />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;