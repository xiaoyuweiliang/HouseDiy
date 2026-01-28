import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 引导页 2 手机整体缩小一档
const PHONE_WIDTH = Math.min(300, SCREEN_WIDTH - 64);

export default function FeatureIntroPage2() {
  const router = useRouter();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />

      {/* Header Text */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Drag & Drop{'\n'}Furniture
        </Text>
        <Text style={styles.subtitle}>
          Create the perfect layout instantly
        </Text>
      </View>

      {/* Main Visual - Drag Interaction */}
      <View style={styles.phoneContainer}>
        <View style={styles.phoneFrame}>
          {/* Background Grid */}
          <View style={styles.gridBackground} />

          {/* Static Element 1 */}
          <View style={[styles.staticElement, { top: '25%', left: '10%', transform: [{ rotate: '-3deg' }] }]}>
            <View style={styles.elementContent}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios/100/000000/living-room.png' }}
                style={styles.elementImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Draggable Element */}
          <Animated.View
            style={[
              styles.draggableElement,
              {
                top: '45%',
                right: '15%',
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.draggableContent}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios/100/007AFF/armchair.png' }}
                style={styles.draggableImage}
                resizeMode="contain"
              />
            </View>
            {/* Finger Cursor */}
            <View style={styles.fingerCursor}>
              <Animated.View
                style={[
                  styles.fingerPing,
                  {
                    opacity: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 0],
                    }),
                    transform: [
                      {
                        scale: floatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <MaterialIcons name="touch-app" size={24} color={colors.gray900} />
            </View>
          </Animated.View>

          {/* Static Element 2 */}
          <View style={[styles.staticElement, { bottom: '20%', left: '20%', width: 140, height: 80, transform: [{ rotate: '2deg' }] }]}>
            <View style={styles.elementContent}>
              <Image
                source={{ uri: 'https://img.icons8.com/ios/100/000000/desk.png' }}
                style={styles.elementImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/feature-intro-3')}
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
    backgroundColor: colors.gray50,
    borderRadius: 44,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.gray100,
    overflow: 'hidden',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray50,
    opacity: 0.6,
    // 网格效果可以用 SVG 或重复的 View 实现
  },
  staticElement: {
    position: 'absolute',
    width: 120,
    height: 120,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  elementContent: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementImage: {
    width: 64,
    height: 64,
    opacity: 0.3,
  },
  draggableImage: {
    width: 48,
    height: 48,
  },
  draggableElement: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    zIndex: 20,
  },
  draggableContent: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerCursor: {
    position: 'absolute',
    bottom: -24,
    right: -24,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerPing: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
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
