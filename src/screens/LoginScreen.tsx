// src/screens/LoginScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput as TI,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { signIn } from '../services/auth';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const pwRef = useRef<TI>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // AuthContext onAuthStateChange handles navigation
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
        {/* Brand header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={s.header}>
          <Text style={s.brand}>NUR CAFÉ</Text>
          <Text style={s.tagline}>Welcome back</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={s.form}>
          <View style={s.inputWrap}>
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
              onSubmitEditing={() => pwRef.current?.focus()}
            />
          </View>

          <View style={s.inputWrap}>
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
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={s.eyeBtn} accessibilityLabel="Toggle password visibility">
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            activeOpacity={0.9}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'SIGNING IN...' : 'SIGN IN'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(240).springify()} style={s.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.75}>
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
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: spacing['2xl'], justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  brand: { ...t.display, color: colors.onBrand, letterSpacing: 4 },
  tagline: { ...t.bodyLg, color: colors.onBrand, opacity: 0.75, marginTop: spacing.sm },

  form: { gap: spacing.base },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.base,
    height: 56,
  },
  icon: { marginRight: spacing.md },
  input: { flex: 1, ...t.bodyLg, color: colors.text },
  eyeBtn: { padding: spacing.sm },

  btn: {
    backgroundColor: colors.card,
    height: 56, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.sm,
    borderWidth: 2, borderColor: colors.brand,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { ...t.label, color: colors.brand, fontSize: 14 },

  footer: { alignItems: 'center', marginTop: spacing['2xl'] },
  footerText: { ...t.bodyLg, color: colors.onBrand, opacity: 0.8 },
  footerBold: { fontFamily: 'Manrope_800ExtraBold', opacity: 1 },
});
