/**
 * Debug Panel Component
 * Allows viewing debug logs in TestFlight builds
 * Can be accessed by tapping a hidden area or through dev menu
 */

import * as Clipboard from 'expo-clipboard';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { clearDebugLogs, debugLog, exportDebugLogs, getDebugLogs } from '@/utils/debugLogger';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const { theme } = useUnistyles();
  const [refreshKey, setRefreshKey] = useState(0);

  const debugLogs = getDebugLogs();

  // Log when debug panel opens
  useEffect(() => {
    if (visible) {
      debugLog('DebugPanel', 'Debug panel opened', {
        totalLogs: debugLogs.length,
        timestamp: new Date().toISOString(),
      });
    }
  }, [visible, debugLogs.length]);

  const handleClearLogs = () => {
    clearDebugLogs();
    setRefreshKey((prev) => prev + 1);
  };

  const handleExportLogs = () => {
    const logsString = exportDebugLogs();
    // In a real app, you might want to share this via email or copy to clipboard
    console.log('Debug Logs Export:', logsString);
  };

  const handleGenerateTestLogs = () => {
    debugLog('Test', 'Manual test log generated', {
      timestamp: new Date().toISOString(),
      testData: 'This is a test log entry',
      randomNumber: Math.floor(Math.random() * 1000),
    });
    setRefreshKey((prev) => prev + 1);
  };

  const handleCopyToClipboard = async () => {
    try {
      // Create a user-friendly formatted version for sharing
      const timestamp = new Date().toISOString();
      const appInfo = {
        app: 'Discover Sports HK',
        timestamp,
        logCount: debugLogs.length,
        platform: 'iOS TestFlight',
      };

      const formattedLogs = `=== DEBUG LOGS ===
App: ${appInfo.app}
Platform: ${appInfo.platform}
Generated: ${appInfo.timestamp}
Total Logs: ${appInfo.logCount}

=== LOGS DATA ===
${exportDebugLogs()}

=== END DEBUG LOGS ===

Instructions for Developer:
- This debug information was generated from the TestFlight app
- Copy and paste this entire message when reporting issues
- Include description of the problem you experienced`;

      await Clipboard.setStringAsync(formattedLogs);

      // Show success feedback
      Alert.alert(
        'Copied to Clipboard! 📋',
        'Debug logs have been copied with formatting. You can now paste them in an email, message, or issue report to share with developers.',
        [{ text: 'OK' }]
      );

      // Log the copy action
      debugLog('DebugPanel', 'Logs copied to clipboard', {
        logCount: debugLogs.length,
        timestamp,
        formattedLength: formattedLogs.length,
      });
    } catch (error) {
      // Handle clipboard errors gracefully
      console.error('Failed to copy to clipboard:', error);
      Alert.alert(
        'Copy Failed ❌',
        'Unable to copy logs to clipboard. This might be due to clipboard permissions. Please try the Export Logs button instead or restart the app.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <ThemedText style={styles.title}>Debug Panel</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AppIcon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleGenerateTestLogs}
            style={[styles.button, { backgroundColor: '#28a745' }]}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>Test Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyToClipboard}
            style={[
              styles.button,
              {
                backgroundColor: debugLogs.length > 0 ? '#007AFF' : '#8E8E93',
                opacity: debugLogs.length > 0 ? 1 : 0.6,
              },
            ]}
            disabled={debugLogs.length === 0}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Copy {debugLogs.length > 0 ? `(${debugLogs.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearLogs}
            style={[styles.button, { backgroundColor: '#FF3B30' }]}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExportLogs}
            style={[styles.button, { backgroundColor: '#8E8E93' }]}
          >
            <Text style={[styles.buttonText, { color: 'white' }]}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Logs */}
        <ScrollView style={styles.logsContainer} key={refreshKey}>
          {debugLogs.length === 0 ? (
            <ThemedText style={styles.noLogsText}>No debug logs available</ThemedText>
          ) : (
            debugLogs.map((log, index) => (
              <View
                key={index}
                style={[styles.logEntry, { borderBottomColor: theme.colors.border }]}
              >
                <Text style={[styles.logText, { color: theme.colors.text }]}>
                  {JSON.stringify(log, null, 2)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  noLogsText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 32,
  },
  logEntry: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
}));
