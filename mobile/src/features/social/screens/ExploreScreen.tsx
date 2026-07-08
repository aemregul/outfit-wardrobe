import React, { useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { QUERY_KEYS } from '../../../shared/constants/queryKeys';
import { PostCard } from '../components/PostCard';
import { useInfiniteExplore, useLikePost, useUnlikePost } from '../hooks/useSocial';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_700Bold });

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EXPLORE] });
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
  } = useInfiniteExplore();

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
        ? <ActivityIndicator size="small" color="#C9A86A" />
        : !hasNextPage && posts.length > 0
          ? <Text style={styles.footerText}>Tüm sonuçlar yüklendi</Text>
          : null}
    </View>
  ), [isFetchingNextPage, hasNextPage, posts.length]);

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  const ListHeader = <Text style={styles.title}>Keşfet</Text>;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerPad}>{ListHeader}</View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerPad}>{ListHeader}</View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Gönderiler yüklenemedi.</Text>
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
        <View style={styles.headerPad}>{ListHeader}</View>
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>Henüz herkese açık gönderi yok.</Text>
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
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  headerPad: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#4A403A', marginBottom: 12 },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9C8C84' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontFamily: 'Poppins_500Medium', fontSize: 16, color: '#9C8C84' },
  errorText: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#EF4444' },
  retryText: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#C9A86A', textDecorationLine: 'underline' },
});
