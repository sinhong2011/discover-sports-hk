/**
 * Bookmarks Stack Navigator
 * Handles navigation between bookmarks list and venue details screens
 */

import { Stack } from 'expo-router';
import { BookmarksTabProvider } from '@/providers';
import { useSharedHeaderConfig } from '@/utils/headerConfig';

export default function BookmarksLayout() {
  const sharedHeaderConfig = useSharedHeaderConfig();

  return (
    <BookmarksTabProvider>
      <Stack screenOptions={sharedHeaderConfig}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false, // We'll use our own header in the bookmarks list
          }}
        />
      </Stack>
    </BookmarksTabProvider>
  );
}
