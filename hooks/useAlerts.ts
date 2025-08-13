/**
 * Custom hook for sports API alerts
 * Provides convenient methods for showing sports-related error alerts
 */

import { useAlert } from '@/providers/AlertProvider';
import { useTranslation } from '@/localization';

export function useSportsAlerts() {
  const { showError, showWarning, showSuccess, showInfo } = useAlert();
  const { t } = useTranslation();

  return {
    // Sports API specific error alerts
    showSportsListError: () => {
      return showError(
        t('errors.sportsListFailed'),
        t('errors.title'),
        5000 // Auto dismiss after 5 seconds
      );
    },

    showSportDataError: (sportType?: string) => {
      const message = sportType 
        ? `${t('errors.sportDataFailed')}: ${sportType}`
        : t('errors.sportDataFailed');
      
      return showError(
        message,
        t('errors.title'),
        5000
      );
    },

    showVenueSearchError: () => {
      return showError(
        t('errors.venueSearchFailed'),
        t('errors.title'),
        5000
      );
    },

    showApiConnectionError: () => {
      return showError(
        t('errors.apiConnectionLost'),
        t('errors.title'),
        7000 // Longer duration for connection errors
      );
    },

    showNetworkError: () => {
      return showError(
        t('errors.networkError'),
        t('errors.title'),
        5000
      );
    },

    // Success messages
    showDataRefreshSuccess: () => {
      return showSuccess(
        t('common.done'),
        undefined,
        3000
      );
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
  const { t } = useTranslation();

  return {
    showError: (message: string, title?: string, autoDismiss?: number) => {
      return showError(message, title || t('errors.title'), autoDismiss);
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
    showNetworkError: () => showError(t('errors.networkError'), t('errors.title')),
    showGenericError: () => showError(t('errors.generic'), t('errors.title')),
    showRefreshError: () => showError(t('errors.refreshFailed'), t('errors.title')),
  };
}
