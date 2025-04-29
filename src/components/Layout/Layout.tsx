
import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
