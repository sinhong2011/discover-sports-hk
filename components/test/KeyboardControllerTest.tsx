/**
 * KeyboardControllerTest Component
 * A test component to verify react-native-keyboard-controller integration
 */

import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { BaseTextInput } from '@/components/ui/BaseTextInput';

// ============================================================================
// Component Implementation
// ============================================================================

export function KeyboardControllerTest() {
  const { theme } = useUnistyles();
  const [testText, setTestText] = useState('');
  const [keyboardStatus, setKeyboardStatus] = useState('Unknown');

  // Test keyboard controller hooks
  const { height, progress } = useKeyboardController();

  useEffect(() => {
    if (height > 0) {
      setKeyboardStatus(`Visible (${height}px)`);
    } else {
      setKeyboardStatus('Hidden');
    }
  }, [height]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Keyboard Controller Test</Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Keyboard Status:</Text>
        <Text style={[styles.statusValue, { color: theme.colors.primary }]}>{keyboardStatus}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, { color: theme.colors.text }]}>Animation Progress:</Text>
        <Text style={[styles.statusValue, { color: theme.colors.primary }]}>
          {progress.toFixed(2)}
        </Text>
      </View>

      <BaseTextInput
        placeholder="Type here to test keyboard controller..."
        value={testText}
        onChangeText={setTestText}
        variant="outlined"
        containerStyle={styles.textInput}
      />

      <Text style={[styles.instructions, { color: theme.colors.textSecondary }]}>
        Focus the input above to test keyboard detection. The status should update when the keyboard
        appears/disappears.
      </Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    marginTop: 20,
    marginBottom: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
}));
