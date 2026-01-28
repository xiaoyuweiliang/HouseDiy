import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/colors';
import { SavedDesign } from '@/types';
import { ICONS } from '@/components/icons';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data - 在实际应用中，这些数据应该从 AsyncStorage 或状态管理获取
const MOCK_HISTORY: SavedDesign[] = [
  {
    id: '1',
    title: 'Puzzle Draft 1',
    date: 'TODAY',
    rooms: 3,
    image: '../assets/images/livingroom/livingroom-1.png',
    data: [],
  },
  {
    id: '2',
    title: 'Dream Home',
    date: 'YESTERDAY',
    rooms: 2,
    image: '../assets/images/livingroom/livingroom-1.png',
    data: [],
  },
];

export default function HistoryPage() {
  const router = useRouter();
  const [designs] = React.useState<SavedDesign[]>(MOCK_HISTORY);

  const handleLoadDesign = (design: SavedDesign) => {
    // TODO: 加载设计数据到主页面
    // 这里应该将 design.data 传递给主页面并恢复状态
    console.log('Loading design:', design);
    router.push('/main');
  };

  const renderItem = ({ item }: { item: SavedDesign }) => (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => handleLoadDesign(item)}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.cardDate}>{item.date}</Text>
        <View style={styles.cardTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.rooms} Rooms</Text>
          </View>
        </View>
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={colors.gray300}
        style={styles.chevron}
      />
    </Pressable>
  );

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
        <Text style={styles.headerTitle}>Design History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <FlatList
        data={designs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history yet.</Text>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    backgroundColor: colors.gray50,
  },
  cardImageContainer: {
    width: 96,
    height: 96,
    backgroundColor: colors.gray200,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: colors.gray400,
    fontWeight: '500',
    marginTop: 4,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray400,
    textAlign: 'center',
  },
});
