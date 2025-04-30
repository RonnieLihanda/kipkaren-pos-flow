
import React, { createContext, useState, useContext, useEffect } from 'react';
import { localStorageService, User } from '../services/localStorage';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
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

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const existingUser = localStorageService.getUserByEmail(email);
    
    if (existingUser) {
      return false;
    }
    
    // Create new user with cashier role by default
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role: 'cashier' // Default role is cashier
    };
    
    // Add user to localStorage
    localStorageService.addUser(newUser);
    
    // Auto login after registration
    setCurrentUser(newUser);
    setIsAdmin(false); // New users are not admins by default
    sessionStorage.setItem('pos_current_user', JSON.stringify(newUser));
    
    return true;
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    sessionStorage.removeItem('pos_current_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, isAdmin }}>
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
