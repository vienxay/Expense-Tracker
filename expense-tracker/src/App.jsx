import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <main className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/income" element={<Transactions />} />
              <Route path="/expense" element={<Transactions />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#334155',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </Router>
    </AppProvider>
  );
}

export default App;