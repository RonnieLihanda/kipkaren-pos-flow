
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Layout } from './Layout/Layout';

interface ProtectedPageProps {
  children: ReactNode;
  adminOnly?: boolean;
  title: string;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ 
  children, 
  adminOnly = false,
  title
}) => {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Access denied for admin-only pages
  if (adminOnly && !isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">{title}</h1>
        {children}
      </div>
    </Layout>
  );
};
