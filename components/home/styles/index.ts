/**
 * Styles for Home Screen components
 */

import { StyleSheet } from 'react-native-unistyles';

export const homeScreenStyles = StyleSheet.create((theme) => ({
  // Main container
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header styles
  header: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  headerContent: {},
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.icon,
    marginTop: 2,
  },

  // Sport type selector styles
  sportTypeContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sportTypeList: {
    paddingHorizontal: 20,
  },
  sportTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.icon,
  },
  sportTypeChipSelected: {
    backgroundColor: theme.colors.tint,
    borderColor: theme.colors.tint,
  },
  sportTypeText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  sportTypeTextSelected: {
    color: theme.colors.background,
    fontWeight: '600',
  },

  // Stats container styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.tint,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.icon,
    marginTop: 4,
  },

  // Venue list styles
  venueList: {
    flex: 1,
  },
  venueListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Venue card styles
  venueCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.icon,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  venueType: {
    fontSize: 14,
    color: theme.colors.tint,
    fontWeight: '500',
  },
  venueLocation: {
    fontSize: 14,
    color: theme.colors.icon,
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 12,
    color: theme.colors.tabIconDefault,
    marginBottom: 12,
  },

  // Facilities styles
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  facilityTag: {
    backgroundColor: theme.colors.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  facilityText: {
    fontSize: 11,
    color: theme.colors.background,
    fontWeight: '500',
  },
  moreFacilities: {
    fontSize: 11,
    color: theme.colors.icon,
    fontStyle: 'italic',
  },

  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.icon,
    marginTop: 16,
  },

  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: 20,
  },
}));
