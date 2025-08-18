/**
 * Global Alert Provider
 * Manages toast-style alerts that appear at the top of the screen
 */

import type React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { Alert, type AlertProps } from '@/components/ui/Alert';

// ============================================================================
// Types
// ============================================================================

export interface AlertItem extends Omit<AlertProps, 'onDismiss' | 'visible'> {
  id: string;
  autoDismiss?: number;
}

export interface AlertContextType {
  showAlert: (alert: Omit<AlertItem, 'id'>) => string;
  hideAlert: (id: string) => void;
  clearAllAlerts: () => void;
  // Convenience methods
  showError: (message: string, title?: string, autoDismiss?: number) => string;
  showWarning: (message: string, title?: string, autoDismiss?: number) => string;
  showSuccess: (message: string, title?: string, autoDismiss?: number) => string;
  showInfo: (message: string, title?: string, autoDismiss?: number) => string;
}

// ============================================================================
// Context
// ============================================================================

const AlertContext = createContext<AlertContextType | null>(null);

// ============================================================================
// Provider Component
// ============================================================================

interface AlertProviderProps {
  children: React.ReactNode;
  /** Maximum number of alerts to show simultaneously */
  maxAlerts?: number;
  /** Default auto dismiss time in milliseconds */
  defaultAutoDismiss?: number;
}

export function AlertProvider({
  children,
  maxAlerts = 3,
  defaultAutoDismiss = 5000,
}: AlertProviderProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const insets = useSafeAreaInsets();

  // Generate unique ID for alerts
  const generateId = useCallback(() => {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Show a new alert
  const showAlert = useCallback(
    (alertData: Omit<AlertItem, 'id'>): string => {
      const id = generateId();
      const newAlert: AlertItem = {
        ...alertData,
        id,
        autoDismiss: alertData.autoDismiss ?? defaultAutoDismiss,
      };

      setAlerts((prev) => {
        const updated = [newAlert, ...prev];
        // Limit the number of alerts
        return updated.slice(0, maxAlerts);
      });

      return id;
    },
    [generateId, maxAlerts, defaultAutoDismiss]
  );

  // Hide a specific alert
  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev?.filter((alert) => alert.id !== id));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showError = useCallback(
    (message: string, title?: string, autoDismiss?: number) => {
      return showAlert({
        variant: 'error',
        message,
        title,
        autoDismiss,
      });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string, autoDismiss?: number) => {
      return showAlert({
        variant: 'warning',
        message,
        title,
        autoDismiss,
      });
    },
    [showAlert]
  );

  const showSuccess = useCallback(
    (message: string, title?: string, autoDismiss?: number) => {
      return showAlert({
        variant: 'success',
        message,
        title,
        autoDismiss,
      });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string, autoDismiss?: number) => {
      return showAlert({
        variant: 'info',
        message,
        title,
        autoDismiss,
      });
    },
    [showAlert]
  );

  const contextValue: AlertContextType = {
    showAlert,
    hideAlert,
    clearAllAlerts,
    showError,
    showWarning,
    showSuccess,
    showInfo,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}

      {/* Alert Container */}
      {alerts.length > 0 && (
        <View
          style={[
            styles.alertContainer,
            {
              top: insets.top + (Platform.OS === 'ios' ? 10 : 20),
            },
          ]}
          pointerEvents="box-none"
        >
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.variant}
              message={alert.message}
              title={alert.title}
              dismissible={alert.dismissible}
              onDismiss={() => hideAlert(alert.id)}
              visible={true}
              autoDismiss={alert.autoDismiss}
              icon={alert.icon}
              testID={`alert-${alert.id}`}
              style={styles.alertItem}
            />
          ))}
        </View>
      )}
    </AlertContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access alert functionality
 */
export function useAlert(): AlertContextType {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }

  return context;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  alertContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  alertItem: {
    marginBottom: 8,
  },
}));

// ============================================================================
// Exports
// ============================================================================

export default AlertProvider;
