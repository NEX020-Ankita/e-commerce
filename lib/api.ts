import { supabase, refreshSession } from './supabase';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, try to refresh it
    if (!session) {
      const refreshedSession = await refreshSession();
      if (!refreshedSession) {
        throw new Error('No active session and could not refresh');
      }
    }

    // Add auth headers
    const headers = new Headers(options.headers);
    if (session) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    // Make the request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try to refresh token and retry once
    if (response.status === 401) {
      const refreshedSession = await refreshSession();
      if (refreshedSession) {
        headers.set('Authorization', `Bearer ${refreshedSession.access_token}`);
        return fetch(url, {
          ...options,
          headers,
        });
      }
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
