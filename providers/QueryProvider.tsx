/**
 * TanStack Query Provider
 * Wraps the app with QueryClient for data fetching and caching
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'
import { createQueryClient } from '../config/queryClient'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * Provider component that sets up TanStack Query for the entire app
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create query client instance (only once per app lifecycle)
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
