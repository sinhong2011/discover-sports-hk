/**
 * SearchBar Component
 * A search input component with search icon and clear functionality
 * Integrates with the locale system for internationalized placeholder text
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useRef } from 'react';
import { Pressable, type TextInput } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { BaseTextInput, type BaseTextInputProps } from './BaseTextInput';
import { AppIcon } from './Icon';

// ============================================================================
// Translation Messages
// ============================================================================

const searchPlaceholder = msg`Search`;
const clearSearchLabel = msg`Clear search`;
const searchLabel = msg`Search`;

// ============================================================================
// Component Props
// ============================================================================

export interface SearchBarProps extends Omit<BaseTextInputProps, 'leftElement' | 'rightElement'> {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChangeText: (text: string) => void;
  /** Callback when search is cleared */
  onClear?: () => void;
  /** Callback when search is submitted */
  onSubmit?: (text: string) => void;
  /** Whether to show the clear button */
  showClearButton?: boolean;
  /** Custom placeholder text (overrides default localized placeholder) */
  customPlaceholder?: string;
  /** Whether the search is currently active/focused */
  isActive?: boolean;
  /** Callback when search becomes active/inactive */
  onActiveChange?: (isActive: boolean) => void;
}

// ============================================================================
// Component Implementation
// ============================================================================

export function SearchBar({
  value,
  onChangeText,
  onClear,
  onSubmit,
  showClearButton = true,
  customPlaceholder,
  isActive = false,
  onActiveChange,
  variant = 'filled',
  size = 'md',
  testID = 'search-bar',
  ...baseTextInputProps
}: SearchBarProps) {
  const { t } = useLingui();
  const inputRef = useRef<TextInput>(null);

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const handleSubmit = useCallback(() => {
    onSubmit?.(value);
    inputRef.current?.blur();
  }, [onSubmit, value]);

  const handleFocus = useCallback(() => {
    onActiveChange?.(true);
  }, [onActiveChange]);

  const handleBlur = useCallback(() => {
    onActiveChange?.(false);
  }, [onActiveChange]);

  // ============================================================================
  // Render Elements
  // ============================================================================

  const searchIcon = (
    <AppIcon
      name="search"
      size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
      color={styles.searchIcon.color}
    />
  );

  const clearButton = showClearButton && value.length > 0 && (
    <Pressable
      onPress={handleClear}
      style={styles.clearButton}
      accessibilityRole="button"
      accessibilityLabel={t(clearSearchLabel)}
      testID={`${testID}-clear-button`}
    >
      <AppIcon
        name="close"
        size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
        color={styles.clearIcon.color}
      />
    </Pressable>
  );

  // ============================================================================
  // Render Component
  // ============================================================================

  return (
    <BaseTextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      onSubmitEditing={handleSubmit}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={customPlaceholder || t(searchPlaceholder)}
      returnKeyType="search"
      clearButtonMode="never" // We handle clear button manually
      autoCapitalize="none"
      autoCorrect={false}
      variant={variant}
      size={size}
      leftElement={searchIcon}
      rightElement={clearButton}
      containerStyle={[styles.container, isActive && styles.containerActive]}
      inputWrapperStyle={[styles.inputWrapper, isActive && styles.inputWrapperActive]}
      accessibilityLabel={t(searchLabel)}
      accessibilityRole="search"
      testID={testID}
      {...baseTextInputProps}
    />
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    // Base container styles
  },

  containerActive: {
    // Active state styles for container
  },

  inputWrapper: {
    // Base input wrapper styles
  },

  inputWrapperActive: {
    borderColor: theme.colors.tint,
    borderWidth: 1.5,
  },

  searchIcon: {
    color: theme.colors.icon,
  },

  clearButton: {
    padding: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },

  clearIcon: {
    color: theme.colors.icon,
  },
}));
