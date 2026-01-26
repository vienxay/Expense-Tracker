import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Components - ທັງສອງຈະສະແດງຕາມຂະໜາດຈໍ
import Sidebar from './components/Sidebar';           // Desktop: ສະແດງ, Mobile: ເຊື່ອງ
import BottomNavigation from './components/BottomNavigation'; // Desktop: ເຊື່ອງ, Mobile: ສະແດງ

// Pages
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Recurring from './pages/Recurring';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen">
          {/* Sidebar - ສະແດງສະເພາະ Desktop (md:flex, hidden ໃນ mobile) */}
          <Sidebar />

          {/* Main Content - ມີ margin-left ສະເພາະ desktop */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/income" element={<Transactions type="income" />} />
              <Route path="/expense" element={<Transactions type="expense" />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/recurring" element={<Recurring />} />
              <Route path="/add" element={<Transactions showAddModal />} />
            </Routes>
          </main>

          {/* Bottom Navigation - ສະແດງສະເພາະ Mobile (md:hidden) */}
          <BottomNavigation />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;