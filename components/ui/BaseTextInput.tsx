/**
 * BaseTextInput Component
 * A reusable TextInput component with consistent styling using unistyles
 * Supports light/dark themes automatically based on device system theme
 */

import { debounce } from 'es-toolkit';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// ============================================================================
// Component Props
// ============================================================================

export interface BaseTextInputProps extends TextInputProps {
  /** Input variant for different styling */
  variant?: 'default' | 'outlined' | 'filled';
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the input has an error state */
  hasError?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Left icon or component */
  leftElement?: React.ReactNode;
  /** Right icon or component */
  rightElement?: React.ReactNode;
  /** Container style override */
  containerStyle?: object;
  /** Input wrapper style override */
  inputWrapperStyle?: object;
  /** Test ID for testing */
  testID?: string;
  /** Debounce delay in milliseconds for onChangeText (default: no debouncing) */
  debounceMs?: number;
}

// ============================================================================
// Component Implementation
// ============================================================================

export const BaseTextInput = forwardRef<TextInput, BaseTextInputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      hasError = false,
      disabled = false,
      leftElement,
      rightElement,
      style,
      containerStyle,
      inputWrapperStyle,
      placeholderTextColor,
      testID,
      debounceMs,
      onChangeText,
      ...textInputProps
    },
    ref
  ) => {
    const { theme } = useUnistyles();

    // Create debounced version of onChangeText if debounceMs is provided
    const debouncedOnChangeText = useRef<
      | (((text: string) => void) & { cancel: () => void; flush: () => void; schedule: () => void })
      | null
    >(null);

    // Create or update the debounced function when debounceMs or onChangeText changes
    useEffect(() => {
      if (debounceMs && onChangeText) {
        debouncedOnChangeText.current = debounce(onChangeText, debounceMs);
      } else {
        debouncedOnChangeText.current = null;
      }

      // Cleanup function to cancel any pending debounced calls
      return () => {
        if (debouncedOnChangeText.current) {
          // es-toolkit's debounce returns a function with cancel, flush, and schedule methods
          debouncedOnChangeText.current.cancel();
        }
      };
    }, [debounceMs, onChangeText]);

    // Handle text change with optional debouncing
    const handleChangeText = useCallback(
      (text: string) => {
        if (debouncedOnChangeText.current) {
          // Use debounced version
          debouncedOnChangeText.current(text);
        } else if (onChangeText) {
          // Use original function directly
          onChangeText(text);
        }
      },
      [onChangeText]
    );

    // Use variants with unistyles (only for non-default values)
    styles.useVariants({
      variant: variant !== 'default' ? variant : undefined,
      size: size !== 'md' ? size : undefined,
    });

    // Determine placeholder color based on theme if not provided
    const finalPlaceholderTextColor = placeholderTextColor || theme.colors.icon;

    return (
      <View style={[styles.container, containerStyle]} testID={testID}>
        <View
          style={[
            styles.inputWrapper,
            hasError && styles.inputWrapperError,
            disabled && styles.inputWrapperDisabled,
            inputWrapperStyle,
          ]}
        >
          {leftElement && <View style={styles.leftElement}>{leftElement}</View>}

          <TextInput
            ref={ref}
            style={[styles.input, disabled && styles.inputDisabled, style]}
            placeholderTextColor={finalPlaceholderTextColor}
            editable={!disabled}
            onChangeText={handleChangeText}
            {...textInputProps}
          />

          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
      </View>
    );
  }
);

BaseTextInput.displayName = 'BaseTextInput';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}40`, // 40% opacity - default variant
    // Default size (md)
    minHeight: 44,
    paddingHorizontal: 16,
    variants: {
      variant: {
        outlined: {
          backgroundColor: 'transparent',
          borderColor: `${theme.colors.icon}60`,
          borderWidth: 1.5,
        },
        filled: {
          backgroundColor: `${theme.colors.icon}10`, // 10% opacity
          borderColor: 'transparent',
        },
      },
      size: {
        sm: {
          minHeight: 36,
          paddingHorizontal: 12,
        },
        lg: {
          minHeight: 52,
          paddingHorizontal: 20,
        },
      },
    },
  },

  inputWrapperError: {
    borderColor: '#ef4444', // Red color for error state
    borderWidth: 1.5,
  },

  inputWrapperDisabled: {
    backgroundColor: `${theme.colors.icon}05`, // 5% opacity
    borderColor: `${theme.colors.icon}20`, // 20% opacity
  },

  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16, // Default size (md)
    lineHeight: 20,
    paddingVertical: 0, // Remove default padding to control height precisely
    variants: {
      size: {
        sm: {
          fontSize: 14,
          lineHeight: 18,
        },
        lg: {
          fontSize: 18,
          lineHeight: 22,
        },
      },
    },
  },

  inputDisabled: {
    color: `${theme.colors.icon}60`, // 60% opacity for disabled text
  },

  leftElement: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rightElement: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
