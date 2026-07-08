import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PostComments'>;

interface Comment {
  id: string;
  username: string;
  initial: string;
  text: string;
  time: string;
  liked: boolean;
  likesCount: number;
}

const MOCK_COMMENTS: Comment[] = [
  { id: '1', username: 'mert_m',   initial: 'M', text: 'Çok güzel duruyor, bu renk kombinasyonu harika!', time: '1 sa önce', liked: false, likesCount: 4 },
  { id: '2', username: 'selin_c',  initial: 'S', text: 'Hangi marka bu? Nereden aldın?', time: '2 sa önce', liked: true, likesCount: 1 },
  { id: '3', username: 'berk_o',   initial: 'B', text: 'Office look için birebir 🔥', time: '3 sa önce', liked: false, likesCount: 7 },
  { id: '4', username: 'ayse_k',   initial: 'A', text: 'Ben de aynısını almak istiyorum', time: '4 sa önce', liked: false, likesCount: 0 },
  { id: '5', username: 'zeynep_k', initial: 'Z', text: 'Minimalist ve şık, tam senlik 💛', time: '5 sa önce', liked: true, likesCount: 12 },
];

const AVATAR_COLORS = ['#4A403A', '#8B6E52', '#C9A86A', '#6B5B47', '#9C7B5E', '#7A6355'];

export function CommentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [text, setText] = useState('');
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  if (!fontsLoaded) return <View style={styles.container} />;

  const sendComment = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      username: 'sen',
      initial: 'S',
      text: trimmed,
      time: 'az önce',
      liked: false,
      likesCount: 0,
    };
    setComments(prev => [newComment, ...prev]);
    setText('');
  };

  const toggleLike = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, liked: !c.liked, likesCount: c.liked ? c.likesCount - 1 : c.likesCount + 1 }
        : c,
    ));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Drag handle */}
      <View style={styles.handleWrap}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Yorumlar</Text>
        <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color="#4A403A" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Comments list */}
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.commentRow}>
            <View style={[
              styles.avatar,
              { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] },
            ]}>
              <Text style={styles.avatarText}>{item.initial}</Text>
            </View>
            <View style={styles.commentBody}>
              <Text style={styles.commentText}>
                <Text style={styles.commentUsername}>{item.username} </Text>
                {item.text}
              </Text>
              <View style={styles.commentMeta}>
                <Text style={styles.commentTime}>{item.time}</Text>
                {item.likesCount > 0 && (
                  <Text style={styles.commentLikeCount}>{item.likesCount} beğeni</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.commentLikeBtn}
              activeOpacity={0.7}
              onPress={() => toggleLike(item.id)}
            >
              <Ionicons
                name={item.liked ? 'heart' : 'heart-outline'}
                size={14}
                color={item.liked ? '#E74C3C' : '#9C8C84'}
              />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TextInput
          style={styles.input}
          placeholder="Yorum ekle…"
          placeholderTextColor="#9C8C84"
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          activeOpacity={0.8}
          onPress={sendComment}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: '#4A403A',
    lineHeight: 24,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  listContent: {
    padding: 16,
    gap: 18,
  },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
  },
  commentUsername: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
  },
  commentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  commentTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },
  commentLikeCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9C8C84',
  },
  commentLikeBtn: {
    padding: 4,
    flexShrink: 0,
  },

  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#9C8C84',
    textAlign: 'center',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FDFBF7',
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: '#F0EBE3',
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D9CFC5',
  },
});
