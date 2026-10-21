import React, { useState, useEffect, useCallback } from 'react';
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
import { Svg, Path, Rect, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import Toast from '../components/Toast';
import api from '../lib/api';

function Badge({ status }) {
  const map = {
    pending:    { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
    approved:   { bg: Colors.blue100, color: Colors.blue900, label: 'Approved' },
    sold:       { bg: Colors.green100, color: Colors.green700, label: 'Sold' },
    processing: { bg: '#EDE9FE', color: '#5B21B6', label: 'Processing' },
    rejected:   { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function CarIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="3" width="15" height="13" rx="2" stroke={Colors.blue500} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 8h4l3 5v3h-7V8z" stroke={Colors.blue500} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="5.5" cy="18.5" r="2.5" stroke={Colors.blue500} strokeWidth={1.8} />
      <Circle cx="18.5" cy="18.5" r="2.5" stroke={Colors.blue500} strokeWidth={1.8} />
    </Svg>
  );
}

const filters = [
  { label: 'All',        value: 'all' },
  { label: 'Pending',    value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Sold',       value: 'sold' },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return 'Abhi abhi';
  if (diff < 3600)    return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)} hour ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} day ago`;
  return `${Math.floor(diff / 2592000)} month ago`;
}

export default function HistoryScreen({ navigation }) {
  const [cars, setCars]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [toastMsg, setToastMsg]         = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const fetchCars = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/api/car/car-details-for-me');
      if (res.data?.success) {
        setCars(res.data.data.reverse() || []);
      } else {
        showToast(res.data?.message || 'Data load nahi hua');
      }
    } catch (error) {
      console.log('History Fetch Error:', error.response?.data || error.message);
      showToast('Kuch galat hua. Dobara try karein.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const filtered = activeFilter === 'all'
    ? cars
    : cars.filter((c) => c.status === activeFilter);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My History</Text>
          {cars.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{cars.length}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* ── Filter Chips — FIX: inner View hataya, contentContainerStyle use kiya ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersWrap}
        contentContainerStyle={styles.filtersContent}  // ← CHANGED
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, activeFilter === f.value && styles.chipActive]}
            onPress={() => setActiveFilter(f.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.blue500} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchCars(true)}
              tintColor={Colors.blue500}
            />
          }
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={Colors.neutral400} strokeWidth={1.2} strokeLinecap="round" />
                <Path d="M12 8v4M12 16h.01" stroke={Colors.neutral400} strokeWidth={1.5} strokeLinecap="round" />
              </Svg>
              <Text style={styles.emptyTitle}>No history found</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => {
                const detail  = item.carDetail || {};
                const carName = `${detail.make || ''} ${detail.model || ''}`.trim() || 'Unknown Car';
                const year    = detail.manufacturingYear || '';
                const plate   = item.rcNumber || detail.rcNumber || '—';
                const km      = item.kmDriven
                  ? Number(item.kmDriven).toLocaleString('en-IN') + ' km'
                  : '—';

                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.historyItem}
                    onPress={() => navigation.navigate('SoldCarDetails', { carId: item._id })}
                    activeOpacity={0.75}
                  >
                    <View style={styles.itemTop}>
                      <View style={styles.carIcon}>
                        <CarIcon />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{carName} {year}</Text>
                        <Text style={styles.itemMeta}>{plate} · {km}</Text>
                      </View>
                      <Badge status={item.status} />
                    </View>

                    <View style={styles.itemBottom}>
                      <Text style={styles.itemFuel}>
                        {detail.fuelType || '—'} · {detail.bodyType || '—'}
                      </Text>
                      <Text style={styles.itemDate}>{timeAgo(item.createdAt)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <Toast message={toastMsg} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.neutral900 },
  countBadge: {
    backgroundColor: Colors.blue500,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  // ── FIX: flexGrow hataya, height fixed ki ──
  filtersWrap: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral100,
    maxHeight: 56,          // ← collapse nahi hoga
  },
  filtersContent: {         // ← contentContainerStyle
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    height: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    backgroundColor: Colors.white,
  },
  chipActive:     { backgroundColor: Colors.blue50, borderColor: Colors.blue500 },
  chipText:       { fontSize: 13, fontWeight: '500', color: Colors.neutral600 },
  chipTextActive: { color: Colors.blue700, fontWeight: '600' },

  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  loadingText: { fontSize: 14, color: Colors.neutral500 },
  scroll:      { paddingBottom: 20 },
  emptyState:  { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle:  { fontSize: 14, fontWeight: '500', color: Colors.neutral400 },
  list:        { padding: 20, gap: 12 },

  historyItem: {
    gap: 10,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  itemTop:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  carIcon:  {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.blue50,
    alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: Colors.neutral900 },
  itemMeta: { fontSize: 12, color: Colors.neutral500, marginTop: 2 },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral100,
  },
  itemFuel: { fontSize: 13, fontWeight: '500', color: Colors.blue700 },
  itemDate: { fontSize: 11, color: Colors.neutral400 },
  badge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
});