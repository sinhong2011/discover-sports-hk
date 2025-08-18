/**
 * Terms of Service Screen
 * iOS 18-style terms of service display
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';

import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from '@/components/ui/SafeAreaView';

export default function TermsScreen() {
  const { t } = useLingui();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.headerTitle}>{t(msg`Terms of Service`)}</ThemedText>
          <ThemedText style={styles.lastUpdated}>{t(msg`Last updated: January 2025`)}</ThemedText>
        </View>

        {/* Terms Content */}
        <View style={styles.contentSection}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Acceptance of Terms`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`By using DiscoverSports HK, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our application.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Description of Service`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`DiscoverSports HK is a mobile application that provides information about sports venue availability in Hong Kong through integration with government APIs. We facilitate venue discovery but do not handle actual bookings.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`User Responsibilities`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`You are responsible for using the app in accordance with applicable laws and regulations. You must not use the service for any unlawful or prohibited activities.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Data Accuracy`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`While we strive to provide accurate and up-to-date venue information, we cannot guarantee the accuracy of all data. Venue availability is subject to change and should be verified directly with the facility.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Intellectual Property`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`The app and its content are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Limitation of Liability`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the app. Our liability is limited to the maximum extent permitted by law.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Third-Party Services`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`Our app integrates with third-party services including Hong Kong government APIs. We are not responsible for the availability or accuracy of these external services.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Termination`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We reserve the right to terminate or suspend access to our service at any time, with or without cause, and with or without notice.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Changes to Terms`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`We may modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.`
              )}
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t(msg`Governing Law`)}</ThemedText>
            <ThemedText style={styles.sectionText}>
              {t(
                msg`These terms are governed by the laws of Hong Kong Special Administrative Region. Any disputes will be resolved in Hong Kong courts.`
              )}
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <ThemedText style={styles.footerText}>
            {t(
              msg`For questions about these terms, please contact us through the app's support section.`
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
