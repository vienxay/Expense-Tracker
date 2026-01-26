import React from 'react';
import { Wallet } from 'lucide-react';

const Header = ({ title, subtitle }) => {
  return (
    <header className="page-header">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <span className="text-white/80 text-sm font-medium">ບັນທຶກການເງິນ</span>
      </div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
};

export default Header;