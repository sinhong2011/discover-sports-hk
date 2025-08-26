/**
 * Custom hook for sports API alerts
 * Provides convenient methods for showing sports-related error alerts using toast notifications
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AppToast } from '@/providers/ToastProvider';

// Define translation messages
const errorTitle = msg`Error`;
const sportsListFailed = msg`Failed to fetch sports list`;
const sportDataFailed = msg`Failed to fetch sport data`;
const venueSearchFailed = msg`Failed to search venues`;
const networkError = msg`Network connection error`;
const done = msg`Done`;
const genericError = msg`Something went wrong`;
const refreshFailed = msg`Failed to refresh data`;

export function useSportsAlerts() {
  const { t } = useLingui();

  return {
    // Sports API specific error alerts
    showSportsListError: () => {
      AppToast.error(t(sportsListFailed), {
        title: t(errorTitle),
        duration: 5000,
      });
    },

    showSportDataError: (sportType?: string) => {
      const message = sportType ? `${t(sportDataFailed)}: ${sportType}` : t(sportDataFailed);
      AppToast.error(message, {
        title: t(errorTitle),
        duration: 5000,
      });
    },

    showVenueSearchError: () => {
      AppToast.error(t(venueSearchFailed), {
        title: t(errorTitle),
        duration: 5000,
      });
    },

    showNetworkError: () => {
      AppToast.error(t(networkError), {
        title: t(errorTitle),
        duration: 5000,
      });
    },

    // Success messages
    showDataRefreshSuccess: () => {
      AppToast.success(t(done), {
        duration: 3000,
      });
    },

    // Generic alert methods using AppToast
    showError: (message: string, title?: string, duration?: number) => {
      AppToast.error(message, { title, duration });
    },
    showWarning: (message: string, title?: string, duration?: number) => {
      AppToast.warn(message, { title, duration });
    },
    showSuccess: (message: string, title?: string, duration?: number) => {
      AppToast.success(message, { title, duration });
    },
    showInfo: (message: string, title?: string, duration?: number) => {
      AppToast.info(message, { title, duration });
    },
  };
}

/**
 * Hook for general app alerts with localization using toast notifications
 */
export function useAppAlerts() {
  const { t } = useLingui();

  return {
    showError: (message: string, title?: string, duration?: number) => {
      AppToast.error(message, {
        title: title || t(errorTitle),
        duration,
      });
    },

    showWarning: (message: string, title?: string, duration?: number) => {
      AppToast.warn(message, {
        title,
        duration,
      });
    },

    showSuccess: (message: string, title?: string, duration?: number) => {
      AppToast.success(message, {
        title,
        duration,
      });
    },

    showInfo: (message: string, title?: string, duration?: number) => {
      AppToast.info(message, {
        title,
        duration,
      });
    },

    // Common error scenarios
    showNetworkError: () => {
      AppToast.error(t(networkError), {
        title: t(errorTitle),
      });
    },
    showGenericError: () => {
      AppToast.error(t(genericError), {
        title: t(errorTitle),
      });
    },
    showRefreshError: () => {
      AppToast.error(t(refreshFailed), {
        title: t(errorTitle),
      });
    },
  };
}
