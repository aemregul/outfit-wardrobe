import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { PostResponse, VISIBILITY_ICONS } from '../../../shared/types/social.types';
import { formatDate } from '../../../shared/utils/date';
import { theme } from '../../../shared/theme';

interface Props {
  post: PostResponse;
  onPress: () => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  onViewOutfit?: (outfitId: string) => void;
  onAuthorPress?: (userId: string) => void;
}

function authorLabel(post: PostResponse): string {
  return post.displayName ?? post.username ?? `Kullanıcı #${post.userId.slice(0, 8).toUpperCase()}`;
}

function avatarInitial(post: PostResponse): string {
  return (post.username ?? post.userId)[0].toUpperCase();
}

export function PostCard({ post, onPress, onLike, onUnlike, onViewOutfit, onAuthorPress }: Props) {
  const [imgError, setImgError] = useState(false);

  function handleLikeToggle() {
    post.likedByCurrentUser ? onUnlike(post.id) : onLike(post.id);
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={onAuthorPress ? () => onAuthorPress(post.userId) : undefined}
        disabled={!onAuthorPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial(post)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.authorName}>{authorLabel(post)}</Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
        <Text style={styles.visibilityIcon}>{VISIBILITY_ICONS[post.visibility]}</Text>
      </TouchableOpacity>

      {/* Image */}
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
            <Text style={styles.fallbackIcon}>◷</Text>
            <Text style={styles.fallbackText}>Görsel yüklenemedi</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Body */}
      <View style={styles.body}>
        {post.outfitId && onViewOutfit ? (
          <TouchableOpacity
            style={styles.outfitChip}
            onPress={() => onViewOutfit(post.outfitId!)}
            activeOpacity={0.7}
          >
            <Text style={styles.outfitChipText}>✦ Kombini Gör</Text>
          </TouchableOpacity>
        ) : null}

        {post.caption ? (
          <Text style={styles.caption} numberOfLines={3}>{post.caption}</Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleLikeToggle} activeOpacity={0.7}>
            <Text style={[styles.likeIcon, post.likedByCurrentUser && styles.likeIconActive]}>
              {post.likedByCurrentUser ? '♥' : '♡'}
            </Text>
            <Text style={[styles.actionCount, post.likedByCurrentUser && styles.likeCountActive]}>
              {post.likesCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  headerInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  date: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  visibilityIcon: { fontSize: 16 },

  image: { width: '100%', height: 300 },
  imageFallback: {
    height: 160,
    backgroundColor: theme.colors.indigo50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  fallbackIcon: { fontSize: 36, color: theme.colors.indigo200 },
  fallbackText: { fontSize: 12, color: theme.colors.textSecondary },

  body: { padding: 14, gap: 10 },
  outfitChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.indigo50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.indigo100,
  },
  outfitChipText: { fontSize: 12, color: theme.colors.primary, fontWeight: '700' },
  caption: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: 12,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  likeIcon: { fontSize: 20, color: theme.colors.textMuted },
  likeIconActive: { color: '#EF4444' },
  commentIcon: { fontSize: 18 },
  actionCount: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  likeCountActive: { color: '#EF4444' },
});
