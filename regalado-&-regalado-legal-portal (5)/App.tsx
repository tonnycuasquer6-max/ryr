
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAwaitingMfa, setIsAwaitingMfa] = useState(false);

  useEffect(() => {
    setLoading(true);

    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        // If the user signs out, we must reset the MFA state.
        if (_event === 'SIGNED_OUT') {
          setIsAwaitingMfa(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-navy">
            <div className="text-white text-xl animate-pulse">Loading Secure Portal...</div>
        </div>
    );
  }

  // The Dashboard is shown only when there's a valid session AND we are not in the middle of the MFA flow.
  const showDashboard = !!session && !isAwaitingMfa;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-navy">
      {!showDashboard ? (
        <LoginPage setIsAwaitingMfa={setIsAwaitingMfa} />
      ) : (
        <Dashboard key={session!.user.id} session={session!} />
      )}
    </div>
  );
};

export default App;
