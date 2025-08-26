import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';
import '../unistyles';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="zh-HK">
      <head />
      <body>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}
