import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Message {
  id: string;
  role: 'ai' | 'user';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  { icon: 'sunny-outline',     label: 'Bugün ne giysem?' },
  { icon: 'calendar-outline',  label: 'Haftalık kombin planla' },
  { icon: 'color-palette-outline', label: 'Renklerimi analiz et' },
  { icon: 'sparkles-outline',  label: 'Tarz önerisi ver' },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '0',
    role: 'ai',
    text: 'Merhaba! Ben senin kişisel moda asistanınım. 👗✨\n\nDolabın, kombinin veya stil tercihlerinle ilgili her şeyi sorabilirsin. Sana en iyi şekilde yardımcı olmaya hazırım!',
    time: now(),
  },
];

const AI_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['bugün', 'ne giyeyim', 'ne giysem', 'öneri'],
    response: 'Bugün hava güneşli ve 29°C 🌤️\n\nSana şunu öneririm:\n• **Bej keten gömlek** — hafif ve şık\n• **Slim fit krem pantolon** — günlük kullanıma uygun\n• **Beyaz sneaker** — her kombine yakışır\n\nDolabında bu parçalar mevcut. Kombini oluşturayım mı?',
  },
  {
    keywords: ['haftalık', 'plan', 'hafta'],
    response: 'Haftalık kombin planın hazır! 📅\n\n**Pazartesi:** Ofis görünümü — beyaz gömlek + lacivert pantolon\n**Salı:** Gündelik — bej sweatshirt + jeans\n**Çarşamba:** Şık gündelik — polo + chino\n**Perşembe:** Minimalist — siyah-beyaz kombinasyon\n**Cuma:** Rahat — linen gömlek + bej şort\n\nHerhangi bir günü değiştireyim mi?',
  },
  {
    keywords: ['renk', 'renkleri', 'palet', 'analiz'],
    response: 'Dolabın renk analizi sonucu 🎨\n\n**Ana renkler:** Bej, Krem, Siyah (%68)\n**Aksent renkler:** Lacivert, Haki (%22)\n**Nadir kullanılanlar:** Kırmızı, Yeşil (%10)\n\n**Önerim:** Bej tonlarında güçlü bir temel var. Haki ve lacivert ile aksan renkleri artırarak daha çeşitli kombinler kurabilirsin. 💛',
  },
  {
    keywords: ['tarz', 'stil', 'style'],
    response: 'Kıyafet geçmişine göre stil profilin 🌟\n\n**Ağırlıklı tarzın:** Minimalist Gündelik\n**Tercih ettiğin silüet:** Fitted, temiz kesimler\n**İmzalı renkler:** Nötr tonlar + altın aksanlar\n\n**Sana yakışacak öneriler:**\n• Linen素材 parçalar ekle\n• Oversize blazer dene\n• Beyaz tişört varyasyonlarını çoğalt\n\nBelirli bir parça önereyim mi?',
  },
  {
    keywords: ['teşekkür', 'sağol', 'harika', 'süper'],
    response: 'Rica ederim! 😊 Başka bir konuda yardımcı olabilir miyim? Kombin önerisi, dolap analizi veya alışveriş listesi hazırlamak için buradayım. ✨',
  },
];

function now(): string {
  return new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function getAIResponse(text: string): string {
  const lower = text.toLowerCase();
  for (const item of AI_RESPONSES) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.response;
    }
  }
  return 'Anlıyorum! Dolabındaki bilgilere göre sana özel bir öneri hazırlıyorum... 🤔\n\nBiraz daha detay verir misin? Örneğin; özel bir etkinlik mi, günlük kullanım mı, yoksa belirli bir tarz mı arıyorsun?';
}

function AIBubble({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <View style={styles.aiBubbleWrap}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
      </View>
      <View style={styles.aiBubble}>
        {lines.map((line, i) => {
          const isBold = line.startsWith('**') && line.includes('**');
          if (isBold) {
            const parts = line.split('**');
            return (
              <Text key={i} style={styles.aiBubbleText}>
                {parts.map((p, j) =>
                  j % 2 === 1
                    ? <Text key={j} style={styles.aiBubbleBold}>{p}</Text>
                    : p,
                )}
              </Text>
            );
          }
          return line ? (
            <Text key={i} style={styles.aiBubbleText}>{line}</Text>
          ) : (
            <View key={i} style={{ height: 6 }} />
          );
        })}
      </View>
    </View>
  );
}

function TypingIndicator() {
  return (
    <View style={styles.aiBubbleWrap}>
      <View style={styles.aiAvatar}>
        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
      </View>
      <View style={[styles.aiBubble, styles.typingBubble]}>
        <Text style={styles.typingDots}>● ● ●</Text>
      </View>
    </View>
  );
}

export function AIChatScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      time: now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: getAIResponse(trimmed),
        time: now(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1400);
  }, [isTyping]);

  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#4A403A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarSmall}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Yapay Zeka Asistan</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Çevrimiçi</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="information-circle-outline" size={22} color="#9C8C84" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Mesajlar */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          renderItem={({ item }) =>
            item.role === 'ai' ? (
              <View>
                <AIBubble text={item.text} />
                <Text style={styles.timeLabel}>{item.time}</Text>
              </View>
            ) : (
              <View>
                <View style={styles.userBubbleWrap}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{item.text}</Text>
                  </View>
                </View>
                <Text style={[styles.timeLabel, styles.timeLabelRight]}>{item.time}</Text>
              </View>
            )
          }
        />

        {/* Alt alan: promptlar + input birlikte sabitleniyor */}
        <View style={styles.bottomArea}>
          {messages.length <= 2 && !isTyping && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promptsRow}
              style={styles.promptsWrap}
            >
              {QUICK_PROMPTS.map(p => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.promptChip}
                  activeOpacity={0.8}
                  onPress={() => sendMessage(p.label)}
                >
                  <Ionicons name={p.icon as any} size={13} color="#C9A86A" />
                  <Text style={styles.promptChipText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TextInput
              style={styles.input}
              placeholder="Bir şeyler sor…"
              placeholderTextColor="#9C8C84"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage(inputText)}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isTyping) && styles.sendBtnDisabled]}
              activeOpacity={0.8}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isTyping}
            >
              <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#4A403A',
    lineHeight: 20,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  onlineText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9C8C84',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // Messages
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // AI bubble
  aiBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 2,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A403A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  aiBubble: {
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#959595',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 2,
  },
  aiBubbleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
  },
  aiBubbleBold: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4A403A',
  },

  // Typing
  typingBubble: {
    paddingVertical: 14,
  },
  typingDots: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#C9A86A',
    letterSpacing: 3,
  },

  // User bubble
  userBubbleWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: '#4A403A',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubbleText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  timeLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9C8C84',
    marginLeft: 38,
    marginBottom: 12,
  },
  timeLabelRight: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 2,
  },

  // Bottom area
  bottomArea: {
    backgroundColor: '#FDFBF7',
  },

  // Quick prompts
  promptsWrap: {
    flexShrink: 0,
    height: 52,
  },
  promptsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(201,168,106,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,106,0.3)',
  },
  promptChipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#C9A86A',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
    lineHeight: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C9A86A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D9CFC5',
  },
});
