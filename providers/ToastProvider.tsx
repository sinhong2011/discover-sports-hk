/**
 * Toast Provider using sonner-native
 * Integrates with unistyles theming and provides native toast functionality
 */

import React from 'react';
import { View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { Toaster, toast } from 'sonner-native';
import { AppIcon, type AppIconName } from '@/components/ui/Icon';

// ============================================================================
// Types
// ============================================================================

export type ToastType = 'success' | 'error' | 'info' | 'warn';

export interface ToastOptions {
  /** Toast message text */
  message: string;
  /** Optional title for the toast */
  title?: string;
  /** Position of the toast */
  position?: 'top' | 'bottom';
  /** Duration in ms before the toast disappears */
  duration?: number;
  /** Custom icon to display - can be AppIcon name or React component */
  icon?: AppIconName | React.ReactElement;
  /** Color for the toast icon (only applies to AppIcon names, not React components) */
  iconColor?: string;
  /** Callback when toast is pressed */
  onPress?: () => void;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a custom icon component for toast notifications
 * Supports both AppIcon names and React components
 * Icons are center-aligned within their container
 */
function createToastIcon(
  icon: AppIconName | React.ReactElement,
  iconColor?: string
): React.ReactElement {
  const iconElement = React.isValidElement(icon) ? (
    icon
  ) : (
    <AppIcon name={icon as AppIconName} size={20} color={iconColor} />
  );

  // Wrap icon in a centered container
  return <View style={styles.iconContainer}>{iconElement}</View>;
}

// ============================================================================
// Toast Provider Component
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useUnistyles();

  return (
    <>
      {children}
      <Toaster
        position="top-center"
        duration={3000}
        offset={60}
        swipeToDismissDirection="up"
        toastOptions={{
          style: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderWidth: 1,
          },
          titleStyle: {
            color: theme.colors.text,
            fontWeight: '600',
            fontSize: 16,
          },
          descriptionStyle: {
            color: theme.colors.text,
            opacity: 0.8,
            fontSize: 14,
          },
        }}
        richColors={true}
      />
    </>
  );
}

// ============================================================================
// Toast API Functions
// ============================================================================

export const AppToast = {
  success: (message: string, options?: Omit<ToastOptions, 'message'>) => {
    const position = options?.position === 'bottom' ? 'bottom-center' : 'top-center';
    const toastOptions = {
      description: options?.title ? message : undefined,
      duration: options?.duration || 3000,
      position: position as 'top-center' | 'bottom-center',
      icon: options?.icon ? createToastIcon(options.icon, options?.iconColor) : undefined,
    };

    if (options?.title) {
      toast.success(options.title, toastOptions);
    } else {
      toast.success(message, toastOptions);
    }
  },

  error: (message: string, options?: Omit<ToastOptions, 'message'>) => {
    const position = options?.position === 'bottom' ? 'bottom-center' : 'top-center';
    const toastOptions = {
      description: options?.title ? message : undefined,
      duration: options?.duration || 4000,
      position: position as 'top-center' | 'bottom-center',
      icon: options?.icon ? createToastIcon(options.icon, options?.iconColor) : undefined,
    };

    if (options?.title) {
      toast.error(options.title, toastOptions);
    } else {
      toast.error(message, toastOptions);
    }
  },

  info: (message: string, options?: Omit<ToastOptions, 'message'>) => {
    const position = options?.position === 'bottom' ? 'bottom-center' : 'top-center';
    const toastOptions = {
      description: options?.title ? message : undefined,
      duration: options?.duration || 3000,
      position: position as 'top-center' | 'bottom-center',
      icon: options?.icon ? createToastIcon(options.icon, options?.iconColor) : undefined,
    };

    if (options?.title) {
      toast(options.title, toastOptions);
    } else {
      toast(message, toastOptions);
    }
  },

  warn: (message: string, options?: Omit<ToastOptions, 'message'>) => {
    const position = options?.position === 'bottom' ? 'bottom-center' : 'top-center';
    const toastOptions = {
      description: options?.title ? message : undefined,
      duration: options?.duration || 3000,
      position: position as 'top-center' | 'bottom-center',
      icon: options?.icon ? createToastIcon(options.icon, options?.iconColor) : undefined,
    };

    if (options?.title) {
      toast.warning(options.title, toastOptions);
    } else {
      toast.warning(message, toastOptions);
    }
  },

  hide: () => {
    toast.dismiss();
  },
};

const styles = StyleSheet.create(() => ({
  iconContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    flex: 1,
  },
}));
