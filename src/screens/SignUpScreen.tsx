// src/screens/SignUpScreen.tsx
// Matching terracotta redesign — JOIN NŪR / انضم لنور, cream inputs, spring button
import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
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
import { signUp } from '../services/auth';
import colors from '../theme/colors';
import { fonts } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { springs } from '../theme/springs';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [emailSent,  setEmailSent]  = useState(false);
  const [focusedFld, setFocusedFld] = useState<string | null>(null);
  const emailRef = useRef<TextInput>(null);
  const pwRef    = useRef<TextInput>(null);

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

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

  // ─── Email sent confirmation ─────────────────────────────────────────────────
  if (emailSent) {
    return (
      <View style={s.safe}>
        <Animated.View entering={FadeInDown.springify()} style={s.confirmWrap}>
          <Ionicons name="mail-open-outline" size={56} color={colors.cream} style={{ marginBottom: spacing.xl }} />

          <Text style={[s.logoNur, { fontSize: 32, marginBottom: spacing.md }]}>
            CHECK YOUR EMAIL
          </Text>

          <Text style={s.confirmBody}>
            We sent a verification link to{'\n'}
            <Text style={{ fontFamily: fonts.extrabold }}>{email.trim().toLowerCase()}</Text>
          </Text>

          <Text style={[s.confirmBody, { marginTop: spacing.md, opacity: 0.6 }]}>
            Click the link in that email, then come back and sign in.
          </Text>

          <Animated.View style={[btnStyle, { width: '100%', marginTop: spacing['2xl'] }]}>
            <Pressable
              style={s.btn}
              onPressIn={() => { btnScale.value = withSpring(0.97, springs.button); }}
              onPressOut={() => { btnScale.value = withSpring(1.0, springs.button); }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={s.btnText}>GO TO SIGN IN</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.safe}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo block ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={s.logoBlock}
        >
          <Text style={s.logoNur}>NUR</Text>
          <View style={s.hairline} />
          <Text style={[s.logoArabic, { fontSize: 28, lineHeight: 36, letterSpacing: 1 }]}>
            انضم لنور
          </Text>
          <Text style={s.tagline}>Create your account to start earning rewards</Text>
        </Animated.View>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={s.divider}
        />

        {/* ── Name input ───────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(140).springify()}
          style={[s.inputWrap, focusedFld === 'name' && s.inputFocused]}
        >
          <Ionicons name="person-outline" size={20} color={colors.muted} style={s.icon} />
          <TextInput
            style={s.input}
            placeholder="First name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            returnKeyType="next"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedFld('name')}
            onBlur={() => setFocusedFld(null)}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </Animated.View>

        {/* ── Email input ──────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[s.inputWrap, focusedFld === 'email' && s.inputFocused]}
        >
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
            onFocus={() => setFocusedFld('email')}
            onBlur={() => setFocusedFld(null)}
            onSubmitEditing={() => pwRef.current?.focus()}
          />
        </Animated.View>

        {/* ── Password input ───────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(260).springify()}
          style={[s.inputWrap, focusedFld === 'password' && s.inputFocused]}
        >
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
            onFocus={() => setFocusedFld('password')}
            onBlur={() => setFocusedFld(null)}
            onSubmitEditing={handleSignUp}
          />
          <TouchableOpacity
            onPress={() => setShowPw((v) => !v)}
            style={s.eyeBtn}
            accessibilityLabel="Toggle password"
          >
            <Ionicons
              name={showPw ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Create button ────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(320).springify()}
          style={[btnStyle, { marginTop: spacing.lg }]}
        >
          <Pressable
            style={[s.btn, loading && s.btnDisabled]}
            disabled={loading}
            onPressIn={() => { btnScale.value = withSpring(0.97, springs.button); }}
            onPressOut={() => { btnScale.value = withSpring(1.0, springs.button); }}
            onPress={handleSignUp}
          >
            {loading
              ? <ActivityIndicator color={colors.terracotta} />
              : <Text style={s.btnText}>CREATE ACCOUNT</Text>
            }
          </Pressable>
        </Animated.View>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={s.footer}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.75}
          >
            <Text style={s.footerText}>
              Already have an account?{'  '}
              <Text style={s.footerBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.terracotta },
  container: {
    flexGrow:          1,
    paddingHorizontal: spacing['2xl'],
    paddingVertical:   spacing['3xl'],
    justifyContent:    'center',
  },

  // ─── Confirm screen ──────────────────────────────────────────────────────
  confirmWrap: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  confirmBody: {
    fontFamily: fonts.medium,
    fontSize:   15,
    color:      colors.cream,
    textAlign:  'center',
    lineHeight: 22,
    opacity:    0.85,
  },

  // ─── Logo ───────────────────────────────────────────────────────────────────
  logoBlock: {
    alignItems:    'center',
    marginBottom:  spacing['2xl'],
  },
  logoNur: {
    fontFamily:    fonts.amiriBold,
    fontSize:      52,
    color:         colors.cream,
    letterSpacing: 4,
    lineHeight:    60,
  },
  hairline: {
    width:           40,
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
  tagline: {
    fontFamily:  fonts.medium,
    fontSize:    14,
    color:       colors.cream,
    opacity:     0.7,
    marginTop:   spacing.sm,
    textAlign:   'center',
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
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   colors.cream,
    borderRadius:      14,
    borderWidth:       1.5,
    borderColor:       colors.creamDeep,
    paddingHorizontal: 18,
    height:            54,
    marginBottom:      spacing.base,
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
