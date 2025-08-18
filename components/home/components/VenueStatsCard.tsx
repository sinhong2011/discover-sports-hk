/**
 * Venue Stats Card Component
 * Displays statistics about venue time slots using HomeTabContext
 * Demonstrates how to consume the HomeTabProvider context in child components
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { getSportTypeMessage } from '@/constants/SportTranslations';
import { useHomeTabContext } from '@/providers/HomeTabProvider';

// ============================================================================
// Translation Messages
// ============================================================================

const statsTitle = msg`Venue Statistics`;
const totalTimeSlotsLabel = msg`Total Time Slots`;
const availableDatesLabel = msg`Available Dates`;
const uniqueVenuesLabel = msg`Unique Venues`;
const uniqueDistrictsLabel = msg`Districts`;
const loadingLabel = msg`Loading...`;
const errorLabel = msg`Error loading data`;
const noDataLabel = msg`No data available`;

// ============================================================================
// Component
// ============================================================================

interface VenueStatsCardProps {
  /**
   * Whether to show the card in compact mode
   * @default false
   */
  compact?: boolean;
}

export function VenueStatsCard({ compact = false }: VenueStatsCardProps) {
  const { t } = useLingui();

  // Get data from HomeTabContext
  const {
    totalTimeSlots,
    availableDates,
    uniqueVenues,
    uniqueDistricts,
    selectedSportType,
    isLoading,
    isError,
    error,
    hasData,
    isEmpty,
  } = useHomeTabContext();

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.title}>{t(statsTitle)}</Text>
        <Text style={styles.loadingText}>{t(loadingLabel)}</Text>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.title}>{t(statsTitle)}</Text>
        <Text style={styles.errorText}>
          {t(errorLabel)}: {error?.message || 'Unknown error'}
        </Text>
      </View>
    );
  }

  // Show empty state
  if (isEmpty || !hasData) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.title}>{t(statsTitle)}</Text>
        <Text style={styles.emptyText}>{t(noDataLabel)}</Text>
      </View>
    );
  }

  // Render stats in compact mode
  if (compact) {
    return (
      <View style={[styles.container, styles.containerCompact]}>
        <Text style={styles.titleCompact}>{t(statsTitle)}</Text>
        <View style={styles.statsRowCompact}>
          <Text style={styles.statValueCompact}>{totalTimeSlots}</Text>
          <Text style={styles.statLabelCompact}>{t(totalTimeSlotsLabel)}</Text>
        </View>
      </View>
    );
  }

  // Render full stats
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t(statsTitle)}</Text>
      <Text style={styles.subtitle}>{t(getSportTypeMessage(selectedSportType))}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalTimeSlots}</Text>
          <Text style={styles.statLabel}>{t(totalTimeSlotsLabel)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{availableDates.length}</Text>
          <Text style={styles.statLabel}>{t(availableDatesLabel)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{uniqueVenues.length}</Text>
          <Text style={styles.statLabel}>{t(uniqueVenuesLabel)}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{uniqueDistricts.length}</Text>
          <Text style={styles.statLabel}>{t(uniqueDistrictsLabel)}</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerCompact: {
    padding: 12,
    marginVertical: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statValueCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statLabelCompact: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  statsRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}));

// ============================================================================
// Exports
// ============================================================================

export default React.memo(VenueStatsCard);
