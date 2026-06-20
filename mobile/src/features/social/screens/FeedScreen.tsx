import React, { useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { PostCard } from '../components/PostCard';
import { useInfiniteFeed, useLikePost, useUnlikePost } from '../hooks/useSocial';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FEED] });
    }, [queryClient]),
  );

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

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.title}>Sosyal Feed</Text>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createBtnText}>+ Gönderi</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        {ListHeader}
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        {ListHeader}
        <View style={styles.center}>
          <Text style={styles.errorText}>Feed yüklenemedi.</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryText}>Tekrar dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        {ListHeader}
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
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
        ListHeaderComponent={ListHeader}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E1B4B' },
  createBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontSize: 12, color: '#9CA3AF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  emptyHint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
  errorText: { fontSize: 15, color: '#EF4444' },
  retryText: { fontSize: 14, color: '#6366F1', textDecorationLine: 'underline' },
});
