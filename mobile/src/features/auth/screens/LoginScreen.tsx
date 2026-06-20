import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts, Poppins_300Light, Poppins_400Regular, Poppins_500Medium,
} from '@expo-google-fonts/poppins';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import {
  useAuthRequest, makeRedirectUri, CodeChallengeMethod,
} from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import type { AppNavigationProp } from '../../../app/navigation/types';
import { useAuthStore } from '../store/authStore';
import { PressableScale } from '../../../shared/components/PressableScale';

WebBrowser.maybeCompleteAuthSession();

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8081';
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM ?? 'outfit-combine';
const CLIENT_ID =
  process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID_NATIVE ?? 'outfit-combine-mobile';

const discovery = {
  authorizationEndpoint:
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
  tokenEndpoint:
    `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
};

const redirectUri = makeRedirectUri({ scheme: 'outfitcombine', path: 'auth/callback' });

// Keycloak ortam değişkeni tanımlanmadıysa (yerel sunucu yoksa) gerçek OAuth akışı atlanır.
const KEYCLOAK_CONFIGURED = !!process.env.EXPO_PUBLIC_KEYCLOAK_URL;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
} as const;

const appleIcon = require('../../../../assets/icons/apple.png');
const googleIcon = require('../../../../assets/icons/google.png');
const viewIcon = require('../../../../assets/icons/view.png');
const hideIcon = require('../../../../assets/icons/hide 1.png');

export function LoginScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const setToken = useAuthStore((s) => s.setToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const isFilled = email.trim().length > 0 && password.length > 0;

  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    PlayfairDisplay_700Bold,
  });

  const [request, , promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      usePKCE: true,
      codeChallengeMethod: CodeChallengeMethod.S256,
    },
    discovery,
  );

  const handleLogin = useCallback(async () => {
    if (!KEYCLOAK_CONFIGURED || !request) {
      // Keycloak henüz yapılandırılmadı: ekran akışını test edebilmek için
      // doğrudan profil kurulum ekranına geç.
      navigation.navigate('ProfileSetup');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await promptAsync();
      if (result.type !== 'success') {
        setError('Giriş iptal edildi veya başarısız oldu.');
        return;
      }
      const { code } = result.params;
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: redirectUri,
        code_verifier: request.codeVerifier!,
      });
      const res = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (!res.ok) throw new Error('Token alınamadı. Tekrar deneyin.');
      const data = (await res.json()) as {
        access_token: string;
        refresh_token: string;
      };
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
      setToken(data.access_token);
    } catch (e: any) {
      setError(e?.message ?? 'Bilinmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [request, promptAsync, setToken, navigation]);

  if (!fontsLoaded) {
    return <View style={styles.container} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 71, paddingBottom: Math.max(insets.bottom, 20) + 24 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Stylely</Text>
        <Text style={styles.subtitle}>Giriş Yap</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.fields}>
        <TextInput
          style={[styles.input, emailFocused && styles.inputFocused]}
          placeholder="E-posta"
          placeholderTextColor="#1F1F1F"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={[styles.passwordWrapper, styles.inputSpacing]}>
          <TextInput
            style={[styles.input, styles.passwordInput, passwordFocused && styles.inputFocused]}
            placeholder="Şifre"
            placeholderTextColor="#1F1F1F"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Image
              source={showPassword ? viewIcon : hideIcon}
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.7}
            onPress={() => setRememberMe((v) => !v)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]} />
            <Text style={styles.rememberText}>Beni Hatırla</Text>
          </TouchableOpacity>

          <Text style={styles.forgotText}>Şifremi Unuttum</Text>
        </View>
      </View>

      <PressableScale
        style={[styles.primaryBtn, isFilled && styles.primaryBtnFilled, loading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>Giriş Yap</Text>}
      </PressableScale>

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Hesabınız yok mu?</Text>
        <Text style={styles.signupLink}>Kaydol</Text>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.divider} />
      </View>

      <PressableScale style={styles.appleBtn}>
        <Image source={appleIcon} style={styles.appleIcon} resizeMode="contain" />
        <Text style={styles.appleBtnText}>Apple ile Devam Et</Text>
      </PressableScale>

      <PressableScale style={styles.googleBtn}>
        <Image source={googleIcon} style={styles.googleIcon} resizeMode="contain" />
        <Text style={styles.googleBtnText}>Google ile Devam Et</Text>
      </PressableScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 40,
    lineHeight: 48,
    color: '#1F1F1F',
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    lineHeight: 40,
    color: '#C9A86A',
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 12,
  },
  fields: {
    marginTop: 33,
  },
  input: {
    height: 40,
    backgroundColor: '#EAE3D8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 21,
    fontFamily: 'Poppins_300Light',
    fontSize: 13,
    color: '#1F1F1F',
  },
  inputFocused: {
    borderColor: '#C9A86A',
  },
  inputSpacing: {
    marginTop: 14,
  },
  passwordWrapper: {
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 8,
    top: 10,
    width: 20,
    height: 20,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  optionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  checkboxChecked: {
    backgroundColor: '#1F1F1F',
  },
  rememberText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#1F1F1F',
  },
  forgotText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: '#C9A86A',
  },
  primaryBtn: {
    height: 40,
    borderRadius: 15,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  primaryBtnFilled: {
    backgroundColor: '#C9A86A',
  },
  primaryBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  signupRow: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  signupText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4A403A',
  },
  signupLink: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: '#C9A86A',
  },
  dividerRow: {
    marginTop: 41,
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#4A403A',
  },
  dividerText: {
    fontFamily: 'Poppins_300Light',
    fontSize: 12,
    color: '#4A403A',
    marginHorizontal: 12,
  },
  appleBtn: {
    height: 40,
    borderRadius: 15,
    backgroundColor: '#1F1F1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
  },
  appleIcon: {
    width: 13,
    height: 14.63,
  },
  appleBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#FFFFFF',
  },
  googleBtn: {
    height: 40,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6E655C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  googleIcon: {
    width: 13,
    height: 14.63,
  },
  googleBtnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: '#1F1F1F',
  },
});
