import React, { useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardLayout } from '../../../shared/components/Layout/DashboardLayout';
import { PostCard } from '../components/PostCard';
import { useInfiniteFeed, useLikePost, useUnlikePost } from '../hooks/useSocial';
import { theme } from '../../../shared/theme';
import type { RootStackParamList } from '../../../app/navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FeedScreen() {
  const navigation = useNavigation<Nav>();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    refetch,
  } = useInfiniteFeed();

  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();

  const posts = useMemo(
    () => data?.pages.flatMap(page => page.data.content) ?? [],
    [data],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = useCallback(() => (
    <View style={styles.footer}>
      {isFetchingNextPage
        ? <ActivityIndicator size="small" color="#6366F1" />
        : !hasNextPage && posts.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, posts.length]);

  return (
    <DashboardLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sosyal Feed</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Text style={styles.createBtnText}>+ Gönderi</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        )}

        {isError && (
          <View style={styles.center}>
            <Text style={styles.errorText}>Feed yüklenemedi.</Text>
            <TouchableOpacity onPress={() => refetch()}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && posts.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📱</Text>
            <Text style={styles.emptyText}>Henüz gönderi yok.</Text>
            <Text style={styles.emptyHint}>
              İlk gönderinizi oluşturun veya başkalarını takip edin.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate('CreatePost')}
            >
              <Text style={styles.createBtnText}>İlk Gönderiyi Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && posts.length > 0 && (
          <FlatList
            style={styles.list}
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onPress={() => navigation.navigate('PostDetail', { id: item.id })}
                onLike={likePost}
                onUnlike={unlikePost}
                onViewOutfit={outfitId => navigation.navigate('OutfitDetail', { id: outfitId })}
                onAuthorPress={userId => navigation.navigate('UserProfile', { id: userId })}
              />
            )}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 28, overflow: 'hidden' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  createBtn: {
    backgroundColor: theme.colors.primary, paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: theme.radius.md,
  },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { flex: 1 },
  listContent: { paddingBottom: 24, maxWidth: 640, width: '100%', alignSelf: 'center' },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: theme.colors.textMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48, color: theme.colors.indigo200 },
  emptyText: { fontSize: 17, color: theme.colors.text, fontWeight: '700' },
  emptyHint: {
    fontSize: 13, color: theme.colors.textSecondary,
    textAlign: 'center', paddingHorizontal: 32,
  },
  errorText: { fontSize: 15, color: theme.colors.error, fontWeight: '600' },
  retryText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
