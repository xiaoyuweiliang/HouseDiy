import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_WIDTH = Math.min(340, SCREEN_WIDTH - 48);

export default function FeatureIntroPage1() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />

      {/* Header Text */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Take a photo of{'\n'}your room
        </Text>
        <Text style={styles.subtitle}>
          Choose a style to design your room
        </Text>
      </View>

      {/* Main Visual - Phone Mockup */}
      <View style={styles.phoneContainer}>
        <View style={styles.phoneFrame}>
          {/* Notch */}
          <View style={styles.notch} />

          {/* Screen Content */}
          <View style={styles.screen}>
            {/* Background Image */}
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1581858726768-758a030bad86?q=80&w=1000&auto=format&fit=crop',
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />

            {/* AR Grid Overlay */}
            <View style={styles.gridOverlay} />

            {/* Crosshair */}
            <View style={styles.crosshair}>
              <View style={styles.crosshairHorizontal} />
              <View style={styles.crosshairVertical} />
            </View>

            {/* Top UI */}
            <View style={styles.topUI}>
              <View style={styles.scanningBadge}>
                <MaterialIcons name="info" size={14} color={colors.white} />
                <Text style={styles.scanningText}>SCANNING</Text>
              </View>
              <View style={styles.closeButton}>
                <MaterialIcons name="close" size={18} color={colors.white} />
              </View>
            </View>

            {/* Bottom UI controls */}
            <View style={styles.bottomUI}>
              {/* Gallery Button */}
              <View style={styles.controlButton}>
                <MaterialIcons name="grid-view" size={24} color={colors.white} />
              </View>

              {/* Shutter Button */}
              <View style={styles.shutterButton}>
                <View style={styles.shutterInner} />
              </View>

              {/* History Button */}
              <View style={styles.controlButton}>
                <MaterialIcons name="history" size={24} color={colors.white} />
              </View>
            </View>

            {/* Gradient overlay */}
            <View style={styles.gradientOverlay} />
          </View>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/feature-intro-2')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.gray900,
    lineHeight: 36,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.gray500,
  },
  phoneContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 340,
    aspectRatio: 9 / 15,
    backgroundColor: '#111827',
    borderRadius: 44,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 4,
    borderColor: colors.gray100,
  },
  notch: {
    position: 'absolute',
    top: 12,
    left: '50%',
    marginLeft: -60,
    width: 120,
    height: 24,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 30,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 34,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0.4,
    // 网格效果在 React Native 中需要使用 SVG 或重复的 View 实现
  },
  crosshair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  crosshairHorizontal: {
    width: '85%',
    height: 1,
    backgroundColor: colors.brandBlue,
    shadowColor: colors.brandBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: '45%',
    backgroundColor: colors.brandBlue,
    shadowColor: colors.brandBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  topUI: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 20,
  },
  scanningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  scanningText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomUI: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 20,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 96,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});
