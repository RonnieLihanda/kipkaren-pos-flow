
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AccessControlProps {
  children: ReactNode;
  adminOnly?: boolean;
  fallback?: ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({ 
  children, 
  adminOnly = false,
  fallback = null 
}) => {
  const { currentUser, isAdmin } = useAuth();
  
  // Not authenticated
  if (!currentUser) {
    return null;
  }
  
  // Admin access check
  if (adminOnly && !isAdmin) {
    return <>{fallback}</>;
  }
  
  // Default case: user has access
  return <>{children}</>;
};
