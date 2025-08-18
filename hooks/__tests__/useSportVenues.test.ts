/**
 * Tests for useSportVenues hook with intelligent caching
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React from 'react';
import { useSportVenues } from '../useSportVenues';

// Mock the dependencies
jest.mock('@/providers/AlertProvider', () => ({
  useAlert: () => ({
    showError: jest.fn(),
  }),
}));

jest.mock('@/store', () => ({
  useSportVenueStore: (selector: any) => {
    const mockStore = {
      setRawSportVenueData: jest.fn(),
      getSportDataByType: jest.fn(),
    };
    return selector(mockStore);
  },
}));

jest.mock('../services/sportsApiService', () => ({
  getSportData: jest.fn(),
}));

// Mock data
const mockSportVenueData = {
  sportType: 'badminton',
  data: [],
  count: 0,
  lastUpdated: new Date().toISOString(),
};

const oldMockSportVenueData = {
  sportType: 'badminton',
  data: [],
  count: 0,
  lastUpdated: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
};

describe('useSportVenues', () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  it('should fetch from API when no cached data exists', async () => {
    const { getSportData } = require('../services/sportsApiService');
    const { useSportVenueStore } = require('@/store');
    
    // Mock no cached data
    useSportVenueStore.mockImplementation((selector: any) => {
      const mockStore = {
        setRawSportVenueData: jest.fn(),
        getSportDataByType: jest.fn().mockReturnValue(undefined),
      };
      return selector(mockStore);
    });

    getSportData.mockResolvedValue(mockSportVenueData);

    const { result } = renderHook(() => useSportVenues('badminton'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getSportData).toHaveBeenCalledWith('badminton');
    expect(result.current.isCacheHit).toBe(false);
    expect(result.current.data).toEqual(mockSportVenueData);
  });

  it('should use cached data when it is still valid (less than 30 minutes old)', async () => {
    const { getSportData } = require('../services/sportsApiService');
    const { useSportVenueStore } = require('@/store');
    
    // Mock valid cached data (recent timestamp)
    useSportVenueStore.mockImplementation((selector: any) => {
      const mockStore = {
        setRawSportVenueData: jest.fn(),
        getSportDataByType: jest.fn().mockReturnValue(mockSportVenueData),
      };
      return selector(mockStore);
    });

    const { result } = renderHook(() => useSportVenues('badminton'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should not call API since cache is valid
    expect(getSportData).not.toHaveBeenCalled();
    expect(result.current.isCacheHit).toBe(true);
    expect(result.current.data).toEqual(mockSportVenueData);
    expect(result.current.cacheAge).toBeGreaterThan(0);
  });

  it('should fetch from API when cached data is stale (more than 30 minutes old)', async () => {
    const { getSportData } = require('../services/sportsApiService');
    const { useSportVenueStore } = require('@/store');
    
    // Mock stale cached data (old timestamp)
    useSportVenueStore.mockImplementation((selector: any) => {
      const mockStore = {
        setRawSportVenueData: jest.fn(),
        getSportDataByType: jest.fn().mockReturnValue(oldMockSportVenueData),
      };
      return selector(mockStore);
    });

    getSportData.mockResolvedValue(mockSportVenueData);

    const { result } = renderHook(() => useSportVenues('badminton'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should call API since cache is stale
    expect(getSportData).toHaveBeenCalledWith('badminton');
    expect(result.current.isCacheHit).toBe(false);
    expect(result.current.data).toEqual(mockSportVenueData);
  });

  it('should fetch from API when cached data has no lastUpdated timestamp', async () => {
    const { getSportData } = require('../services/sportsApiService');
    const { useSportVenueStore } = require('@/store');
    
    // Mock cached data without lastUpdated
    const dataWithoutTimestamp = { ...mockSportVenueData };
    delete dataWithoutTimestamp.lastUpdated;
    
    useSportVenueStore.mockImplementation((selector: any) => {
      const mockStore = {
        setRawSportVenueData: jest.fn(),
        getSportDataByType: jest.fn().mockReturnValue(dataWithoutTimestamp),
      };
      return selector(mockStore);
    });

    getSportData.mockResolvedValue(mockSportVenueData);

    const { result } = renderHook(() => useSportVenues('badminton'), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should call API since timestamp is missing
    expect(getSportData).toHaveBeenCalledWith('badminton');
    expect(result.current.isCacheHit).toBe(false);
  });
});
