import { createClient } from '@supabase/supabase-js'

// Environment variables should be used in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zpjrvqmlzsbpalttpfuy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwanJ2cW1senNicGFsdHRwZnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzIwOTcsImV4cCI6MjA3NzkwODA5N30.aHp3WEEGtUNqcQWay5iAqUsuDzmje2mcAUWT8aKsBnE';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Add global error handler for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Only log important auth events, not token refreshes
  if (event !== 'TOKEN_REFRESHED') {
    console.log('Auth state changed:', event);
  }
});

// Function to handle token refresh
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
    return data.session;
  } catch (error) {
    console.error('Failed to refresh session:', error);
    return null;
  }
};