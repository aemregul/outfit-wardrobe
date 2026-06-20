import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import {
  usePost, useLikePost, useUnlikePost,
  useDeletePost, useComments, useAddComment, useDeleteComment,
} from '../hooks/useSocial';
import { formatDate, formatDateTime } from '../../../shared/utils/date';
import { VISIBILITY_LABELS } from '../../../shared/types/social.types';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PostDetail'>;

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export function PostDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const postId = params.id;

  const { data: post, isLoading, isError } = usePost(postId);
  const { data: commentsData, isLoading: commentsLoading } = useComments(postId, { size: 50 });

  const { mutate: likePost, isPending: liking } = useLikePost();
  const { mutate: unlikePost, isPending: unliking } = useUnlikePost();
  const { mutate: deletePost, isPending: deleting } = useDeletePost();
  const { mutate: addComment, isPending: commenting } = useAddComment(postId);
  const { mutate: deleteComment } = useDeleteComment(postId);

  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [confirmPostVisible, setConfirmPostVisible] = useState(false);
  const [confirmCommentId, setConfirmCommentId] = useState<string | null>(null);

  const comments = commentsData?.content ?? [];

  function handleLikeToggle() {
    if (!post) return;
    if (post.likedByCurrentUser) {
      unlikePost(postId);
    } else {
      likePost(postId);
    }
  }

  function handleAddComment() {
    setCommentError('');
    const trimmed = commentText.trim();
    if (!trimmed) return;
    addComment(
      { content: trimmed },
      {
        onSuccess: () => setCommentText(''),
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { data?: { message?: string } } };
          setCommentError(axiosErr?.response?.data?.message ?? 'Yorum eklenemedi.');
        },
      }
    );
  }

  function handleDeletePost() {
    deletePost(postId, {
      onSuccess: () => { setConfirmPostVisible(false); navigation.goBack(); },
    });
  }

  function handleDeleteComment() {
    if (!confirmCommentId) return;
    deleteComment(confirmCommentId);
    setConfirmCommentId(null);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Gönderi bulunamadı.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.linkText}>← Geri dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const likePending = liking || unliking;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backBtn}>← Geri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deletePostBtn}
              onPress={() => setConfirmPostVisible(true)}
            >
              <Text style={styles.deletePostBtnText}>Sil</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.userRow}
            onPress={() => navigation.navigate('UserProfile', { id: post.userId })}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(post.username ?? post.userId)[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userId}>
                {post.displayName ?? post.username ?? `Kullanıcı #${shortId(post.userId)}`}
              </Text>
              <Text style={styles.meta}>
                {formatDateTime(post.createdAt)} · {VISIBILITY_LABELS[post.visibility]}
              </Text>
            </View>
          </TouchableOpacity>

          {!imgError ? (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackText}>📷</Text>
            </View>
          )}

          {post.caption ? (
            <Text style={styles.caption}>{post.caption}</Text>
          ) : null}

          {post.outfitId ? (
            <TouchableOpacity
              style={styles.outfitBtn}
              onPress={() => navigation.navigate('OutfitDetail', { id: post.outfitId! })}
            >
              <Text style={styles.outfitBtnText}>İlgili Kombini Gör</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.reactRow}>
            <TouchableOpacity
              style={styles.reactBtn}
              onPress={handleLikeToggle}
              disabled={likePending}
            >
              <Text style={[styles.likeIcon, post.likedByCurrentUser && styles.likeIconActive]}>
                {post.likedByCurrentUser ? '♥' : '♡'}
              </Text>
              <Text style={[styles.reactCount, post.likedByCurrentUser && styles.reactCountActive]}>
                {post.likesCount} beğeni
              </Text>
            </TouchableOpacity>
            <View style={styles.reactBtn}>
              <Text style={styles.commentIconLg}>💬</Text>
              <Text style={styles.reactCount}>{post.commentsCount} yorum</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Yorumlar</Text>

          {commentsLoading && (
            <ActivityIndicator color="#6366F1" style={{ marginVertical: 12 }} />
          )}

          {!commentsLoading && comments.length === 0 && (
            <Text style={styles.noComments}>Henüz yorum yok. İlk yorumu siz yapın!</Text>
          )}

          {comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile', { id: c.userId })}
                activeOpacity={0.7}
              >
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(c.username ?? c.userId)[0].toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.commentContent}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UserProfile', { id: c.userId })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.commentUser}>
                    {c.displayName ?? c.username ?? `#${shortId(c.userId)}`}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.commentText}>{c.content}</Text>
                <Text style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setConfirmCommentId(c.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteCommentBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={(t) => { setCommentText(t); setCommentError(''); }}
            placeholder="Yorum yaz..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (commenting || !commentText.trim()) && styles.sendBtnDisabled]}
            onPress={handleAddComment}
            disabled={commenting || !commentText.trim()}
          >
            {commenting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.sendBtnText}>Gönder</Text>
            }
          </TouchableOpacity>
        </View>
        {commentError ? <Text style={styles.commentErrorText}>{commentError}</Text> : null}
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={confirmPostVisible}
        message="Bu gönderi kalıcı olarak silinecek."
        isLoading={deleting}
        onConfirm={handleDeletePost}
        onCancel={() => setConfirmPostVisible(false)}
      />
      <ConfirmModal
        visible={confirmCommentId !== null}
        title="Yorumu silmek istediğine emin misin?"
        message="Bu yorum kalıcı olarak silinecek."
        onConfirm={handleDeleteComment}
        onCancel={() => setConfirmCommentId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  root: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: { color: '#6366F1', fontSize: 15, fontWeight: '500' },
  deletePostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deletePostBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  userId: { fontSize: 14, fontWeight: '600', color: '#1E1B4B' },
  meta: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  image: { width: '100%', height: 300, borderRadius: 12, marginBottom: 16 },
  imageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageFallbackText: { fontSize: 48 },
  caption: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: 14 },
  outfitBtn: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitBtnText: { color: '#6366F1', fontWeight: '600', fontSize: 14 },
  reactRow: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    paddingVertical: 12,
    marginBottom: 20,
  },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 22, color: '#9CA3AF' },
  likeIconActive: { color: '#EF4444' },
  commentIconLg: { fontSize: 20 },
  reactCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  reactCountActive: { color: '#EF4444' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E1B4B', marginBottom: 12 },
  noComments: { fontSize: 13, color: '#9CA3AF', marginBottom: 12, fontStyle: 'italic' },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  commentContent: { flex: 1 },
  commentUser: { fontSize: 12, fontWeight: '700', color: '#6366F1', marginBottom: 2 },
  commentText: { fontSize: 14, color: '#374151', lineHeight: 19 },
  commentDate: { fontSize: 10, color: '#9CA3AF', marginTop: 3 },
  deleteCommentBtn: { fontSize: 12, color: '#9CA3AF', paddingTop: 2 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  sendBtnDisabled: { backgroundColor: '#C7D2FE' },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentErrorText: {
    color: '#EF4444',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  errorText: { fontSize: 15, color: '#EF4444' },
  linkText: { color: '#6366F1', fontSize: 14 },
});
