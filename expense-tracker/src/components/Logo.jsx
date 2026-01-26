import React from 'react';

// Logo Component ສຳລັບແອັບບັນທຶກລາຍຮັບ-ລາຍຈ່າຍ
const Logo = ({ size = 40, showText = true, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div 
        className="relative flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981"/>
              <stop offset="100%" stopColor="#059669"/>
            </linearGradient>
          </defs>
          
          {/* Background */}
          <rect width="64" height="64" rx="14" fill="url(#logoGradient)"/>
          
          {/* Wallet */}
          <rect x="12" y="20" width="32" height="24" rx="4" fill="#ffffff"/>
          <rect x="12" y="20" width="32" height="8" rx="4" fill="#f0fdf4"/>
          
          {/* Clasp */}
          <circle cx="38" cy="32" r="4" fill="#10b981"/>
          
          {/* Up Arrow (Income) */}
          <g transform="translate(52, 16)">
            <circle cx="0" cy="0" r="8" fill="#22c55e"/>
            <path d="M0 -4 L3 1 L1 1 L1 4 L-1 4 L-1 1 L-3 1 Z" fill="#ffffff"/>
          </g>
          
          {/* Down Arrow (Expense) */}
          <g transform="translate(52, 48)">
            <circle cx="0" cy="0" r="8" fill="#ef4444"/>
            <path d="M0 4 L3 -1 L1 -1 L1 -4 L-1 -4 L-1 -1 L-3 -1 Z" fill="#ffffff"/>
          </g>
          
          {/* Coin */}
          <circle cx="20" cy="36" r="6" fill="#fbbf24"/>
          <text x="20" y="39" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="bold">₭</text>
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-lg leading-tight">
            ບັນທຶກການເງິນ
          </span>
          <span className="text-xs text-slate-500">
            Expense Tracker
          </span>
        </div>
      )}
    </div>
  );
};

// Logo ແບບງ່າຍ (ບໍ່ມີຂໍ້ຄວາມ)
export const LogoIcon = ({ size = 40, className = '' }) => {
  return (
    <div 
      className={`flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#059669"/>
          </linearGradient>
        </defs>
        
        <rect width="64" height="64" rx="14" fill="url(#logoIconGradient)"/>
        <rect x="12" y="20" width="32" height="24" rx="4" fill="#ffffff"/>
        <rect x="12" y="20" width="32" height="8" rx="4" fill="#f0fdf4"/>
        <circle cx="38" cy="32" r="4" fill="#10b981"/>
        
        <g transform="translate(52, 16)">
          <circle cx="0" cy="0" r="8" fill="#22c55e"/>
          <path d="M0 -4 L3 1 L1 1 L1 4 L-1 4 L-1 1 L-3 1 Z" fill="#ffffff"/>
        </g>
        
        <g transform="translate(52, 48)">
          <circle cx="0" cy="0" r="8" fill="#ef4444"/>
          <path d="M0 4 L3 -1 L1 -1 L1 -4 L-1 -4 L-1 -1 L-3 -1 Z" fill="#ffffff"/>
        </g>
        
        <circle cx="20" cy="36" r="6" fill="#fbbf24"/>
        <text x="20" y="39" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="bold">₭</text>
      </svg>
    </div>
  );
};

export default Logo;