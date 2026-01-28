import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHONE_WIDTH = Math.min(340, SCREEN_WIDTH - 64);

export default function FeatureIntroPage3() {
  const router = useRouter();
  const checkmarkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Checkmark bounce animation
    Animated.sequence([
      Animated.delay(500),
      Animated.spring(checkmarkAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.loop(
        Animated.sequence([
          Animated.timing(checkmarkAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(checkmarkAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const checkmarkScale = checkmarkAnim.interpolate({
    inputRange: [0, 1, 1.1],
    outputRange: [0, 1, 1.1],
  });

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />

      {/* Header Text */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Save & Share{'\n'}Your Designs
        </Text>
        <Text style={styles.subtitle}>
          Collaborate with friends and family
        </Text>
      </View>

      {/* Main Visual - Share Card */}
      <View style={styles.phoneContainer}>
        <View style={styles.phoneFrame}>
          {/* Abstract Blobs Background */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          {/* Central Card */}
          <View style={styles.shareCard}>
            <View style={styles.cardImageContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80',
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardLabel}>
                <Text style={styles.cardLabelText}>LIVING ROOM</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.cardInfoLine1} />
                <View style={styles.cardInfoLine2} />
              </View>
              <MaterialIcons name="favorite" size={24} color="#EC4899" />
            </View>
          </View>

          {/* Success Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <View style={styles.checkmark}>
              <MaterialIcons name="check" size={32} color={colors.white} />
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => 
            router.push('/main')
            // router.push('/test-svg')
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Let's Go</Text>
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
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blob1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#3B82F6',
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  blob2: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#A855F7',
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  shareCard: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
    transform: [{ rotate: '-2deg' }],
    marginBottom: 24,
  },
  cardImageContainer: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardLabel: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardLabelText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    gap: 6,
  },
  cardInfoLine1: {
    height: 8,
    width: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  cardInfoLine2: {
    height: 8,
    width: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: '20%',
    zIndex: 30,
  },
  checkmark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
