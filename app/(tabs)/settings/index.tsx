/**
 * Settings Screen - Main Settings Page
 * iOS 18-style settings page with navigation to sub-pages
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import type React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { HomeHeader } from '@/components/home/components';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon, type AppIconName } from '@/components/ui/Icon';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { useAppStore } from '@/store';

// Language options with proper labels
const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English' },
  { code: 'zh-HK' as const, label: '繁體中文', nativeLabel: '繁體中文 (香港)' },
];

interface SettingsRowProps {
  title: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  icon?: AppIconName;
}

function SettingsRow({ title, value, onPress, showChevron = true, icon }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingsRowContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <AppIcon name={icon} size={20} color="#ffffff" />
          </View>
        )}
        <ThemedText style={styles.settingsRowTitle}>{title}</ThemedText>
        <View style={styles.settingsRowRight}>
          {value && <ThemedText style={styles.settingsRowValue}>{value}</ThemedText>}
          {showChevron && onPress && <AppIcon name="forward" size={16} color="#687076" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  footer?: string;
}

function SettingsSection({ title, children, footer }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      {title && <ThemedText style={styles.sectionHeader}>{title}</ThemedText>}
      <ThemedView style={styles.sectionContent}>{children}</ThemedView>
      {footer && <ThemedText style={styles.sectionFooter}>{footer}</ThemedText>}
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useLingui();
  const { preferences } = useAppStore();

  // Get current language display name
  const currentLanguageOption = LANGUAGE_OPTIONS.find(
    (option) => option.code === preferences.language
  );
  const currentLanguageLabel = currentLanguageOption?.label || 'English';

  // Get app version and name from expo config
  const appVersion = Constants.expoConfig?.version;
  const appName = Constants.expoConfig?.name || 'Discover Sports HK';

  // Format version display with build number
  const versionDisplay = `${appVersion}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <HomeHeader
        title={t(msg`Settings`)}
        subtitle={t(msg`Manage your app preferences and account`)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Language Section */}
        <SettingsSection
          title={t(msg`Preferences`)}
          footer={t(msg`Customize your app experience and preferences.`)}
        >
          <SettingsRow
            title={t(msg`Language`)}
            value={currentLanguageLabel}
            onPress={() => router.push('/settings/language')}
            icon="language"
          />
        </SettingsSection>

        {/* Notifications Section */}
        {/* <SettingsSection
          title={t(msg`Notifications`)}
          footer={t(
            msg`Manage your notification preferences for venue availability and booking reminders.`
          )}
        >
          <SettingsRow
            title={t(msg`Notification Settings`)}
            value={preferences.notifications.enabled ? t(msg`On`) : t(msg`Off`)}
            onPress={() => router.push('/settings/notifications')}
            icon="notifications"
          />
        </SettingsSection> */}

        {/* About Section */}
        <SettingsSection title={t(msg`About`)}>
          <SettingsRow
            title={t(msg`Version`)}
            value={versionDisplay}
            showChevron={false}
            icon="info"
          />
          <View style={styles.separator} />
          {/* <SettingsRow
            title={t(msg`Privacy Policy`)}
            icon="privacy"
            onPress={() => router.push('/settings/privacy')}
          />
          <View style={styles.separator} /> */}
          <SettingsRow
            title={t(msg`Terms of Service`)}
            icon="about"
            onPress={() => router.push('/settings/terms')}
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.appName}>{appName}</ThemedText>
          <ThemedText style={styles.copyright}>
            {t(msg`© ${new Date().getFullYear()} OpenPandata Hong Kong. All rights reserved.`)}
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background, // Use theme page background color
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.gap(6), // Increased padding for footer
  },
  section: {
    marginTop: theme.gap(4),
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '400',
    color: theme.colors.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.gap(1),
    marginHorizontal: theme.gap(2),
  },
  sectionContent: {
    backgroundColor: theme.colors.background, // White/dark background for contrast
    borderRadius: 12,
    marginHorizontal: theme.gap(2),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border, // Use theme border color
  },
  sectionFooter: {
    fontSize: 13,
    color: theme.colors.icon,
    marginTop: theme.gap(1),
    marginHorizontal: theme.gap(2),
    lineHeight: 18,
  },
  settingsRow: {
    minHeight: 44,
  },
  settingsRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.gap(1.5),
  },
  settingsRowTitle: {
    flex: 1,
    fontSize: 16, // Reduced from 17px to 16px
    fontWeight: '400',
  },
  settingsRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.gap(1),
  },
  settingsRowValue: {
    fontSize: 16, // Reduced from 17px to 16px to match title
    color: theme.colors.icon,
  },
  separator: {
    height: 0.5,
    backgroundColor: theme.colors.icon,
    opacity: 0.3,
    marginLeft: theme.gap(6),
  },
  // Footer styles
  footer: {
    alignItems: 'center',
    paddingVertical: theme.gap(4),
    paddingHorizontal: theme.gap(2),
    marginTop: theme.gap(2),
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.gap(0.5),
  },
  copyright: {
    fontSize: 13,
    color: theme.colors.icon,
    textAlign: 'center',
  },
}));
