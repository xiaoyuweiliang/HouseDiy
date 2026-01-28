import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FeedbackPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />

      {/* Background with blur effect */}
      <View style={styles.backgroundContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
          }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={styles.backgroundOverlay} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Review Card */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <MaterialIcons key={i} name="star" size={22} color="#007AFF" />
              ))}
            </View>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
          </View>

          <Text style={styles.reviewTitle}>Magic at Your Fingertips!</Text>

          <Text style={styles.reviewText}>
            "Absolutely blown away by the magic this app works on my room photos! It's like having a personal interior designer in my pocket. Everything is so intuitive and smooth."
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet Section */}
      <View style={styles.bottomSheet}>
        <Text style={styles.bottomTitle}>
          Your Feedback{'\n'}Helps Us Improve
        </Text>
        <Text style={styles.bottomSubtitle}>
          Share your rating to help us create a better experience for you!
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/main')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        {/* Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  statusBar: {
    width: '100%',
    height: 47,
    zIndex: 30,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  reviewCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: 32,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stars: {
    flexDirection: 'row',
    gap: 6,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray100,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.gray900,
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 28,
    color: colors.gray500,
    fontWeight: '500',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 40,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 20,
  },
  bottomTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.gray900,
    marginBottom: 16,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  bottomSubtitle: {
    textAlign: 'center',
    color: colors.gray500,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 24,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  homeIndicator: {
    width: 128,
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
  },
});
