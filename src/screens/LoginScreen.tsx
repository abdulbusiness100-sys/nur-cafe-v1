// src/screens/LoginScreen.tsx
// Full terracotta redesign — NUR / نور logo block, cream pill inputs, spring button
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, TextInput as TI,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { signIn } from '../services/auth';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';
import { springs } from '../theme/springs';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [loading,     setLoading]     = useState(false);
  const [showPw,      setShowPw]      = useState(false);
  const [focusedFld,  setFocusedFld]  = useState<string | null>(null);
  const pwRef = useRef<TI>(null);

  // ─── Sign-in button spring ──────────────────────────────────────────────────
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      const msg =
        e.message?.includes('Invalid login') || e.message?.includes('invalid_credentials')
          ? 'Incorrect email or password.'
          : 'Login failed. Please try again.';
      Alert.alert('Login Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.container}>

        {/* ── Logo block ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={s.logoBlock}
        >
          <Text style={s.logoNur}>NUR</Text>
          <View style={s.hairline} />
          <Text style={s.logoArabic}>نور</Text>
        </Animated.View>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={s.divider}
        />

        {/* ── Email input ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={[s.inputWrap, focusedFld === 'email' && s.inputFocused]}
        >
          <Ionicons name="mail-outline" size={20} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="Email address"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedFld('email')}
            onBlur={() => setFocusedFld(null)}
            onSubmitEditing={() => pwRef.current?.focus()}
          />
        </Animated.View>

        {/* ── Password input ───────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(220).springify()}
          style={[s.inputWrap, focusedFld === 'password' && s.inputFocused]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={colors.muted} style={s.icon} />
          <TextInput
            ref={pwRef}
            style={s.input}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPw}
            returnKeyType="done"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedFld('password')}
            onBlur={() => setFocusedFld(null)}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            onPress={() => setShowPw((v) => !v)}
            style={s.eyeBtn}
            accessibilityLabel="Toggle password visibility"
          >
            <Ionicons
              name={showPw ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Forgot password ──────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(260).springify()}
          style={s.forgotRow}
        >
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={s.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Sign in button ───────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={btnStyle}
        >
          <Pressable
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPressIn={() => { btnScale.value = withSpring(0.97, springs.button); }}
            onPressOut={() => { btnScale.value = withSpring(1.0, springs.button); }}
            onPress={handleLogin}
          >
            {loading
              ? <ActivityIndicator color={colors.terracotta} />
              : <Text style={s.btnText}>SIGN IN</Text>
            }
          </Pressable>
        </Animated.View>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(380).springify()}
          style={s.footer}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            activeOpacity={0.75}
          >
            <Text style={s.footerText}>
              Don't have an account?{'  '}
              <Text style={s.footerBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.terracotta },
  container: {
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'center',
    gap: 0,
  },

  // ─── Logo ───────────────────────────────────────────────────────────────────
  logoBlock: {
    alignItems:    'center',
    marginBottom:  spacing['2xl'],
  },
  logoNur: {
    fontFamily:    fonts.amiriBold,
    fontSize:      72,
    color:         colors.cream,
    letterSpacing: 4,
    lineHeight:    80,
  },
  hairline: {
    width:           48,
    height:          2,
    backgroundColor: colors.cream,
    borderRadius:    1,
    marginVertical:  8,
    opacity:         0.7,
  },
  logoArabic: {
    fontFamily:    fonts.amiriBold,
    fontSize:      52,
    color:         colors.cream,
    letterSpacing: 2,
    lineHeight:    60,
  },

  // ─── Divider ─────────────────────────────────────────────────────────────
  divider: {
    height:          1,
    backgroundColor: colors.cream,
    opacity:         0.15,
    marginBottom:    spacing['2xl'],
  },

  // ─── Inputs ──────────────────────────────────────────────────────────────
  inputWrap: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  colors.cream,
    borderRadius:     14,
    borderWidth:      1.5,
    borderColor:      colors.creamDeep,
    paddingHorizontal: 18,
    height:           54,
    marginBottom:     spacing.base,
  },
  inputFocused: {
    borderColor: colors.terracottaSoft,
    borderWidth: 2,
  },
  icon:   { marginRight: spacing.md },
  input:  {
    flex:       1,
    fontFamily: fonts.medium,
    fontSize:   16,
    color:      colors.deepBrown,
  },
  eyeBtn: { padding: spacing.sm },

  // ─── Forgot ──────────────────────────────────────────────────────────────
  forgotRow: {
    alignItems:    'flex-end',
    marginBottom:  spacing['2xl'],
    marginTop:     -spacing.sm,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize:   14,
    color:      colors.cream,
    opacity:    0.75,
  },

  // ─── Button ──────────────────────────────────────────────────────────────
  btn: {
    backgroundColor: colors.cream,
    height:          56,
    borderRadius:    14,
    alignItems:      'center',
    justifyContent:  'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily:    fonts.extrabold,
    fontSize:      15,
    color:         colors.terracotta,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },

  // ─── Footer ──────────────────────────────────────────────────────────────
  footer: {
    alignItems:  'center',
    marginTop:   spacing['2xl'],
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize:   15,
    color:      colors.cream,
    opacity:    0.8,
  },
  footerBold: {
    fontFamily: fonts.extrabold,
    opacity:    1,
  },
});
