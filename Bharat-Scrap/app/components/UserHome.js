import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import Toast from './Toast';
import api from '../lib/api';
import { Colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';


// ─── Status Badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    pending:    { bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B', text: '#92400E', label: 'Pending' },
    approved:   { bg: Colors.blue50,   border: Colors.blue100,  dot: Colors.blue500,  text: Colors.blue900,  label: 'Approved' },
    sold:       { bg: '#F0FDF4', border: '#BBF7D0', dot: Colors.green500, text: Colors.green700, label: 'Sold' },
    processing: { bg: '#F5F3FF', border: '#DDD6FE', dot: '#7C3AED', text: '#4C1D95', label: 'Processing' },
    rejected:   { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444', text: '#991B1B', label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <View style={[b.wrap, { backgroundColor: s.bg, borderColor: s.border }]}>
      <View style={[b.dot, { backgroundColor: s.dot }]} />
      <Text style={[b.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}
const b = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  dot:  { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Icons ─────────────────────────────────────────────────────────────────────
function IconCar({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-4h10l2 4h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="7.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8} />
      <Circle cx="16.5" cy="17.5" r="2.5" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}
function IconShield({ color }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconBell({ color }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function IconChevron({ color = Colors.neutral300 }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────────
function StatChip({ value, label }) {
  return (
    <View style={sc.wrap}>
      <Text style={sc.val}>{value}</Text>
      <Text style={sc.lbl}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.13)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  val:  { fontSize: 18, fontWeight: '800', color: Colors.white },
  lbl:  { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginTop: 1 },
});

export default function UserHome() {
  const [toastMsg, setToastMsg]     = useState('');
  const [user, setUser]             = useState({});
  const [cars, setCars]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  const handleFetchUser = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.success) setUser(res.data.user || {});
      else showToast(res.data?.message || 'Failed to load user information');
    } catch (e) { showToast('Something went wrong. Please try again.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchCars = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.get('/api/car/car-details-for-me');
      if (res.data?.success) setCars(res.data.data.reverse() || []);
      else showToast(res.data?.message || 'Failed to load cars');
    } catch (e) { showToast('Something went wrong. Please try again.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { handleFetchUser(); fetchCars(); }, []);

  const recentCars = cars.slice(0, 3);
  const soldCount  = cars.filter(c => c.status === 'sold').length;
  const pendCount  = cars.filter(c => c.status === 'pending').length;

  const onRefresh = async () => {
  setRefreshing(true);
  await Promise.all([
    handleFetchUser(true),
    fetchCars(true),
  ]);
  setRefreshing(false);
};

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue500} />}
      >
        {/* ── Header ── */}
        <LinearGradient colors={[Colors.blue700, Colors.blue500]} style={s.header}>
          <View style={s.decor1} />
          <View style={s.decor2} />
          <SafeAreaView edges={['top']}>
            <View style={s.headerRow}>
              <View>
                <Text style={s.greet}>Welcome back 👋</Text>
                <Text style={s.uname}>{user?.name || 'User'}</Text>
              </View>
              {/* <TouchableOpacity style={s.bellWrap}>
                <IconBell color="rgba(255,255,255,0.85)" />
                <View style={s.bellDot} />
              </TouchableOpacity> */}
            </View>
            <View style={s.statsRow}>
              <StatChip value={cars.length} label="Listed" />
              <View style={{ width: 8 }} />
              <StatChip value={soldCount} label="Sold" />
              <View style={{ width: 8 }} />
              <StatChip value={pendCount} label="Pending" />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* ── Action Cards ── */}
          <View style={s.actionRow}>
            <TouchableOpacity
              style={[s.actionCard, s.actionBlue]}
              onPress={() => navigation.navigate('RCInput', { from: 'sellCar' })}
              activeOpacity={0.82}
            >
              <View style={[s.iconWrap, { backgroundColor: Colors.blue100, borderColor: '#93C5FD' }]}>
                <IconCar color={Colors.blue700} />
              </View>
              <Text style={[s.actionTitle, { color: Colors.blue900 }]}>Sell Car</Text>
              <Text style={[s.actionSub, { color: Colors.blue500 }]}>Get instant offer</Text>
              <View style={[s.arrowBtn, { backgroundColor: Colors.blue100 }]}>
                <IconChevron color={Colors.blue700} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.actionCard, s.actionGreen]}
              onPress={() => navigation.navigate('RCInput', { from: 'verifyRC' })}
              activeOpacity={0.82}
            >
              <View style={[s.iconWrap, { backgroundColor: Colors.green100, borderColor: '#86EFAC' }]}>
                <IconShield color={Colors.green700} />
              </View>
              <Text style={[s.actionTitle, { color: Colors.green700 }]}>Verify RC</Text>
              <Text style={[s.actionSub, { color: Colors.green500 }]}>Check vehicle info</Text>
              <View style={[s.arrowBtn, { backgroundColor: Colors.green100 }]}>
                <IconChevron color={Colors.green700} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Promo Banner ── */}
          <TouchableOpacity style={s.promo} activeOpacity={0.88}>
            <View style={s.promoInner}>
              <View style={{ flex: 1 }}>
                <Text style={s.promoTag}>★  LIMITED OFFER</Text>
                <Text style={s.promoTitle}>Free Inspection Today</Text>
                <Text style={s.promoSub}>RC verification at zero cost — expires tonight</Text>
              </View>
              <View style={s.promoRight}>
                <Text style={s.promoEmoji}>🚗</Text>
                <View style={s.promoCta}>
                  <Text style={s.promoCtaText}>Claim</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* ── Section Header ── */}
          <View style={s.secHead}>
            <Text style={s.secTitle}>Recent Activity</Text>
            {cars.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Car List ── */}
          {loading ? (
            <View style={s.loadRow}>
              <ActivityIndicator size="small" color={Colors.blue500} />
              <Text style={s.loadText}>Loading your cars…</Text>
            </View>
          ) : recentCars.length === 0 ? (
            <View style={s.emptyWrap}>
              <View style={s.emptyIconWrap}><IconCar color={Colors.neutral400} /></View>
              <Text style={s.emptyTitle}>No activity yet</Text>
              <Text style={s.emptyText}>List your first car and get an instant offer.</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('RCInput')}>
                <Text style={s.emptyBtnText}>+ List a Car</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.list}>
              {recentCars.map((item) => {
                const detail  = item.carDetail || {};
                const carName = `${detail.make || ''} ${detail.model || ''}`.trim() || 'Unknown Car';
                const year    = detail.manufacturingYear || '';
                const plate   = item.rcNumber || '—';
                const accentMap = {
                  approved: Colors.blue500, sold: Colors.green500,
                  pending: '#F59E0B', processing: '#7C3AED', rejected: '#EF4444',
                };
                const accent = accentMap[item.status] || Colors.blue500;
                return (
                  <TouchableOpacity
                    key={item._id}
                    style={s.card}
                    onPress={() => navigation.navigate('SoldCarDetails', {
                      carId: item._id,
                    })}
                    activeOpacity={0.75}
                  >
                    <View style={[s.cardAccent, { backgroundColor: accent }]} />
                    <View style={[s.cardIcon, { backgroundColor: accent + '14' }]}>
                      <IconCar color={accent} />
                    </View>
                    <View style={s.cardBody}>
                      <Text style={s.cardName} numberOfLines={1}>{carName} {year}</Text>
                      <Text style={s.cardMeta}>
                        {plate}{detail.kmDriven ? `  ·  ${Number(detail.kmDriven).toLocaleString()} km` : ''}
                      </Text>
                    </View>
                    <View style={s.cardRight}>
                      <Badge status={item.status} />
                      <View style={{ marginTop: 6 }}>
                        <IconChevron color={Colors.neutral300} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <Toast message={toastMsg} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { paddingBottom: 28, position: 'relative', overflow: 'hidden' },
  decor1: { position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)' },
  decor2: { position: 'absolute', top: 10, right: 30, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  greet: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 3, fontWeight: '500' },
  uname: { fontSize: 20, fontWeight: '800', color: Colors.white, letterSpacing: -0.4 },
  bellWrap: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: '#F97316', borderWidth: 1.5, borderColor: Colors.blue500 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20 },
  body: { paddingHorizontal: 14, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 13, marginTop: -14 },
  actionCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  actionBlue:  { backgroundColor: Colors.blue50,  borderColor: Colors.blue100 },
  actionGreen: { backgroundColor: Colors.green50, borderColor: Colors.green100 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 10 },
  actionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2, letterSpacing: -0.3 },
  actionSub:   { fontSize: 10, fontWeight: '500', marginBottom: 12 },
  arrowBtn:    { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  promo: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#FBBF24' },
  promoInner: { backgroundColor: '#FFFBEB', flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  promoTag:   { fontSize: 9, fontWeight: '700', color: '#92400E', letterSpacing: 1.2, marginBottom: 3 },
  promoTitle: { fontSize: 14, fontWeight: '800', color: Colors.neutral900, marginBottom: 2, letterSpacing: -0.3 },
  promoSub:   { fontSize: 10, color: Colors.neutral500, lineHeight: 15 },
  promoRight: { alignItems: 'center', gap: 7, flexShrink: 0 },
  promoEmoji: { fontSize: 26 },
  promoCta:   { backgroundColor: '#F59E0B', paddingHorizontal: 13, paddingVertical: 5, borderRadius: 20 },
  promoCtaText: { fontSize: 10, fontWeight: '800', color: Colors.white },
  secHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  secTitle: { fontSize: 14, fontWeight: '800', color: Colors.neutral900, letterSpacing: -0.2 },
  seeAll:   { fontSize: 11, fontWeight: '600', color: Colors.blue500 },
  loadRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 30, justifyContent: 'center' },
  loadText: { fontSize: 13, color: Colors.neutral500 },
  emptyWrap: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyIconWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.neutral100, borderWidth: 1, borderColor: Colors.neutral200, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle:   { fontSize: 14, fontWeight: '700', color: Colors.neutral900 },
  emptyText:    { fontSize: 12, color: Colors.neutral500, textAlign: 'center', lineHeight: 18 },
  emptyBtn:     { marginTop: 8, backgroundColor: Colors.blue50, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: Colors.blue100 },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: Colors.blue700 },
  list: { gap: 9 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 16, padding: 13, paddingLeft: 16, borderWidth: 1, borderColor: '#E8EAF2', position: 'relative', overflow: 'hidden' },
  cardAccent: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 0 },
  cardIcon:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardBody:   { flex: 1 },
  cardName:   { fontSize: 13, fontWeight: '700', color: Colors.neutral900, letterSpacing: -0.2, marginBottom: 3 },
  cardMeta:   { fontSize: 11, color: Colors.neutral400 },
  cardRight:  { alignItems: 'flex-end' },
});