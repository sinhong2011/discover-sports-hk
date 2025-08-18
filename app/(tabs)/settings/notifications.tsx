/**
 * Notifications Settings Screen
 * iOS 18-style notifications preferences with switches
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { ScrollView, Switch, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon, type AppIconName } from '@/components/ui/Icon';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { useAppStore } from '@/store';

interface NotificationRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: AppIconName;
}

function NotificationRow({ title, description, value, onValueChange, icon }: NotificationRowProps) {
  return (
    <View style={styles.notificationRow}>
      <View style={styles.notificationRowContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <AppIcon name={icon} size={20} color="#ffffff" />
          </View>
        )}
        <View style={styles.notificationInfo}>
          <ThemedText style={styles.notificationTitle}>{title}</ThemedText>
          {description && (
            <ThemedText style={styles.notificationDescription}>{description}</ThemedText>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#f36805ff' }}
          thumbColor={value ? '#ffffff' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          style={styles.switch}
        />
      </View>
    </View>
  );
}

interface NotificationSectionProps {
  title?: string;
  children: React.ReactNode;
  footer?: string;
}

function NotificationSection({ title, children, footer }: NotificationSectionProps) {
  return (
    <View style={styles.section}>
      {title && <ThemedText style={styles.sectionHeader}>{title}</ThemedText>}
      <ThemedView style={styles.sectionContent}>{children}</ThemedView>
      {footer && <ThemedText style={styles.sectionFooter}>{footer}</ThemedText>}
    </View>
  );
}

export default function NotificationsScreen() {
  const { t } = useLingui();
  const { preferences, updatePreferences } = useAppStore();

  const handleNotificationToggle = (enabled: boolean) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        enabled,
      },
    });
  };

  const handleAvailabilityAlertsToggle = (availabilityAlerts: boolean) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        availabilityAlerts,
      },
    });
  };

  const handleReminderTimeChange = (reminderTime: number) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        reminderTime,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.headerTitle}>{t(msg`Notifications`)}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {t(
              msg`Manage your notification preferences for venue availability and booking reminders.`
            )}
          </ThemedText>
        </View>

        {/* Push Notifications Section */}
        <NotificationSection
          title={t(msg`Push Notifications`)}
          footer={t(
            msg`Allow the app to send you push notifications about venue availability and booking updates.`
          )}
        >
          <NotificationRow
            title={t(msg`Enable Push Notifications`)}
            description={t(msg`Receive notifications about venue availability`)}
            value={preferences.notifications.enabled}
            onValueChange={handleNotificationToggle}
            icon="notifications"
          />
        </NotificationSection>

        {/* Notification Types Section */}
        {preferences.notifications.enabled && (
          <NotificationSection
            title={t(msg`Notification Types`)}
            footer={t(msg`Choose which types of notifications you want to receive.`)}
          >
            <NotificationRow
              title={t(msg`Availability Alerts`)}
              description={t(msg`Get notified when venues become available`)}
              value={preferences.notifications.availabilityAlerts}
              onValueChange={handleAvailabilityAlertsToggle}
              icon="calendar"
            />
          </NotificationSection>
        )}

        {/* Reminder Settings Section */}
        {preferences.notifications.enabled && (
          <NotificationSection
            title={t(msg`Reminder Settings`)}
            footer={t(msg`Set how far in advance you want to be reminded about your bookings.`)}
          >
            <View style={styles.reminderOptions}>
              <ThemedText style={styles.reminderTitle}>
                {t(msg`Reminder Time: ${preferences.notifications.reminderTime} minutes before`)}
              </ThemedText>
              <View style={styles.reminderButtons}>
                {[15, 30, 60, 120].map((minutes) => (
                  <View key={minutes} style={styles.reminderButtonContainer}>
                    <Switch
                      value={preferences.notifications.reminderTime === minutes}
                      onValueChange={() => handleReminderTimeChange(minutes)}
                      trackColor={{ false: '#767577', true: '#f36805ff' }}
                      thumbColor={
                        preferences.notifications.reminderTime === minutes ? '#ffffff' : '#f4f3f4'
                      }
                      ios_backgroundColor="#3e3e3e"
                    />
                    <ThemedText style={styles.reminderButtonText}>
                      {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </NotificationSection>
        )}

        {/* Disabled State Information */}
        {!preferences.notifications.enabled && (
          <View style={styles.disabledInfo}>
            <AppIcon name="info" size={24} color="#f36805ff" />
            <ThemedText style={styles.disabledInfoText}>
              {t(
                msg`Enable push notifications to receive alerts about venue availability and booking reminders.`
              )}
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.gap(3),
  },
  headerSection: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(3),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.gap(1),
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.icon,
    lineHeight: 22,
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
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginHorizontal: theme.gap(2),
    overflow: 'hidden',
  },
  sectionFooter: {
    fontSize: 13,
    color: theme.colors.icon,
    marginTop: theme.gap(1),
    marginHorizontal: theme.gap(2),
    lineHeight: 18,
  },
  notificationRow: {
    minHeight: 60,
  },
  notificationRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(2),
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.gap(1.5),
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: theme.colors.text,
  },
  notificationDescription: {
    fontSize: 13,
    color: theme.colors.icon,
    marginTop: 2,
  },
  switch: {
    transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }],
  },
  reminderOptions: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(2),
  },
  reminderTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: theme.colors.text,
    marginBottom: theme.gap(2),
  },
  reminderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  reminderButtonContainer: {
    alignItems: 'center',
    gap: theme.gap(1),
  },
  reminderButtonText: {
    fontSize: 13,
    color: theme.colors.icon,
  },
  disabledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginHorizontal: theme.gap(2),
    marginTop: theme.gap(4),
    padding: theme.gap(2),
    gap: theme.gap(1.5),
  },
  disabledInfoText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.icon,
    lineHeight: 20,
  },
}));
