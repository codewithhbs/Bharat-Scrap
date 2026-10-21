import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Line, Polyline } from 'react-native-svg';
import { Colors } from '../constants/colors';
import Toast from '../components/Toast';
import { clearTokens } from '../lib/api';
import api from '../lib/api';

// ─── Icons ─────────────────────────────────────────────────────────────────────
function IconChevron() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={Colors.neutral300} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconEdit() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={Colors.blue500} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={Colors.blue500} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconBell({ color = Colors.blue500 }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconKyc() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke={Colors.green500} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconHelp() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#25D366" strokeWidth={1.9} />
      <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="#25D366" strokeWidth={1.9} strokeLinecap="round" />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke="#25D366" strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
function IconLogout() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={Colors.error} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="16,17 21,12 16,7" stroke={Colors.error} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="21" y1="12" x2="9" y2="12" stroke={Colors.error} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}
function IconCar({ color = Colors.blue500 }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="7.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.9} />
      <Circle cx="16.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.9} />
    </Svg>
  );
}
function IconPin() {
  return (
    <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
      <Circle cx="12" cy="10" r="3" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
    </Svg>
  );
}

// ─── Avatar Initials ───────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : '?';
  return (
    <View style={av.wrap}>
      <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={av.grad}>
        <Text style={av.text}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

// ─── Profile Image Component (New) ─────────────────────────────────────────────
// ─── Profile Image Component (Improved) ─────────────────────────────────────
function ProfileImage({ user }) {
  const imageUrl = user?.userImage?.img;

  if (imageUrl) {
    return (
      <View style={av.wrap}>
        <Image
          source={{
            uri: imageUrl,
            cache: 'force-cache'   // Important for better caching
          }}
          style={av.image}
          resizeMode="cover"
          onError={(e) => {
            console.log('Image load error:', e.nativeEvent.error);
            // Optionally show fallback here
          }}
        // onLoad={() => console.log('Image loaded successfully from:', imageUrl)}
        />
      </View>
    );
  }

  // Fallback to Initials Avatar
  const name = user?.name || 'User';
  const initials = name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  return (
    <View style={av.wrap}>
      <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={av.grad}>
        <Text style={av.text}>{initials}</Text>
      </LinearGradient>
    </View>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ num, label, color, bg, border }) {
  return (
    <View style={[st.card, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[st.num, { color }]}>{num}</Text>
      <Text style={st.lbl}>{label}</Text>
    </View>
  );
}
const st = StyleSheet.create({
  card: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
  num: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  lbl: { fontSize: 10, color: Colors.neutral500, marginTop: 3, fontWeight: '500', textAlign: 'center' },
});

// ─── Menu Row ──────────────────────────────────────────────────────────────────
function MenuRow({ icon, iconBg, label, sub, right, onPress, isLast, danger }) {
  return (
    <TouchableOpacity
      style={[mr.row, !isLast && mr.divider]}
      onPress={onPress}
      activeOpacity={onPress ? 0.72 : 1}
    >
      <View style={[mr.iconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={mr.text}>
        <Text style={[mr.label, danger && { color: Colors.error }]}>{label}</Text>
        {sub ? <Text style={mr.sub}>{sub}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}
const mr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 16, paddingVertical: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#F1F3F9' },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  text: { flex: 1 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.neutral800 },
  sub: { fontSize: 11, color: Colors.neutral400, marginTop: 1 },
});

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ children, style }) {
  return <View style={[sc2.wrap, style]}>{children}</View>;
}
const sc2 = StyleSheet.create({
  wrap: { backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: '#EAECF5', overflow: 'hidden' },
});

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [user, setUser] = useState({});
  const [cars, setCars] = useState([]);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  // ── Fetch user & cars dynamically ──────────────────────────────────────────
  const fetchData = async () => {
    try {
      const [userRes, carsRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/car/car-details-for-me'),
      ]);

      if (userRes.data?.user) setUser(userRes.data.user);
      if (carsRes.data?.success) setCars(carsRes.data.data || []);
    } catch (e) {
      console.log('Profile fetch error:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();   // 👈 same API hit hogi
    setRefreshing(false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalListed = cars.length;
  const soldCount = cars.filter(c => c.status === 'sold').length;
  const pendCount = cars.filter(c => c.status === 'pending').length;

  // ── Profile Verification (dynamic from user.isPhoneVerified) ───────────────
  const isPhoneVerified = !!user?.isPhoneVerified;

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoadingLogout(true);
            try {
              await clearTokens();
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (e) {
              showToast('Something went wrong while logging out');
            } finally {
              setLoadingLogout(false);
            }
          },
        },
      ]
    );
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919355222165?text=Hi%2C%20I%20need%20help%20with%20BharatScrap');
  };

  // ── User display info ──────────────────────────────────────────────────────
  const displayName = user?.name || 'User';
  const displayPhone = user?.phone || user?.mobile || '';
  const displayCity = user?.city || 'India';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : null;

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.blue500}
          />
        }
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <LinearGradient colors={[Colors.blue700, Colors.blue500]} style={s.header}>
          <View style={s.decorCircle1} />
          <View style={s.decorCircle2} />
          <SafeAreaView edges={['top']}>
            <View style={s.headerInner}>
              {/* Changed here: ProfileImage instead of Avatar */}
              <ProfileImage user={user} />

              <Text style={s.name}>{displayName}</Text>
              {displayPhone ? <Text style={s.phone}>{displayPhone}</Text> : null}

              <View style={s.pillRow}>
                <View style={s.pill}>
                  <IconPin />
                  <Text style={s.pillText}>{displayCity}</Text>
                </View>
                {memberSince && (
                  <View style={s.pill}>
                    <Text style={s.pillText}>Since {memberSince}</Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View style={s.body}>

          {/* ── Stats ──────────────────────────────────────────────────────── */}
          <View style={s.statsRow}>
            <StatCard num={String(totalListed)} label="Cars Listed" color={Colors.blue700} bg={Colors.blue50} border={Colors.blue100} />
            <StatCard num={String(soldCount)} label="Cars Sold" color={Colors.green700} bg={Colors.green50} border={Colors.green100} />
            <StatCard num={String(pendCount)} label="Pending" color="#92400E" bg="#FFFBEB" border="#FDE68A" />
          </View>

          {/* ── Account Section ─────────────────────────────────────────────── */}
          <View style={s.sectionWrap}>
            <Text style={s.sectionLabel}>ACCOUNT</Text>
            <SectionCard>
              <MenuRow
                icon={<IconEdit />}
                iconBg={Colors.blue50}
                label="Edit Profile"
                sub="Update your name, phone & city"
                onPress={() => navigation.navigate('ProfileUpdate')}
                right={<IconChevron />}
              />
              {/* <MenuRow
                icon={<IconBell color={notifications ? Colors.blue500 : Colors.neutral400} />}
                iconBg={notifications ? Colors.blue50 : Colors.neutral100}
                label="Notifications"
                sub={notifications ? 'Alerts are enabled' : 'Alerts are disabled'}
                right={
                  <Switch
                    value={notifications}
                    onValueChange={setNotifications}
                    trackColor={{ false: Colors.neutral200, true: Colors.blue100 }}
                    thumbColor={notifications ? Colors.blue500 : Colors.neutral400}
                  />
                }
                isLast
              /> */}
            </SectionCard>
          </View>

          {/* ── Profile Verification Section (dynamic - isPhoneVerified) ──────── */}
          <View style={s.sectionWrap}>
            <Text style={s.sectionLabel}>VERIFICATION</Text>
            <SectionCard>
              <MenuRow
                icon={<IconKyc />}
                iconBg={isPhoneVerified ? Colors.green50 : '#FFFBEB'}
                label="Profile Verification"
                sub={isPhoneVerified ? 'Phone number verified ✓' : 'Verify your phone number'}
                onPress={() => showToast(`${isPhoneVerified ? 'Your phone number is already verified.' : 'To verify, please go to Edit Profile and update your phone number.'}`)}
                right={
                  isPhoneVerified ? (
                    <View style={[s.badge, { backgroundColor: Colors.green50, borderColor: Colors.green100 }]}>
                      <View style={[s.badgeDot, { backgroundColor: Colors.green500 }]} />
                      <Text style={[s.badgeText, { color: Colors.green700 }]}>Verified</Text>
                    </View>
                  ) : (
                    <View style={[s.badge, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                      <View style={[s.badgeDot, { backgroundColor: '#F59E0B' }]} />
                      <Text style={[s.badgeText, { color: '#92400E' }]}>Pending</Text>
                    </View>
                  )
                }
                isLast
              />
            </SectionCard>
          </View>

          {/* ── Activity Section ─────────────────────────────────────────────── */}
          <View style={s.sectionWrap}>
            <Text style={s.sectionLabel}>ACTIVITY</Text>
            <SectionCard>
              <MenuRow
                icon={<IconCar color={Colors.blue500} />}
                iconBg={Colors.blue50}
                label="History & Activity"
                sub={`${totalListed} car${totalListed !== 1 ? 's' : ''}`}
                onPress={() => navigation.navigate('History')}
                right={<IconChevron />}
                isLast
              />
            </SectionCard>
          </View>

          {/* ── Support & Logout ─────────────────────────────────────────────── */}
          <View style={s.sectionWrap}>
            <Text style={s.sectionLabel}>MORE</Text>
            <SectionCard>
              <MenuRow
                icon={<IconHelp />}
                iconBg="#F0FDF4"
                label="Help & Support"
                sub="Chat with us on WhatsApp"
                onPress={handleWhatsApp}
                right={<IconChevron />}
              />
              <MenuRow
                icon={<IconLogout />}
                iconBg="#FEF2F2"
                label={loadingLogout ? 'Logging out…' : 'Logout'}
                sub="Sign out of your account"
                onPress={!loadingLogout ? handleLogout : undefined}
                right={null}
                danger
                isLast
              />
            </SectionCard>
          </View>

          <Text style={s.version}>Bharat Scrap v1.0.0 · Made with ❤️ in India</Text>
        </View>
      </ScrollView>

      <Toast message={toastMsg} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },

  // Header
  header: { paddingBottom: 32, position: 'relative', overflow: 'hidden' },
  decorCircle1: { position: 'absolute', top: -60, right: -60, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)' },
  decorCircle2: { position: 'absolute', top: 20, right: 30, width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerInner: { alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  name: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4, marginTop: 4 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  // Body
  body: { padding: 16, gap: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },

  // Sections
  sectionWrap: { marginTop: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.neutral400, letterSpacing: 1, marginBottom: 8, paddingHorizontal: 2 },

  // Badge
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  version: { fontSize: 11, color: Colors.neutral400, textAlign: 'center', marginTop: 20 },
});

const av = StyleSheet.create({
  wrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: '#f0f0f0'   // Fallback background
  },
  image: {
    width: '100%',
    height: '100%',
  },
  grad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.blue700,
    letterSpacing: -0.5
  },
});