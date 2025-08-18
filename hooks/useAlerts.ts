/**
 * Custom hook for sports API alerts
 * Provides convenient methods for showing sports-related error alerts
 */

import { useAlert } from '@/providers/AlertProvider';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

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
  const { showError, showWarning, showSuccess, showInfo } = useAlert();
  const { t } = useLingui();

  return {
    // Sports API specific error alerts
    showSportsListError: () => {
      return showError(
        t(sportsListFailed),
        t(errorTitle),
        5000 // Auto dismiss after 5 seconds
      );
    },

    showSportDataError: (sportType?: string) => {
      const message = sportType ? `${t(sportDataFailed)}: ${sportType}` : t(sportDataFailed);

      return showError(message, t(errorTitle), 5000);
    },

    showVenueSearchError: () => {
      return showError(t(venueSearchFailed), t(errorTitle), 5000);
    },

    showNetworkError: () => {
      return showError(t(networkError), t(errorTitle), 5000);
    },

    // Success messages
    showDataRefreshSuccess: () => {
      return showSuccess(t(done), undefined, 3000);
    },

    // Generic alert methods (pass through)
    showError,
    showWarning,
    showSuccess,
    showInfo,
  };
}

/**
 * Hook for general app alerts with localization
 */
export function useAppAlerts() {
  const { showError, showWarning, showSuccess, showInfo } = useAlert();
  const { t } = useLingui();

  return {
    showError: (message: string, title?: string, autoDismiss?: number) => {
      return showError(message, title || t(errorTitle), autoDismiss);
    },

    showWarning: (message: string, title?: string, autoDismiss?: number) => {
      return showWarning(message, title, autoDismiss);
    },

    showSuccess: (message: string, title?: string, autoDismiss?: number) => {
      return showSuccess(message, title, autoDismiss);
    },

    showInfo: (message: string, title?: string, autoDismiss?: number) => {
      return showInfo(message, title, autoDismiss);
    },

    // Common error scenarios
    showNetworkError: () => showError(t(networkError), t(errorTitle)),
    showGenericError: () => showError(t(genericError), t(errorTitle)),
    showRefreshError: () => showError(t(refreshFailed), t(errorTitle)),
  };
}
