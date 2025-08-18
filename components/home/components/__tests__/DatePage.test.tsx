/**
 * Tests for DatePage component with pull-to-refresh functionality
 */

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import type { DatePageProps } from '../DatePage';
import DatePage from '../DatePage';

// Mock the dependencies
jest.mock('@/providers', () => ({
  useHomeTabContext: jest.fn(),
}));

jest.mock('@/components/skeleton', () => ({
  EnhancedDatePageSkeleton: ({ isLoading }: { isLoading: boolean }) =>
    isLoading ? <div testID="skeleton-loading">Loading...</div> : null,
}));

jest.mock('../DatePage/utils', () => ({
  transformSportVenueData: jest.fn().mockReturnValue({
    flashListData: [],
    stickyHeaderIndices: [],
  }),
}));

// Mock FlashList
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ onRefresh, refreshing, ...props }: any) => (
    <div testID="flash-list" data-refreshing={refreshing} onRefresh={onRefresh} {...props}>
      FlashList Mock
    </div>
  ),
}));

const mockHomeTabContext = {
  isLoading: false,
  isFetching: false,
  isRefetching: false,
  isEmpty: false,
  refetch: jest.fn(),
};

const defaultProps: DatePageProps = {
  date: new Date('2024-01-15'),
  isSelected: true,
  data: [],
};

describe('DatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue(mockHomeTabContext);
  });

  it('should render FlashList with pull-to-refresh functionality', () => {
    const { getByTestId } = render(<DatePage {...defaultProps} />);

    const flashList = getByTestId('flash-list');
    expect(flashList).toBeTruthy();
    expect(flashList.props['data-refreshing']).toBe(false);
  });

  it('should show refreshing state when isRefetching is true', () => {
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      isRefetching: true,
    });

    const { getByTestId } = render(<DatePage {...defaultProps} />);

    const flashList = getByTestId('flash-list');
    expect(flashList.props['data-refreshing']).toBe(true);
  });

  it('should call refetch when pull-to-refresh is triggered', async () => {
    const mockRefetch = jest.fn().mockResolvedValue({});
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      refetch: mockRefetch,
    });

    const { getByTestId } = render(<DatePage {...defaultProps} />);

    const flashList = getByTestId('flash-list');

    // Simulate pull-to-refresh
    if (flashList.props.onRefresh) {
      await flashList.props.onRefresh();
    }

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should handle refetch errors gracefully', async () => {
    const mockRefetch = jest.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      refetch: mockRefetch,
    });

    const { getByTestId } = render(<DatePage {...defaultProps} />);

    const flashList = getByTestId('flash-list');

    // Simulate pull-to-refresh with error
    if (flashList.props.onRefresh) {
      await flashList.props.onRefresh();
    }

    expect(mockRefetch).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Pull-to-refresh failed:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should show skeleton when loading initial data', () => {
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      isLoading: true,
      isEmpty: true,
    });

    const { getByTestId, queryByTestId } = render(<DatePage {...defaultProps} />);

    expect(getByTestId('skeleton-loading')).toBeTruthy();
    expect(queryByTestId('flash-list')).toBeFalsy();
  });

  it('should show skeleton when fetching and data is empty', () => {
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      isFetching: true,
      isEmpty: true,
    });

    const { getByTestId, queryByTestId } = render(<DatePage {...defaultProps} />);

    expect(getByTestId('skeleton-loading')).toBeTruthy();
    expect(queryByTestId('flash-list')).toBeFalsy();
  });

  it('should show FlashList when data is available even during refetch', () => {
    const { useHomeTabContext } = require('@/providers');
    useHomeTabContext.mockReturnValue({
      ...mockHomeTabContext,
      isRefetching: true,
      isEmpty: false, // Has data
    });

    const { getByTestId, queryByTestId } = render(<DatePage {...defaultProps} />);

    expect(getByTestId('flash-list')).toBeTruthy();
    expect(queryByTestId('skeleton-loading')).toBeFalsy();
  });
});
