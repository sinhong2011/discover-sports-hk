/**
 * Language Selection Screen
 * iOS 18-style language selection with proper navigation
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { router } from 'expo-router';

import { ScrollView, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppIcon } from '@/components/ui/Icon';
import { SafeAreaView } from '@/components/ui/SafeAreaView';
import { useAppStore } from '@/store';

// Language options with proper labels
const LANGUAGE_OPTIONS = [
  { code: 'en' as const, label: 'English', nativeLabel: 'English' },
  { code: 'zh-HK' as const, label: '繁體中文', nativeLabel: '繁體中文 (香港)' },
];

interface LanguageOptionProps {
  option: (typeof LANGUAGE_OPTIONS)[0];
  isSelected: boolean;
  onSelect: () => void;
}

function LanguageOption({ option, isSelected, onSelect }: LanguageOptionProps) {
  return (
    <TouchableOpacity style={styles.languageOption} onPress={onSelect}>
      <View style={styles.languageOptionContent}>
        <View style={styles.languageInfo}>
          <ThemedText style={styles.languageLabel}>{option.label}</ThemedText>
          <ThemedText style={styles.languageNativeLabel}>{option.nativeLabel}</ThemedText>
        </View>
        {isSelected && <AppIcon name="checkmark" size={20} color="#f36805ff" />}
      </View>
    </TouchableOpacity>
  );
}

export default function LanguageScreen() {
  const { t } = useLingui();
  const { preferences, setLanguage } = useAppStore();

  const handleLanguageSelect = (language: 'en' | 'zh-HK') => {
    setLanguage(language);
    // Navigate back after selection
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText style={styles.headerTitle}>{t(msg`Choose Language`)}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {t(msg`Select your preferred language for the app interface.`)}
          </ThemedText>
        </View>

        {/* Language Options */}
        <ThemedView style={styles.languageList}>
          {LANGUAGE_OPTIONS.map((option, index) => (
            <View key={option.code}>
              <LanguageOption
                option={option}
                isSelected={preferences.language === option.code}
                onSelect={() => handleLanguageSelect(option.code)}
              />
              {index < LANGUAGE_OPTIONS.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </ThemedView>

        {/* Footer Information */}
        <View style={styles.footerSection}>
          <ThemedText style={styles.footerText}>
            {t(msg`The app will restart to apply the new language setting.`)}
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
  languageList: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    marginHorizontal: theme.gap(2),
    overflow: 'hidden',
  },
  languageOption: {
    minHeight: 60,
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(2),
  },
  languageInfo: {
    flex: 1,
  },
  languageLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  languageNativeLabel: {
    fontSize: 15,
    color: theme.colors.icon,
  },
  separator: {
    height: 0.5,
    backgroundColor: theme.colors.icon,
    opacity: 0.3,
    marginLeft: theme.gap(2),
  },
  footerSection: {
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(3),
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.icon,
    textAlign: 'center',
    lineHeight: 18,
  },
}));
