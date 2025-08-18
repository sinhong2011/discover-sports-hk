/**
 * Privacy Policy Screen
 * iOS 18-style privacy policy display
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from '@/components/ui/SafeAreaView';

export default function PrivacyScreen() {
  const { t } = useLingui();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.headerTitle}>{t(msg`Privacy Policy`)}</ThemedText>
          <ThemedText style={styles.lastUpdated}>{t(msg`Last updated: January 2025`)}</ThemedText>
        </View>

        {/* Privacy Policy Content */}
        <View style={styles.contentSection}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Information We Collect`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`DiscoverSports HK collects minimal information necessary to provide our venue booking services. This includes your language preferences, notification settings, and venue search history stored locally on your device.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {t(msg`How We Use Your Information`)}
            </ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We use the information to personalize your experience, send you relevant notifications about venue availability, and improve our services. Your data is processed locally on your device whenever possible.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Data Storage and Security`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`Your preferences and settings are stored securely on your device using encrypted storage. We implement industry-standard security measures to protect your information.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Third-Party Services`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We integrate with Hong Kong LCSD government APIs to provide real-time venue information. We may also use analytics services to improve app performance and user experience.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Your Rights`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`You have the right to access, modify, or delete your personal information. You can manage your preferences through the app settings or contact us directly.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Notifications`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`Push notifications are sent only with your explicit consent. You can disable notifications at any time through the app settings or your device settings.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Changes to This Policy`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We may update this privacy policy from time to time. We will notify you of any significant changes through the app or by other means.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Contact Us`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`If you have any questions about this privacy policy or our data practices, please contact us through the app's support section.`
              )}
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <ThemedText style={styles.footerText}>
            {t(
              msg`DiscoverSports HK is committed to protecting your privacy and ensuring transparency in our data practices.`
            )}
          </ThemedText>
        </View>
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
    paddingBottom: theme.gap(4),
  },
  headerSection: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(3),
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.icon,
    borderBottomOpacity: 0.3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.gap(1),
  },
  lastUpdated: {
    fontSize: 14,
    color: theme.colors.icon,
  },
  contentSection: {
    paddingHorizontal: theme.gap(2),
  },
  section: {
    marginTop: theme.gap(4),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.gap(1.5),
  },
  sectionText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    opacity: 0.8,
  },
  footerSection: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(4),
    marginTop: theme.gap(4),
    borderTopWidth: 0.5,
    borderTopColor: theme.colors.icon,
    borderTopOpacity: 0.3,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
}));
