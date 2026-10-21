import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path, Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLOSURE_KEY = '@bg_location_disclosure_shown_v1';

const C = {
  blue: '#1356CC', blueDark: '#0D3B8C', white: '#FFFFFF',
  text: '#111827', textSub: '#6B7280', border: '#E4E8F0',
  bg: '#F4F6FB', green: '#16A34A', greenDim: 'rgba(22,163,74,0.08)',
};

export default function LocationDisclosureScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    try { await AsyncStorage.setItem(DISCLOSURE_KEY, 'true'); } catch {}
    navigation.replace('MainTabs');
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      // 1) Pehle foreground location
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== 'granted') {
        await finish();
        return;
      }
      // 2) Phir background ("Allow all the time") — Android 11+ settings me le jayega
      if (Platform.OS === 'android') {
        await Location.requestBackgroundPermissionsAsync();
      }
      await finish();
    } catch {
      await finish();
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    // Disclosure dikha diya gaya — bina permission ke bhi app chalega, tracking off rahegi
    await finish();
  };

  const Bullet = ({ children }) => (
    <View style={s.bulletRow}>
      <View style={s.bulletDot} />
      <Text style={s.bulletText}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.iconCircle}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={C.blue} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="12" cy="10" r="3" stroke={C.blue} strokeWidth={1.8} />
          </Svg>
        </View>

        <Text style={s.title}>Location Permission</Text>

        <Text style={s.intro}>
          <Text style={{ fontWeight: '800' }}>BharatScrap</Text> collects your location data to enable
          live pickup tracking, <Text style={{ fontWeight: '800' }}>even when the app is closed or not in use</Text>.
        </Text>

        <View style={s.card}>
          <Bullet>
            Ye tracking sirf tab chalti hai jab aap ek vehicle pickup job accept karke
            "Start Journey" tap karte hain.
          </Bullet>
          <Bullet>
            Aapki live location BharatScrap team aur customer ko bheji jaati hai taaki
            crane pickup ka real-time status mil sake.
          </Bullet>
          <Bullet>
            Tracking ke dauraan ek permanent notification dikhti hai, aur aap kabhi bhi
            "Stop" daba kar ise band kar sakte hain.
          </Bullet>
          <Bullet>
            Location data sirf pickup/delivery ke liye use hota hai — kisi advertising ya
            third-party ko bechi nahi jaati.
          </Bullet>
        </View>

        <Text style={s.note}>
          Aage "Allow" dabane par system aapse "Allow all the time" location access maangega,
          jo background pickup tracking ke liye zaroori hai.
        </Text>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleAllow}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>
            {loading ? 'Please wait…' : 'Allow Location Access'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnGhost} onPress={handleDeny} disabled={loading} activeOpacity={0.7}>
          <Text style={s.btnGhostText}>Not Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },
  scroll: { padding: 24, paddingBottom: 12, alignItems: 'center' },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(19,86,204,0.08)',
    alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '900', color: C.text, marginBottom: 12, textAlign: 'center' },
  intro: { fontSize: 14, color: C.textSub, lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  card: {
    width: '100%', backgroundColor: C.bg, borderRadius: 16, borderWidth: 1,
    borderColor: C.border, padding: 16, gap: 12, marginBottom: 16,
  },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.blue, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 13, color: C.text, lineHeight: 19 },
  note: { fontSize: 12, color: C.textSub, lineHeight: 18, textAlign: 'center', paddingHorizontal: 6 },
  footer: { padding: 20, gap: 10, borderTopWidth: 1, borderTopColor: C.border },
  btnPrimary: {
    backgroundColor: C.blue, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPrimaryText: { color: C.white, fontSize: 15, fontWeight: '700' },
  btnGhost: { paddingVertical: 12, alignItems: 'center' },
  btnGhostText: { color: C.textSub, fontSize: 14, fontWeight: '600' },
});