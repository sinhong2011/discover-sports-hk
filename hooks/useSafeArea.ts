import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom hook that provides safe area insets and utility functions
 */
export function useSafeArea() {
  const insets = useSafeAreaInsets();

  return {
    /**
     * Raw safe area insets
     */
    insets,
    
    /**
     * Get safe area padding style for specific edges
     */
    getSafeAreaPadding: (edges: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
    }) => ({
      paddingTop: edges.top ? insets.top : 0,
      paddingBottom: edges.bottom ? insets.bottom : 0,
      paddingLeft: edges.left ? insets.left : 0,
      paddingRight: edges.right ? insets.right : 0,
    }),

    /**
     * Get safe area margin style for specific edges
     */
    getSafeAreaMargin: (edges: {
      top?: boolean;
      bottom?: boolean;
      left?: boolean;
      right?: boolean;
    }) => ({
      marginTop: edges.top ? insets.top : 0,
      marginBottom: edges.bottom ? insets.bottom : 0,
      marginLeft: edges.left ? insets.left : 0,
      marginRight: edges.right ? insets.right : 0,
    }),

    /**
     * Check if device has safe area insets (useful for conditional rendering)
     */
    hasSafeArea: {
      top: insets.top > 0,
      bottom: insets.bottom > 0,
      left: insets.left > 0,
      right: insets.right > 0,
    },

    /**
     * Get the total safe area height (top + bottom)
     */
    totalSafeAreaHeight: insets.top + insets.bottom,

    /**
     * Get the total safe area width (left + right)
     */
    totalSafeAreaWidth: insets.left + insets.right,
  };
}
