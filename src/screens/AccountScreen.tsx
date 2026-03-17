// src/screens/AccountScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth';
import { supabase } from '../config/supabase';
import colors from '../theme/colors';
import { type as t } from '../theme/typography';
import { spacing, radius, touchTarget, shadow } from '../theme/spacing';

export default function AccountScreen() {
  const nav = useNavigation();
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

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
      setCurrentPw('');
      setNewPw('');
      Alert.alert('Password Updated', 'Your password has been changed successfully.');
    } catch {
      Alert.alert('Error', 'Could not update password. Please try again.');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={s.backBtn} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.onBrand} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Account</Text>
          <View style={{ width: touchTarget }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
          {/* Profile info */}
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

          {/* Change password */}
          <View style={[s.panel, { marginTop: spacing.xl }]}>
            <Text style={s.panelLabel}>SECURITY</Text>

            <View style={s.field}>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: touchTarget, height: touchTarget, borderRadius: radius.full,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', ...t.h2, color: colors.onBrand,
  },

  panel: {
    marginHorizontal: spacing.base,
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.md,
  },
  panelLabel: {
    ...t.label,
    color: colors.muted,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  field: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: { ...t.caption, color: colors.subText, marginBottom: 4 },
  fieldValue: { ...t.bodyLg, color: colors.text },
  input: {
    ...t.bodyLg,
    color: colors.text,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.brand,
    paddingBottom: 4,
  },

  saveBtn: {
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.brand,
  },
  saveBtnText: { ...t.label, color: colors.brand },
});
