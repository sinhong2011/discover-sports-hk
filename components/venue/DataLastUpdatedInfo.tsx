/**
 * DataLastUpdatedInfo Component
 * Displays when the venue data was last updated from the API
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import type React from 'react';
import { useMemo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/ui/Card';
import { AppIcon } from '@/components/ui/Icon';
import type { SportType } from '@/constants/Sport';
import { useDateFormatting } from '@/hooks/useDateFormatting';
import { useSportDataLastUpdated } from '@/store/useSportVenueStore';

// ============================================================================
// Translation Messages
// ============================================================================

const dataLastUpdatedMessage = msg`Data last updated`;
const justNowMessage = msg`just now`;
const unknownMessage = msg`Unknown`;

// ============================================================================
// Types
// ============================================================================

interface DataLastUpdatedInfoProps {
  sportType: SportType;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
}

// ============================================================================
// DataLastUpdatedInfo Component
// ============================================================================

export const DataLastUpdatedInfo: React.FC<DataLastUpdatedInfoProps> = ({
  sportType,
  variant = 'default',
  showIcon = true,
}) => {
  const { t } = useLingui();
  const { locale } = useDateFormatting();
  const lastUpdated = useSportDataLastUpdated(sportType);

  // Format the last updated timestamp
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) {
      return t(unknownMessage);
    }

    try {
      const date = parseISO(lastUpdated);

      if (!isValid(date)) {
        return t(unknownMessage);
      }

      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      // If less than 1 minute ago, show "just now"
      if (diffInMinutes < 1) {
        return t(justNowMessage);
      }

      // If less than 24 hours ago, show relative time
      if (diffInMinutes < 24 * 60) {
        return formatDistanceToNow(date, {
          addSuffix: true,
          locale: locale,
        });
      }

      // If more than 24 hours ago, show absolute date and time
      return format(date, 'MMM d, yyyy HH:mm', { locale: locale });
    } catch (error) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn('Error formatting last updated date:', error);
      }
      return t(unknownMessage);
    }
  }, [lastUpdated, t, locale]);

  // Don't render if no data
  if (!lastUpdated) {
    return null;
  }

  const textStyle = variant === 'compact' ? styles.compactText : styles.text;
  const iconSize = variant === 'compact' ? 12 : 14;
  const cardSize = variant === 'compact' ? 'small' : 'medium';

  return (
    <Card
      variant="default"
      size={cardSize}
      margin={{ horizontal: 16, bottom: 6 }}
      padding={{ horizontal: 10, vertical: 6 }}
    >
      <View style={styles.content}>
        {showIcon && <AppIcon name="time" size={iconSize} color="#6B7280" style={styles.icon} />}
        <ThemedText style={textStyle}>
          {t(dataLastUpdatedMessage)}: {formattedLastUpdated}
        </ThemedText>
      </View>
    </Card>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 6,
  },

  text: {
    fontSize: 12,
    color: theme.colors.icon,
    fontWeight: '400',
  },

  compactText: {
    fontSize: 11,
    color: theme.colors.icon,
    fontWeight: '400',
  },
}));
