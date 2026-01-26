import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  PieChart, 
  Wallet,
  Settings,
  List
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'ໜ້າຫຼັກ' },
    { to: '/transactions', icon: List, label: 'ທຸລະກຳທັງໝົດ' },
    { to: '/income', icon: ArrowUpCircle, label: 'ລາຍຮັບ' },
    { to: '/expense', icon: ArrowDownCircle, label: 'ລາຍຈ່າຍ' },
    { to: '/reports', icon: PieChart, label: 'ລາຍງານ' },
    { to: '/budgets', icon: Wallet, label: 'ງົບປະມານ' },
    { to: '/settings', icon: Settings, label: 'ຕັ້ງຄ່າ' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 p-6 flex flex-col z-50">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg">ບັນທຶກການເງິນ</h1>
            <p className="text-xs text-slate-500">Expense Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-400">
            ສ້າງໂດຍ ❤️
          </p>
          <p className="text-xs text-slate-400 mt-1">
            v1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;