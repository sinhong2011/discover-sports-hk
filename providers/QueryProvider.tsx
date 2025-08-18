/**
 * TanStack Query Provider
 * Wraps the app with QueryClient for data fetching and caching
 */

// Import React Query dev plugin hook for development debugging
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import { createQueryClient } from '../config/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that sets up TanStack Query for the entire app
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client instance (only once per app lifecycle)
  const [queryClient] = useState(() => createQueryClient());

  // Initialize React Query DevTools in development
  useReactQueryDevTools(queryClient);

  // Debug logging to confirm dev tools are initialized
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('✅ React Query DevTools initialized');
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
