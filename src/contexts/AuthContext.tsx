import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockSession: (user: User | null, session: Session | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Check supabase.auth.getSession() on app load
    const initializeAuth = async () => {
      try {
        const { data: { session: realSession } } = await supabase.auth.getSession();
        if (realSession) {
          setSession(realSession);
          setUser(realSession.user);
        } else {
          // Check for mock user/session in localStorage
          const storedUser = localStorage.getItem('mock_user');
          const storedSession = localStorage.getItem('mock_session');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            if (storedSession) {
              setSession(JSON.parse(storedSession));
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 3. Listen for auth changes using supabase.auth.onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, realSession) => {
      if (realSession) {
        setSession(realSession);
        setUser(realSession.user);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        localStorage.removeItem('mock_user');
        localStorage.removeItem('mock_session');
        localStorage.removeItem('mock_user_role');
      } else {
        // If there's no real session, don't clear mock session if it's currently active
        const storedUser = localStorage.getItem('mock_user');
        if (!storedUser) {
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setMockSession = (mockUser: User | null, mockSess: Session | null) => {
    setUser(mockUser);
    setSession(mockSess);
    if (mockUser) {
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
    } else {
      localStorage.removeItem('mock_user');
    }
    if (mockSess) {
      localStorage.setItem('mock_session', JSON.stringify(mockSess));
    } else {
      localStorage.removeItem('mock_session');
    }
  };

  // 5. Add logout function
  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('mock_user');
      localStorage.removeItem('mock_session');
      localStorage.removeItem('mock_user_role');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, setMockSession }}>
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
