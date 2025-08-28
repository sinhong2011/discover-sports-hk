/**
 * Theme Debugger Component
 * A debug component to test theme switching and verify theme adaptation
 * This component should only be used in development
 */

import { TouchableOpacity, View } from 'react-native';
import { StyleSheet, UnistylesRuntime, useUnistyles } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';

export function ThemeDebugger() {
  const { theme, rt } = useUnistyles();

  if (!__DEV__) {
    return null;
  }

  const handleToggleAdaptiveThemes = () => {
    UnistylesRuntime.setAdaptiveThemes(!rt.hasAdaptiveThemes);
  };

  const handleSetLightTheme = () => {
    if (!rt.hasAdaptiveThemes) {
      UnistylesRuntime.setTheme('light');
    }
  };

  const handleSetDarkTheme = () => {
    if (!rt.hasAdaptiveThemes) {
      UnistylesRuntime.setTheme('dark');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Theme Debugger</ThemedText>

      <View style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>Current Theme: {rt.themeName || 'unknown'}</ThemedText>
        <ThemedText style={styles.infoText}>
          Adaptive Themes: {rt.hasAdaptiveThemes ? 'Enabled' : 'Disabled'}
        </ThemedText>
        <ThemedText style={styles.infoText}>Color Scheme: {rt.colorScheme || 'unknown'}</ThemedText>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.tint }]}
          onPress={handleToggleAdaptiveThemes}
        >
          <ThemedText style={styles.buttonText}>
            {rt.hasAdaptiveThemes ? 'Disable' : 'Enable'} Adaptive Themes
          </ThemedText>
        </TouchableOpacity>

        {!rt.hasAdaptiveThemes && (
          <>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.border }]}
              onPress={handleSetLightTheme}
            >
              <ThemedText style={styles.buttonText}>Set Light Theme</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.border }]}
              onPress={handleSetDarkTheme}
            >
              <ThemedText style={styles.buttonText}>Set Dark Theme</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.colorPreview}>
        <ThemedText style={styles.previewTitle}>Color Preview:</ThemedText>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.background }]} />
          <ThemedText style={styles.colorLabel}>Background</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.text }]} />
          <ThemedText style={styles.colorLabel}>Text</ThemedText>
        </View>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.tint }]} />
          <ThemedText style={styles.colorLabel}>Tint</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.tint,
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: theme.colors.text,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.text,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  button: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  colorPreview: {
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.text,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  colorLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
}));
