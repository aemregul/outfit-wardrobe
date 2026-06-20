import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { PostResponse, VISIBILITY_ICONS } from '../../../shared/types/social.types';
import { formatDate } from '../../../shared/utils/date';

interface Props {
  post: PostResponse;
  onPress: () => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  onViewOutfit?: (outfitId: string) => void;
  onAuthorPress?: (userId: string) => void;
}

function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function authorLabel(post: PostResponse): string {
  return post.displayName ?? post.username ?? `Kullanıcı #${shortId(post.userId)}`;
}

function avatarInitial(post: PostResponse): string {
  const label = post.username ?? post.userId;
  return label[0].toUpperCase();
}

export function PostCard({ post, onPress, onLike, onUnlike, onViewOutfit, onAuthorPress }: Props) {
  const [imgError, setImgError] = useState(false);

  function handleLikeToggle() {
    if (post.likedByCurrentUser) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={onAuthorPress ? () => onAuthorPress(post.userId) : undefined}
        disabled={!onAuthorPress}
        activeOpacity={onAuthorPress ? 0.7 : 1}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial(post)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userId}>{authorLabel(post)}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
        <Text style={styles.visibilityIcon}>{VISIBILITY_ICONS[post.visibility]}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
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
            <Text style={styles.imageFallbackHint}>Görsel yüklenemedi</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.body}>
        {post.caption ? (
          <Text style={styles.caption} numberOfLines={3}>{post.caption}</Text>
        ) : null}

        {post.outfitId && onViewOutfit ? (
          <TouchableOpacity
            style={styles.outfitChip}
            onPress={() => onViewOutfit(post.outfitId!)}
          >
            <Text style={styles.outfitChipText}>Kombini Gör</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLikeToggle}>
            <Text style={[styles.likeIcon, post.likedByCurrentUser && styles.likeIconActive]}>
              {post.likedByCurrentUser ? '♥' : '♡'}
            </Text>
            <Text style={[styles.actionCount, post.likedByCurrentUser && styles.actionCountActive]}>
              {post.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
            <Text style={styles.commentIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerInfo: { flex: 1 },
  userId: { fontSize: 13, fontWeight: '600', color: '#1E1B4B' },
  date: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  visibilityIcon: { fontSize: 16 },
  image: { width: '100%', height: 280 },
  imageFallback: {
    height: 160,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imageFallbackText: { fontSize: 40 },
  imageFallbackHint: { fontSize: 12, color: '#6B7280' },
  body: { padding: 14 },
  caption: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
  },
  outfitChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
  },
  outfitChipText: { fontSize: 12, color: '#6366F1', fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 2,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 20, color: '#9CA3AF' },
  likeIconActive: { color: '#EF4444' },
  commentIcon: { fontSize: 18 },
  actionCount: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  actionCountActive: { color: '#EF4444' },
});
