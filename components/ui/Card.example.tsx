/**
 * Card Component Usage Examples
 * Demonstrates how to use the Card and TouchableCard components
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
import { Card, TouchableCard } from './Card';

// ============================================================================
// Example 1: Basic Card
// ============================================================================

export const BasicCardExample = () => {
  return (
    <Card>
      <ThemedText>This is a basic card with default styling</ThemedText>
    </Card>
  );
};

// ============================================================================
// Example 2: Card Variants
// ============================================================================

export const CardVariantsExample = () => {
  return (
    <View>
      <Card variant="default">
        <ThemedText>Default Card</ThemedText>
      </Card>

      <Card variant="elevated">
        <ThemedText>Elevated Card</ThemedText>
      </Card>

      <Card variant="outlined">
        <ThemedText>Outlined Card</ThemedText>
      </Card>

      <Card variant="surface">
        <ThemedText>Surface Card</ThemedText>
      </Card>
    </View>
  );
};

// ============================================================================
// Example 3: Card Sizes
// ============================================================================

export const CardSizesExample = () => {
  return (
    <View>
      <Card size="small">
        <ThemedText>Small Card</ThemedText>
      </Card>

      <Card size="medium">
        <ThemedText>Medium Card (default)</ThemedText>
      </Card>

      <Card size="large">
        <ThemedText>Large Card</ThemedText>
      </Card>
    </View>
  );
};

// ============================================================================
// Example 4: TouchableCard
// ============================================================================

export const TouchableCardExample = () => {
  const handlePress = () => {
    console.log('Card pressed!');
  };

  return (
    <TouchableCard onPress={handlePress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <AppIcon name="heart" size={20} />
        <ThemedText style={{ marginLeft: 8 }}>Touchable Card</ThemedText>
      </View>
    </TouchableCard>
  );
};

// ============================================================================
// Example 5: Custom Styling
// ============================================================================

export const CustomCardExample = () => {
  return (
    <Card
      variant="elevated"
      size="large"
      borderRadius={16}
      shadow={true}
      margin={{ horizontal: 20, vertical: 10 }}
      padding={{ horizontal: 20, vertical: 16 }}
    >
      <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>Custom Card</ThemedText>
      <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
        This card has custom border radius, margins, and padding
      </ThemedText>
    </Card>
  );
};

// ============================================================================
// Example 6: VenueItem-like Card
// ============================================================================

export const VenueItemCardExample = () => {
  const handleVenuePress = () => {
    console.log('Venue pressed!');
  };

  return (
    <TouchableCard
      onPress={handleVenuePress}
      variant="default"
      size="medium"
      accessibilityRole="button"
      accessibilityLabel="Venue card"
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <ThemedText style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
            Sample Venue Name
          </ThemedText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Courts Info */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(243, 104, 5, 0.12)',
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <AppIcon name="sports" size={14} />
            <ThemedText style={{ fontSize: 14, fontWeight: '600', marginLeft: 3 }}>5</ThemedText>
          </View>

          {/* Bookmark */}
          <AppIcon name="heart" size={18} />
        </View>
      </View>

      {/* Content */}
      <ThemedText style={{ opacity: 0.7 }}>
        This demonstrates how the VenueItem could use the Card component
      </ThemedText>
    </TouchableCard>
  );
};

// ============================================================================
// Example 7: No Shadow Card
// ============================================================================

export const NoShadowCardExample = () => {
  return (
    <Card shadow={false} variant="outlined">
      <ThemedText>Card without shadow</ThemedText>
    </Card>
  );
};

// ============================================================================
// Example 8: Custom Border Radius
// ============================================================================

export const CustomBorderRadiusExample = () => {
  return (
    <View>
      <Card borderRadius={0}>
        <ThemedText>Square Card (no border radius)</ThemedText>
      </Card>

      <Card borderRadius={20}>
        <ThemedText>Highly Rounded Card</ThemedText>
      </Card>
    </View>
  );
};
