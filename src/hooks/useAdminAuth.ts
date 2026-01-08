import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

type ScorerRole = 'admin' | 'primary_scorer' | 'secondary_scorer' | 'user' | null;

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<ScorerRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check user's role (admin, primary_scorer, secondary_scorer, or user)
  const checkUserRole = useCallback(async (userId: string): Promise<ScorerRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }

      const roles = data?.map(r => r.role) || [];
      
      // Return highest privilege role
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('primary_scorer')) return 'primary_scorer';
      if (roles.includes('secondary_scorer')) return 'secondary_scorer';
      if (roles.includes('user')) return 'user';
      
      return null;
    } catch (error) {
      console.error('Error checking user role:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role check with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            checkUserRole(session.user.id).then(setUserRole);
            setIsLoading(false);
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserRole(session.user.id).then(setUserRole);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkUserRole]);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setUserRole(null);
    }
    return { error };
  }, []);

  // A scorer has access to the admin panel (admin, primary_scorer, or secondary_scorer)
  const hasAccess = userRole === 'admin' || userRole === 'primary_scorer' || userRole === 'secondary_scorer';
  const isAdmin = userRole === 'admin';

  return {
    user,
    session,
    userRole,
    isAdmin,
    hasAccess,
    isLoading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
  };
}
