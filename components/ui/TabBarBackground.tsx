import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native-unistyles';

export function useBottomTabOverflow() {
  return 0;
}

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  return <BlurView tint="light" intensity={100} style={styles.absoluteFill} />;
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});
