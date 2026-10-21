import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Svg, Path, Circle, Polyline } from 'react-native-svg';
import { Colors } from '../constants/colors';
import Toast from '../components/Toast';
import api from '../lib/api';

// ─── Icons ─────────────────────────────────────────────────────────────────────
function IconBack() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke="#64748B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 5l-7 7 7 7" stroke="#64748B" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconCamera() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke="#fff" strokeWidth={2.2} />
    </Svg>
  );
}
function IconUser() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke="#94A3B8" strokeWidth={1.9} />
    </Svg>
  );
}
function IconPhone() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.38-.38a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconMail() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="22,6 12,13 2,6" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconPin() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" stroke="#94A3B8" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke="#94A3B8" strokeWidth={1.9} />
    </Svg>
  );
}
function IconCheck() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Polyline points="20 6 9 17 4 12" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Field Component ───────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={f.inputRow}>
        <View style={f.iconWrap}>{icon}</View>
        {children}
      </View>
    </View>
  );
}
const f = StyleSheet.create({
  wrap:     { marginBottom: 14 },
  label:    { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 13, paddingVertical: 3 },
  iconWrap: { marginRight: 10, opacity: 0.9 },
});

// ─── Section Divider ───────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <View style={sd.wrap}>
      <Text style={sd.text}>{title}</Text>
    </View>
  );
}
const sd = StyleSheet.create({
  wrap: { marginBottom: 10, marginTop: 4 },
  text: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 1.1, textTransform: 'uppercase' },
});

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileUpdateScreen({ navigation }) {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', email: '' });
  const [image, setImage]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        const u   = res.data?.user || {};
        setFormData({
          name:    u.name    || '',
          phone:   u.phone   || u.mobile || '',
          address: u.address || '',
          email:   u.email   || '',
        });
        if (u.userImage?.img) setImage(u.userImage.img);
      } catch (e) {
        showToast('Failed to load profile data');
      }
    };
    fetchUser();
  }, []);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) { showToast('Name is required'); return; }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', formData.name.trim());
      if (formData.phone)   form.append('phone',   formData.phone.trim());
      if (formData.address) form.append('address', formData.address.trim());
      if (formData.email)   form.append('email',   formData.email.trim());
      if (image && !image.startsWith('http')) {
        const filename = image.split('/').pop();
        const match    = /\.(\w+)$/.exec(filename);
        form.append('userIdImage', { uri: image, name: filename || 'profile.jpg', type: match ? `image/${match[1]}` : 'image/jpeg' });
      }
      const res = await api.put('/api/auth/update_user_profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        showToast('Profile updated successfully!');
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = formData.name
    ? formData.name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <View style={s.topbar}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <IconBack />
          </TouchableOpacity>
          <Text style={s.topbarTitle}>Edit Profile</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ── Avatar Zone ──────────────────────────────────────────────── */}
          <View style={s.avatarZone}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.85} style={s.avatarRing}>
              {image ? (
                <Image source={{ uri: image }} style={s.avatarImage} />
              ) : (
                <Text style={s.avatarInitials}>{initials}</Text>
              )}
              <View style={s.camBadge}><IconCamera /></View>
            </TouchableOpacity>
            <Text style={s.avatarHint}>Tap to change photo</Text>
          </View>

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <View style={s.formBody}>
            <SectionTitle title="Personal Info" />

            <Field label="Full Name" icon={<IconUser />}>
              <TextInput
                style={s.textInput}
                value={formData.name}
                onChangeText={t => setFormData({ ...formData, name: t })}
                placeholder="Enter your full name"
                placeholderTextColor="#CBD5E1"
              />
            </Field>

            <Field label="Phone Number" icon={<IconPhone />}>
              <TextInput
                style={s.textInput}
                value={formData.phone}
                onChangeText={t => setFormData({ ...formData, phone: t })}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#CBD5E1"
              />
            </Field>

            <Field label="Email Address" icon={<IconMail />}>
              <TextInput
                style={s.textInput}
                value={formData.email}
                onChangeText={t => setFormData({ ...formData, email: t })}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#CBD5E1"
              />
            </Field>

            <View style={s.divider} />
            <SectionTitle title="Location" />

            <Field label="Address" icon={<IconPin />}>
              <TextInput
                style={[s.textInput, s.textArea]}
                value={formData.address}
                onChangeText={t => setFormData({ ...formData, address: t })}
                placeholder="Enter your full address"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor="#CBD5E1"
              />
            </Field>

            {/* ── Save Button ─────────────────────────────────────────────── */}
            <TouchableOpacity
              style={[s.saveBtn, loading && s.saveBtnDisabled]}
              onPress={handleUpdate}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <IconCheck />
                  <Text style={s.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast message={toastMsg} />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },

  // Top Bar
  topbar:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAECF5', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F6FB', alignItems: 'center', justifyContent: 'center' },
  topbarTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },

  // Avatar
  avatarZone:     { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAECF5', alignItems: 'center', paddingVertical: 24, gap: 10 },
  avatarRing:     { width: 88, height: 88, borderRadius: 24, backgroundColor: '#EFF6FF', borderWidth: 2, borderColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
  avatarImage:    { width: '100%', height: '100%', borderRadius: 22 },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: '#1D4ED8', letterSpacing: -1 },
  camBadge:       { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 8, backgroundColor: '#2563EB', borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarHint:     { fontSize: 11.5, color: '#94A3B8', fontWeight: '500' },

  // Form
  formBody:   { padding: 16 },
  textInput:  { flex: 1, fontSize: 14.5, color: '#0F172A', fontWeight: '500', paddingVertical: 13 },
  textArea:   { height: 76, paddingTop: 13 },
  divider:    { height: 1, backgroundColor: '#F1F5F9', marginBottom: 16, marginTop: 2 },

  // Save Button
  saveBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1D4ED8', borderRadius: 14, paddingVertical: 15, marginTop: 10 },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText:     { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
});