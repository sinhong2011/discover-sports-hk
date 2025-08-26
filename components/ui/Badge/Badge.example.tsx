/**
 * Badge Component Examples
 * Demonstrates different states and usage patterns of the Badge component
 */

import type React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { ThemedText } from '@/components/ThemedText';
import { Badge } from './Badge';

export const BadgeExamples: React.FC = () => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Badge Examples</ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Default State</ThemedText>
        <View style={styles.row}>
          <Badge>5</Badge>
          <Badge>12</Badge>
          <Badge>99+</Badge>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Selected State</ThemedText>
        <View style={styles.row}>
          <Badge selected>3</Badge>
          <Badge selected>8</Badge>
          <Badge selected>15</Badge>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Disabled State</ThemedText>
        <View style={styles.row}>
          <Badge disabled>0</Badge>
          <Badge disabled>2</Badge>
          <Badge disabled>7</Badge>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Mixed States</ThemedText>
        <View style={styles.row}>
          <Badge>4</Badge>
          <Badge selected>6</Badge>
          <Badge disabled>0</Badge>
          <Badge selected disabled>
            1
          </Badge>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 20,
    backgroundColor: theme.colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.colors.text,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
}));

export default BadgeExamples;
