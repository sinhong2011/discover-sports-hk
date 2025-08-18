/**
 * Styles for FilterBar component
 */

import { StyleSheet } from 'react-native-unistyles';

export const filterBarStyles = StyleSheet.create((theme) => ({
  // Main container
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.colors.icon}20`, // 20% opacity
  },

  // Title styles
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },

  // Grid container for responsive layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },

  // Scroll view styles (legacy - kept for compatibility)
  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingRight: 16,
    gap: 8,
  },

  // Sport button styles
  sportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: `${theme.colors.icon}40`, // 40% opacity
    marginRight: 8,
    minHeight: 32,
    gap: 6,
  },

  sportButtonSelected: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },

  // Sport button text styles
  sportButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },

  sportButtonSelectedText: {
    color: '#FFFFFF',
  },
}));
