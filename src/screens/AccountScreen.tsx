// src/screens/AccountScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth';
import { supabase } from '../config/supabase';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
const PRIVACY_URL = 'https://nurcafe-admin.vercel.app/privacy';
const TERMS_URL   = 'https://nurcafe-admin.vercel.app/terms';

export default function AccountScreen() {
  const nav = useNavigation();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [name, setName]         = useState(profile?.name ?? '');
  const [saving, setSaving]     = useState(false);
  const [newPw, setNewPw]       = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveName = async () => {
    if (!name.trim() || !user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { name: name.trim() });
      await refreshProfile();
      Alert.alert('Saved', 'Your name has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPw || newPw.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters.');
      return;
    }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setNewPw('');
      Alert.alert('Password Updated', 'Your password has been changed successfully.');
    } catch {
      Alert.alert('Error', 'Could not update password. Please try again.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, order history, and loyalty points. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'This is your final confirmation. Tap "Delete" to permanently remove your account, order history, and loyalty points.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: confirmDelete,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await (supabase as any).rpc('delete_user_account');
      if (error) throw error;
      await signOut();
    } catch {
      Alert.alert('Error', 'Could not delete your account. Please contact support at hello@nurcafe.co.uk');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Account</Text>
          <View style={{ width: touchTarget }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>

          {/* Profile */}
          <View style={s.panel}>
            <Text style={s.panelLabel}>PROFILE</Text>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Full Name</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />
            </View>
            <View style={[s.field, { borderBottomWidth: 0 }]}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity style={s.saveBtn} onPress={handleSaveName} disabled={saving} activeOpacity={0.85}>
            <Text style={s.saveBtnText}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</Text>
          </TouchableOpacity>

          {/* Security */}
          <View style={[s.panel, { marginTop: spacing.xl }]}>
            <Text style={s.panelLabel}>SECURITY</Text>
            <View style={[s.field, { borderBottomWidth: 0 }]}>
              <Text style={s.fieldLabel}>New Password</Text>
              <TextInput
                style={s.input}
                value={newPw}
                onChangeText={setNewPw}
                secureTextEntry
                placeholderTextColor={colors.muted}
                placeholder="Min. 6 characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[s.saveBtn, { marginTop: spacing.md }]}
            onPress={handleChangePassword}
            disabled={changingPw}
            activeOpacity={0.85}
          >
            <Text style={s.saveBtnText}>{changingPw ? 'UPDATING...' : 'UPDATE PASSWORD'}</Text>
          </TouchableOpacity>

          {/* Legal */}
          <View style={[s.panel, { marginTop: spacing.xl }]}>
            <Text style={s.panelLabel}>LEGAL</Text>
            <TouchableOpacity style={s.linkRow} onPress={() => Linking.openURL(PRIVACY_URL)} activeOpacity={0.7}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.subText} />
              <Text style={s.linkText}>Privacy Policy</Text>
              <Ionicons name="open-outline" size={14} color={colors.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.linkRow, { borderBottomWidth: 0 }]}
              onPress={() => Linking.openURL(TERMS_URL)}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.subText} />
              <Text style={s.linkText}>Terms of Service</Text>
              <Ionicons name="open-outline" size={14} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Sign out */}
          <TouchableOpacity style={[s.actionRow, { marginTop: spacing.xl }]} onPress={handleSignOut} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={colors.subText} />
            <Text style={s.actionText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Delete account */}
          <TouchableOpacity
            style={[s.actionRow, s.dangerRow]}
            onPress={handleDeleteAccount}
            disabled={deleting}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={s.dangerText}>{deleting ? 'Deleting...' : 'Delete Account'}</Text>
          </TouchableOpacity>

          {/* App version */}
          <Text style={s.version}>Nūr Café v{APP_VERSION}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.base, paddingBottom: spacing.sm,
  },
  backBtn: {
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', ...t.h2, color: colors.onBrand },

  panel: {
    marginHorizontal: spacing.base, marginTop: spacing.xl,
    backgroundColor: colors.card, borderRadius: radius['2xl'],
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', ...shadow.md,
  },
  panelLabel: {
    ...t.labelLg, color: colors.muted,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base, paddingBottom: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  field: {
    paddingHorizontal: spacing.base, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fieldLabel: { ...t.caption, color: colors.subText, marginBottom: 4 },
  fieldValue: { ...t.bodyLg, color: colors.text },
  input: {
    ...t.bodyLg, color: colors.text, padding: 0,
    borderBottomWidth: 1, borderBottomColor: colors.brand, paddingBottom: 4,
  },

  saveBtn: {
    marginHorizontal: spacing.base, marginTop: spacing.base,
    backgroundColor: colors.card, borderRadius: radius.full,
    paddingVertical: spacing.base, alignItems: 'center',
    borderWidth: 2, borderColor: colors.brand,
  },
  saveBtnText: { ...t.labelLg, color: colors.brand },

  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.base, paddingVertical: spacing.base,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  linkText: { ...t.body, color: colors.text, flex: 1 },

  actionRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.base,
    backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.base, paddingVertical: spacing.base,
    marginTop: spacing.sm,
  },
  actionText: { ...t.body, color: colors.subText },

  dangerRow: { borderColor: '#EF444430', backgroundColor: '#EF444408' },
  dangerText: { ...t.body, color: '#EF4444' },

  version: {
    ...t.caption, color: colors.muted,
    textAlign: 'center', marginTop: spacing.xl,
  },
});
