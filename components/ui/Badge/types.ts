import type { TextStyle, ViewStyle } from 'react-native';

export interface BadgeProps {
  /** Content to display inside the badge */
  children: React.ReactNode;
  /** Whether the badge is in selected state */
  selected?: boolean;
  /** Whether the badge is in disabled state */
  disabled?: boolean;
  /** Additional styles for the badge container */
  style?: ViewStyle;
  /** Additional styles for the text */
  textStyle?: TextStyle;
  /** Test ID for testing purposes */
  testID?: string;
}
