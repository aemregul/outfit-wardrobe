import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
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
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

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

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#FDFBF7' }} />;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C9A86A" />
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
            <Text style={styles.linkText}>Geri dön</Text>
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
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#4A403A" />
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
            <ActivityIndicator color="#C9A86A" style={{ marginVertical: 12 }} />
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
            placeholderTextColor="#C4B8AF"
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
  safe: { flex: 1, backgroundColor: '#FDFBF7' },
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A403A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  deletePostBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deletePostBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#EF4444', fontSize: 13 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C9A86A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 15 },
  userId: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4A403A' },
  meta: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9C8C84', marginTop: 2 },
  image: { width: '100%', height: 300, borderRadius: 16, marginBottom: 16 },
  imageFallback: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageFallbackText: { fontSize: 48 },
  caption: { fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#4A403A', lineHeight: 24, marginBottom: 14 },
  outfitBtn: {
    backgroundColor: '#F0EDE8',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  outfitBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#4A403A', fontSize: 14 },
  reactRow: {
    flexDirection: 'row',
    gap: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(74,64,58,0.08)',
    paddingVertical: 12,
    marginBottom: 20,
  },
  reactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 22, color: '#C4B8AF' },
  likeIconActive: { color: '#EF4444' },
  commentIconLg: { fontSize: 20 },
  reactCount: { fontFamily: 'Poppins_500Medium', fontSize: 13, color: '#9C8C84' },
  reactCountActive: { color: '#EF4444' },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4A403A', marginBottom: 12 },
  noComments: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9C8C84', marginBottom: 12, fontStyle: 'italic' },
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
    backgroundColor: '#F0EDE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#4A403A' },
  commentContent: { flex: 1 },
  commentUser: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#4A403A', marginBottom: 2 },
  commentText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4A403A', lineHeight: 20 },
  commentDate: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#C4B8AF', marginTop: 3 },
  deleteCommentBtn: { fontSize: 12, color: '#C4B8AF', paddingTop: 2 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74,64,58,0.10)',
    backgroundColor: '#fff',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderWidth: 1,
    borderColor: 'rgba(74,64,58,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#4A403A',
  },
  sendBtn: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  sendBtnDisabled: { backgroundColor: '#D4BC8C' },
  sendBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 13 },
  commentErrorText: {
    fontFamily: 'Poppins_400Regular',
    color: '#EF4444',
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  errorText: { fontFamily: 'Poppins_500Medium', fontSize: 15, color: '#EF4444' },
  linkText: { fontFamily: 'Poppins_500Medium', color: '#C9A86A', fontSize: 14 },
});
