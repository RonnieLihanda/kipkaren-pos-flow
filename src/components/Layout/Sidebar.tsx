
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Sales', href: '/sales' },
    { name: 'Inventory', href: '/inventory', adminOnly: false },
    { name: 'Expenses', href: '/expenses', adminOnly: true },
    { name: 'Suppliers', href: '/suppliers', adminOnly: true },
    { name: 'Reports', href: '/reports', adminOnly: true },
    { name: 'Settings', href: '/settings', adminOnly: true },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-primary-dark w-64 min-h-screen flex-shrink-0 hidden md:block">
      <div className="h-16 bg-primary flex items-center px-4 border-b border-primary-light">
        <h1 className="text-white font-bold text-xl">Mic3 Hardware POS</h1>
      </div>
      <nav className="mt-6">
        <div className="px-2 space-y-1">
          {navigation.map((item) => {
            if (item.adminOnly && !isAdmin) {
              return null;
            }
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-white hover:bg-primary hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
