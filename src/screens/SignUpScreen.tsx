// src/screens/SignUpScreen.tsx
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { signUp } from '../services/auth';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const pwRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const data = await signUp(email.trim().toLowerCase(), password, name.trim());
      // If no session, email confirmation is required — show "check your email"
      // If session exists, AuthContext onAuthStateChange handles navigation automatically
      if (!data.session) setEmailSent(true);
    } catch (e: any) {
      const msg =
        e.message?.includes('already registered') || e.message?.includes('already_exists')
          ? 'An account with this email already exists.'
          : 'Sign up failed. Please try again.';
      Alert.alert('Sign Up Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>
          <Animated.View entering={FadeInDown.springify()} style={s.confirmWrap}>
            <Ionicons name="mail-open-outline" size={56} color={colors.card} style={{ marginBottom: spacing.xl }} />
            <Text style={s.brand}>CHECK YOUR EMAIL</Text>
            <Text style={[s.tagline, { marginTop: spacing.md }]}>
              We sent a verification link to{'\n'}
              <Text style={{ fontFamily: 'Manrope_800ExtraBold' }}>{email.trim().toLowerCase()}</Text>
            </Text>
            <Text style={[s.tagline, { marginTop: spacing.lg, opacity: 0.6 }]}>
              Click the link in that email, then come back and sign in.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={[s.btn, { marginTop: spacing['2xl'] }]}
              activeOpacity={0.9}
            >
              <Text style={s.btnText}>GO TO SIGN IN</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={s.header}>
          <Text style={s.brand}>JOIN NŪR</Text>
          <Text style={s.tagline}>Create your account to start earning rewards</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.form}>
          <View style={s.inputWrap}>
            <Ionicons name="person-outline" size={20} color={colors.muted} style={s.icon} />
            <TextInput
              style={s.input}
              placeholder="First name"
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              returnKeyType="next"
              value={name}
              onChangeText={setName}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={colors.muted} style={s.icon} />
            <TextInput
              ref={emailRef}
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
              placeholder="Password (min. 6 characters)"
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPw}
              returnKeyType="done"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleSignUp}
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)} style={s.eyeBtn} accessibilityLabel="Toggle password">
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            activeOpacity={0.9}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={s.btnText}>{loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={s.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.75}>
            <Text style={s.footerText}>
              Already have an account?{'  '}
              <Text style={s.footerBold}>Sign in</Text>
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
  tagline: {
    ...t.bodyLg, color: colors.onBrand, opacity: 0.75,
    marginTop: spacing.sm, textAlign: 'center',
  },

  confirmWrap: { alignItems: 'center' },

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
