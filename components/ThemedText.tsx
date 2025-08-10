import { Text, type TextProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { rt } = useUnistyles();
  const overrideColor = rt.themeName === 'dark' ? darkColor : lightColor;

  return (
    <Text
      style={[
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        overrideColor ? { color: overrideColor } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: theme.colors.tint,
  },
}));
