/**
 * Alert Test Screen
 * Test the Alert component and AlertProvider functionality
 */

import { ThemedText } from '@/components/ThemedText';
import { Alert } from '@/components/ui/Alert';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { useAlert } from '@/providers/AlertProvider';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

// Define translation messages
const sportsListFailed = msg`Failed to fetch sports list`;
const errorTitle = msg`Error`;
const done = msg`Done`;

export default function AlertTestScreen() {
  const [showInlineAlert, setShowInlineAlert] = useState(false);
  const { showError, showWarning, showSuccess, showInfo } = useAlert();
  const { t } = useLingui();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Alert Component Test
        </ThemedText>

        {/* Inline Alert Example */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Inline Alert
          </ThemedText>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowInlineAlert(!showInlineAlert)}
          >
            <ThemedText style={styles.buttonText}>
              {showInlineAlert ? 'Hide' : 'Show'} Inline Alert
            </ThemedText>
          </TouchableOpacity>

          {showInlineAlert && (
            <Alert
              variant="error"
              title="Test Error"
              message={t(sportsListFailed)}
              onDismiss={() => setShowInlineAlert(false)}
            />
          )}
        </View>

        {/* Toast Alert Examples */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Toast Alerts
          </ThemedText>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.errorButton]}
              onPress={() => showError(t(sportsListFailed), t(errorTitle))}
            >
              <ThemedText style={styles.buttonText}>Sports Error</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.warningButton]}
              onPress={() => showWarning('This is a warning', 'Warning')}
            >
              <ThemedText style={styles.buttonText}>Warning</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.successButton]}
              onPress={() => showSuccess(t(done), 'Success')}
            >
              <ThemedText style={styles.buttonText}>Success</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.infoButton]}
              onPress={() => showInfo('This is info', 'Info')}
            >
              <ThemedText style={styles.buttonText}>Info</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.colors.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  successButton: {
    backgroundColor: '#34C759',
  },
  infoButton: {
    backgroundColor: '#007AFF',
  },
}));
