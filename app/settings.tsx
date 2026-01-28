import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { ICONS } from '@/components/icons';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface MenuItemProps {
  icon: keyof typeof ICONS | string;
  label: string;
  onPress?: () => void;
  value?: string;
  showCopy?: boolean;
  showChevron?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  value,
  showCopy,
  showChevron = true,
}) => {
  const iconSource = typeof icon === 'string' && icon in ICONS ? ICONS[icon as keyof typeof ICONS] : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
    >
      <View style={styles.menuItemLeft}>
        {iconSource ? (
          <Image
            source={iconSource}
            style={styles.menuIcon}
            resizeMode="contain"
          />
        ) : (
          <MaterialIcons
            name={icon as any}
            size={22}
            color={colors.gray900}
          />
        )}
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && (
          <Text style={styles.menuValue}>{value}</Text>
        )}
        {showCopy && (
          <MaterialIcons
            name="content-copy"
            size={16}
            color={colors.gray400}
          />
        )}
        {!value && !showCopy && showChevron && (
          <MaterialIcons
            name="chevron-right"
            size={22}
            color={colors.gray300}
          />
        )}
      </View>
    </Pressable>
  );
};

export default function SettingsPage() {
  const router = useRouter();

  const handleAction = (action: string) => {
    switch (action) {
      case 'feedback':
        router.push('/feedback');
        break;
      case 'rate':
        // 打开应用商店评分
        if (Platform.OS === 'ios') {
          Linking.openURL('https://apps.apple.com/app/idYOUR_APP_ID');
        } else {
          Linking.openURL('https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME');
        }
        break;
      case 'share':
        Share.share({
          message: 'Check out House AI - an amazing app!',
          title: 'House AI',
        });
        break;
      case 'terms':
        // 打开服务条款
        Linking.openURL('https://example.com/terms');
        break;
      case 'privacy':
        // 打开隐私政策
        Linking.openURL('https://example.com/privacy');
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/main')}
          style={styles.backButton}
        >
          <Image
            source={ICONS.left}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Engagement Section */}
        <View style={styles.section}>
          <MenuItem
            icon="send"
            label="Feedback"
            onPress={() => handleAction('feedback')}
          />
          <MenuItem
            icon="star"
            label="Rate Us"
            onPress={() => handleAction('rate')}
          />
          <MenuItem
            icon="ios-share"
            label="Share with Friends"
            onPress={() => handleAction('share')}
          />
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <MenuItem
            icon="article"
            label="Terms of Use"
            onPress={() => handleAction('terms')}
          />
          <MenuItem
            icon="security"
            label="Privacy Policy"
            onPress={() => handleAction('privacy')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version {appVersion}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  statusBar: {
    width: '100%',
    height: 47,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: 'relative',
    marginBottom: 8,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: colors.gray50,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(243, 244, 246, 0.5)',
  },
  menuItemPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: colors.gray100,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    width: 22,
    height: 22,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: colors.gray400,
    fontWeight: '500',
  },
});
