import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 三列图片数据
const COLUMN_1 = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=500&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=500&q=80",
];

const COLUMN_2 = [
  "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=500&q=80",
  "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=500&q=80",
  "https://images.unsplash.com/photo-1536895058696-a69b1c7be475?w=500&q=80",
  "https://images.unsplash.com/photo-1558036117-15db527e5686?w=500&q=80",
];

const COLUMN_3 = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&q=80",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=500&q=80",
];

// 瀑布流列组件（注意：列本身不滚动，由外层 ScrollView 统一滚动）
const ImageColumn = ({
  images,
  offset = 0,
  columnIndex = 0,
}: {
  images: string[];
  offset?: number;
  columnIndex?: number;
}) => {
  // 重复图片以拉长内容
  const displayItems = [...images, ...images, ...images, ...images];

  const getImageHeight = (index: number) => {
    const heightPatterns = [
      [220, 180, 250, 200, 230, 190], // 第一列
      [200, 240, 170, 220, 190, 260], // 第二列
      [230, 190, 210, 250, 180, 220], // 第三列
    ];
    const pattern = heightPatterns[columnIndex % heightPatterns.length];
    return pattern[index % pattern.length];
  };

  return (
    <View style={[styles.column, { marginTop: offset }]}>
      {displayItems.map((src, i) => (
        <View
          key={`${columnIndex}-${i}`}
          style={[styles.imageWrapper, { height: getImageHeight(i) }]}
        >
          <Image source={{ uri: src }} style={styles.image} resizeMode="cover" />
        </View>
      ))}
    </View>
  );
};

export default function WelcomePage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar} />
      
      {/* 瀑布流背景 */}
      <ScrollView
        style={styles.masonryScroll}
        contentContainerStyle={styles.masonryScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.masonryContainer}>
          <ImageColumn images={COLUMN_1} columnIndex={0} />
          <ImageColumn images={COLUMN_2} offset={80} columnIndex={1} />
          <ImageColumn images={COLUMN_3} columnIndex={2} />
        </View>
      </ScrollView>

      {/* Bottom Sheet Overlay */}
      <LinearGradient
        colors={['transparent', 'white', 'white']}
        locations={[0, 0.45, 1]}
        style={styles.overlay}
        pointerEvents="box-none"
      >
        <View style={styles.content} pointerEvents="auto">
          <Text style={styles.title}>
            Welcome to{'\n'}House AI
          </Text>
          <Text style={styles.subtitle}>
            Instantly redesign your home with House AI
          </Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/feature-intro-1')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
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
    position: 'relative',
    zIndex: 50,
  },
  masonryScroll: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  masonryScrollContent: {
    // 额外留白：让整体可以滚动，同时避免被底部渐变/按钮遮挡
    paddingTop: 0,
    paddingBottom: Math.round(SCREEN_HEIGHT * 0.8),
  },
  masonryContainer: {
    // 让内容真正参与 ScrollView 布局，否则无法滚动
    marginTop: -SCREEN_HEIGHT * 0.15,
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 12,
    opacity: 0.9,
  },
  column: {
    flex: 1,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 48,
    zIndex: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
    color: colors.gray900,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.gray500,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 32,
    maxWidth: 280,
    lineHeight: 24,
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
