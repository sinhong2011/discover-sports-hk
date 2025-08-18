/**
 * SkeletonTest Component
 * A test component to verify skeleton implementations are working correctly
 * Use this to debug and compare different skeleton approaches
 */

import type React from 'react';
import { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { SkeletonWrapper } from './SkeletonWrapper';
import { CustomSkeletonWrapper } from './CustomSkeletonWrapper';
import { EnhancedDatePageSkeleton } from './EnhancedDatePageSkeleton';
import { DatePageSkeleton } from './DatePageSkeleton';

// ============================================================================
// Component
// ============================================================================

export const SkeletonTest: React.FC = () => {
  const { theme } = useUnistyles();
  const [isLoading, setIsLoading] = useState(true);

  const toggleLoading = () => setIsLoading(!isLoading);

  return (
    <View style={styles.container}>
      {/* Control Button */}
      <TouchableOpacity style={styles.button} onPress={toggleLoading}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Hide Skeleton' : 'Show Skeleton'}
        </Text>
      </TouchableOpacity>

      {/* Test Section 1: Original SkeletonWrapper */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Original SkeletonWrapper (react-native-auto-skeleton)
        </Text>
        <SkeletonWrapper isLoading={isLoading}>
          <View style={styles.testContent}>
            <Text style={[styles.testText, { color: theme.colors.text }]}>
              This is test content that should be hidden when loading
            </Text>
          </View>
        </SkeletonWrapper>
      </View>

      {/* Test Section 2: Custom SkeletonWrapper */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Custom SkeletonWrapper (react-native-reanimated)
        </Text>
        <CustomSkeletonWrapper isLoading={isLoading}>
          <View style={styles.testContent}>
            <Text style={[styles.testText, { color: theme.colors.text }]}>
              This is test content that should be hidden when loading
            </Text>
          </View>
        </CustomSkeletonWrapper>
      </View>

      {/* Test Section 3: Enhanced DatePage Skeleton */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Enhanced DatePage Skeleton
        </Text>
        <EnhancedDatePageSkeleton 
          isLoading={isLoading} 
          venueCount={2} 
          timeSlotsPerVenue={4}
        />
      </View>

      {/* Test Section 4: Original DatePage Skeleton */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Original DatePage Skeleton
        </Text>
        <DatePageSkeleton 
          isLoading={isLoading} 
          venueCount={2} 
          timeSlotsPerVenue={4}
        />
      </View>
    </View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  button: {
    backgroundColor: theme.colors.tint,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme.colors.skeletonCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.skeletonElement,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  testContent: {
    padding: 20,
    backgroundColor: theme.colors.skeletonElement,
    borderRadius: 8,
    minHeight: 60,
    justifyContent: 'center',
  },
  testText: {
    fontSize: 14,
    textAlign: 'center',
  },
}));
