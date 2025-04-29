
import React, { createContext, useState, useContext, useEffect } from 'react';
import { localStorageService, User } from '../services/localStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Initialize localStorage on component mount
  useEffect(() => {
    localStorageService.initialize();
    
    // Check for logged-in user in sessionStorage
    const savedUser = sessionStorage.getItem('pos_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    const user = localStorageService.getUserByEmail(email);
    
    if (user && user.password === password) {
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
      
      // Save user to sessionStorage for persistence
      sessionStorage.setItem('pos_current_user', JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('pos_current_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
