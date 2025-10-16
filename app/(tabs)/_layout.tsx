import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  const { t } = useLingui();

  return (
    <NativeTabs disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index">
        <Label>{t(msg`Home`)}</Label>
        <Icon sf="house.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="bookmarks">
        <Label>{t(msg`Bookmarks`)}</Label>
        <Icon sf="bookmark.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>{t(msg`Settings`)}</Label>
        <Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
