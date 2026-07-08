import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { PostResponse } from '../../../shared/types/social.types';

interface Props {
  post: PostResponse;
  onPress: () => void;
  onLike: (id: string) => void;
  onUnlike: (id: string) => void;
  onViewOutfit?: (outfitId: string, imageUrl: string, caption?: string, username?: string) => void;
  onAuthorPress?: (userId: string) => void;
  onComments?: (postId: string) => void;
}

function authorLabel(post: PostResponse): string {
  return post.displayName ?? post.username ?? 'kullanici';
}

function avatarInitial(post: PostResponse): string {
  const label = post.username ?? post.userId;
  return label[0].toUpperCase();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} gün önce`;
  return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function PostCard({ post, onPress, onLike, onUnlike, onViewOutfit, onAuthorPress, onComments }: Props) {
  const [imgError, setImgError]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [liked, setLiked]         = useState(post.likedByCurrentUser);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  if (!fontsLoaded) return null;

  const handleLike = () => {
    if (liked) {
      onUnlike(post.id);
      setLiked(false);
      setLikesCount(c => Math.max(0, c - 1));
    } else {
      onLike(post.id);
      setLiked(true);
      setLikesCount(c => c + 1);
    }
  };

  return (
    <View style={styles.card}>
      {/* ── Üst: Kullanıcı bilgisi ── */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={onAuthorPress ? 0.7 : 1}
        onPress={onAuthorPress ? () => onAuthorPress(post.userId) : undefined}
        disabled={!onAuthorPress}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial(post)}</Text>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{authorLabel(post)}</Text>
          <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
        </View>
        <TouchableOpacity style={styles.followBtn} activeOpacity={0.8}>
          <Text style={styles.followBtnText}>Takip Et</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#9C8C84" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ── Fotoğraf ── */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.97}>
        {!imgError ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={40} color="#C9A86A" />
            <Text style={styles.imageFallbackText}>Görsel yüklenemedi</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* ── Aksiyonlar ── */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={handleLike}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? '#E74C3C' : '#4A403A'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.7}
            onPress={() => onComments ? onComments(post.id) : onPress()}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#4A403A" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => setSaved(s => !s)}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? '#C9A86A' : '#4A403A'}
          />
        </TouchableOpacity>
      </View>

      {/* ── İçerik ── */}
      <View style={styles.body}>
        {likesCount > 0 && (
          <Text style={styles.likesCount}>{likesCount.toLocaleString('tr-TR')} beğeni</Text>
        )}

        {post.caption ? (
          <Text style={styles.caption} numberOfLines={3}>
            <Text style={styles.captionUsername}>{authorLabel(post)} </Text>
            {post.caption}
          </Text>
        ) : null}

        {post.outfitId && onViewOutfit && (
          <TouchableOpacity
            style={styles.outfitChip}
            activeOpacity={0.8}
            onPress={() => onViewOutfit(post.outfitId!, post.imageUrl, post.caption, post.displayName ?? post.username)}
          >
            <Ionicons name="shirt-outline" size={12} color="#C9A86A" />
            <Text style={styles.outfitChipText}>Kombini Gör</Text>
          </TouchableOpacity>
        )}

        {post.commentsCount > 0 && (
          <TouchableOpacity
            onPress={() => onComments ? onComments(post.id) : onPress()}
            activeOpacity={0.7}
          >
            <Text style={styles.commentsLink}>
              {post.commentsCount} yorumun tamamını gör
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#959595',
    shadowOffset: { width: 4, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  avatarWrap: {
    borderWidth: 2,
    borderColor: '#C9A86A',
    borderRadius: 9999,
    padding: 2,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerInfo: { flex: 1 },
  username: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 18,
  },
  time: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9C8C84',
    lineHeight: 14,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: '#C9A86A',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  followBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C9A86A',
  },
  moreBtn: {
    padding: 4,
  },

  // Image
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  imageFallback: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  imageFallbackText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  actionsLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },

  // Body
  body: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
  },
  likesCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4A403A',
  },
  caption: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
  },
  captionUsername: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
  },
  outfitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,106,0.12)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
  },
  outfitChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#C9A86A',
  },
  commentsLink: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9C8C84',
  },
});
