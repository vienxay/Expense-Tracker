import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List,
  PieChart,
  Settings
} from 'lucide-react';
import QuickAddButton from './QuickAddButton';

const BottomNavigation = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'ໜ້າຫຼັກ' },
    { to: '/transactions', icon: List, label: 'ທຸລະກຳ' },
    // ປຸ່ມເພີ່ມຈະຖືກເພີ່ມແຍກຕ່າງຫາກ
    { to: '/reports', icon: PieChart, label: 'ລາຍງານ' },
    { to: '/settings', icon: Settings, label: 'ຕັ້ງຄ່າ' },
  ];

  return (
    <nav className="btm-nav">
      {/* ເມນູຊ້າຍ */}
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `btm-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="btm-nav-label">{item.label}</span>
          </NavLink>
        );
      })}

      {/* ປຸ່ມເພີ່ມຢູ່ກາງ - ໃຊ້ QuickAddButton */}
      <QuickAddButton />

      {/* ເມນູຂວາ */}
      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `btm-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-6 h-6" />
            <span className="btm-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;