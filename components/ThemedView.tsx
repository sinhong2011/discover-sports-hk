import { View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { rt } = useUnistyles();
  const override = rt.themeName === 'dark' ? darkColor : lightColor;

  return (
    <View
      style={[styles.container, override ? { backgroundColor: override } : undefined, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
  },
}));
