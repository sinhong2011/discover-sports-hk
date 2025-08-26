/**
 * Language Selection Screen
 * iOS 18-style language selection with proper navigation
 */

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/components/ThemedText';
import { AppIcon } from '@/components/ui/Icon';
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

  const renderLanguageOption = ({
    item,
    index,
  }: {
    item: (typeof LANGUAGE_OPTIONS)[0];
    index: number;
  }) => {
    const isFirst = index === 0;
    const isLast = index === LANGUAGE_OPTIONS.length - 1;

    return (
      <View
        style={[
          styles.languageOptionContainer,
          isFirst && styles.firstOption,
          isLast && styles.lastOption,
        ]}
      >
        <LanguageOption
          option={item}
          isSelected={preferences.language === item.code}
          onSelect={() => handleLanguageSelect(item.code)}
        />
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <ThemedText style={styles.headerSubtitle}>
        {t(msg`Select your preferred language for the app interface.`)}
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={LANGUAGE_OPTIONS}
        renderItem={renderLanguageOption}
        keyExtractor={(item) => item.code}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.flashListContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flashListContent: {
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
  languageOptionContainer: {
    backgroundColor: theme.colors.background,
    marginHorizontal: theme.gap(2),
  },
  firstOption: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastOption: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
