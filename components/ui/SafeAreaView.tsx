import React from "react"
import { View, type ViewProps } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StyleSheet } from "react-native-unistyles"

interface SafeAreaViewProps extends ViewProps {
  /**
   * Whether to apply top safe area inset
   * @default true
   */
  top?: boolean
  /**
   * Whether to apply bottom safe area inset
   * @default true
   */
  bottom?: boolean
  /**
   * Whether to apply left safe area inset
   * @default true
   */
  left?: boolean
  /**
   * Whether to apply right safe area inset
   * @default true
   */
  right?: boolean
  /**
   * Additional padding to add to the safe area insets
   */
  additionalPadding?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
}

/**
 * A custom SafeAreaView component that integrates with unistyles
 * and provides fine-grained control over which safe area insets to apply
 */
export function SafeAreaView({
  top = true,
  bottom = true,
  left = true,
  right = true,
  additionalPadding,
  style,
  children,
  ...props
}: SafeAreaViewProps) {
  const insets = useSafeAreaInsets()

  const safeAreaStyle = {
    paddingTop: top
      ? insets.top + (additionalPadding?.top ?? 0)
      : additionalPadding?.top ?? 0,
    paddingBottom: bottom
      ? insets.bottom + (additionalPadding?.bottom ?? 0)
      : additionalPadding?.bottom ?? 0,
    paddingLeft: left
      ? insets.left + (additionalPadding?.left ?? 0)
      : additionalPadding?.left ?? 0,
    paddingRight: right
      ? insets.right + (additionalPadding?.right ?? 0)
      : additionalPadding?.right ?? 0,
  }

  return (
    <View style={[styles.container, safeAreaStyle, style]} {...props}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff", // Default light theme background
  },
})
