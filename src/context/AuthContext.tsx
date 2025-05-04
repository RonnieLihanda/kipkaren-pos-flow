import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Session, User } from '@supabase/supabase-js';

interface UserMetadata {
  app_role?: "admin" | "cashier";
  name?: string;
}

interface ExtendedUser extends User {
  app_role: "admin" | "cashier";
  name: string;
}

interface AuthContextType {
  currentUser: ExtendedUser | null;
  session: Session | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const processUser = (user: User | null): ExtendedUser | null => {
    if (!user) return null;
    
    // Special handling for the specific user to make them admin
    if (user.email === 'ronnielihanda@gmail.com') {
      console.log("Setting ronnielihanda@gmail.com as admin");
      return {
        ...user,
        app_role: "admin",
        name: user.email?.split('@')[0] || "Ronnie"
      };
    }
    
    const metadata = user.user_metadata as UserMetadata;
    return {
      ...user,
      app_role: metadata?.app_role || "cashier",
      name: metadata?.name || user.email?.split('@')[0] || "User"
    };
  };

  useEffect(() => {
    // Check active sessions and set the user
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        setSession(session);
        setCurrentUser(processUser(session?.user ?? null));
        console.log("Current user metadata:", session?.user?.user_metadata);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    setData();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed, new metadata:", session?.user?.user_metadata);
      setSession(session);
      setCurrentUser(processUser(session?.user ?? null));
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Determine if user is admin based on their role
  // For ronnielihanda@gmail.com, we're forcing admin rights
  const isAdmin = currentUser?.email === 'ronnielihanda@gmail.com' || currentUser?.app_role === "admin";
  
  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            app_role: "cashier" // Default role for new users
          }
        }
      });
      
      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }
      
      toast({
        title: 'Registration Successful',
        description: 'Please check your email for verification link.',
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSession(null);
  };
  
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      session,
      isAdmin, 
      login, 
      register, 
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
