// components/BookingRequestModal.js

import React, { useEffect, useState } from 'react';
import {
    Modal, View, Text, TouchableOpacity,
    StyleSheet, ActivityIndicator, Linking, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';
import api from '../lib/api';

// Haversine formula — do coordinates ke beech distance (km mein)
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

export default function BookingRequestModal({ visible, data = {}, onClose, onSuccess }) {
    const [distance, setDistance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionDone, setActionDone] = useState(false);

    const {
        carId,
        carName, carVariant, rcNumber, fuelType, color, kmDriven, price,
        sellerName, sellerPhone,
        pickupLat, pickupLng, pickupAddress,
        inseptionDate, paymentMethod,
    } = data;

    // CraneMan ki current location se pickup tak distance calculate karo
    useEffect(() => {
        if (!visible || !pickupLat || !pickupLng) return;

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;

                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                const dist = getDistanceKm(
                    loc.coords.latitude, loc.coords.longitude,
                    parseFloat(pickupLat), parseFloat(pickupLng),
                );
                setDistance(dist);
            } catch (e) {
                console.log('Distance fetch error:', e);
            }
        })();
    }, [visible, pickupLat, pickupLng]);

    // Modal close hone par reset karo
    useEffect(() => {
        if (!visible) {
            setActionDone(false);
            setDistance(null);
        }
    }, [visible]);

    const handleAction = async (action) => {
        // action: 'accepted' | 'rejected'
        setLoading(true);
        try {
            await api.put(`/api/car/update-assigned-to-crane-man-status/${carId}`, { status: action });
            setActionDone(true);
            onSuccess?.(); // Parent component ko refresh karne ke liye callback
        } catch (e) {
            console.log('Action error:', e);
            alert("Failed to update booking status.")
        } finally {
            setLoading(false);
        }
    };

    const openMaps = () => {
        if (!pickupLat || !pickupLng) return;
        const url = Platform.select({
            ios: `maps://?daddr=${pickupLat},${pickupLng}`,
            android: `geo:${pickupLat},${pickupLng}?q=${pickupLat},${pickupLng}(Pickup)`,
        });
        Linking.openURL(url).catch(() =>
            Linking.openURL(`https://maps.google.com/?q=${pickupLat},${pickupLng}`)
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>🚗</Text>
                        <Text style={styles.headerTitle}>New Booking!</Text>
                    </View>

                    {/* Car Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>🚗 Car Details</Text>
                        <Row label="Name" value={carName || '—'} />
                        <Row label="Variant" value={carVariant || '—'} />
                        <Row label="RC Number" value={rcNumber || '—'} />
                        <Row label="Fuel" value={fuelType || '—'} />
                        <Row label="Color" value={color || '—'} />
                        <Row label="KM Driven" value={kmDriven ? `${Number(kmDriven).toLocaleString('en-IN')} km` : '—'} />
                        <Row label="Price" value={price ? `₹${Number(price).toLocaleString('en-IN')}` : '—'} />
                    </View>

                    <View style={styles.divider} />

                    {/* Location Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>👤 Seller</Text>
                        <Row label="Name" value={sellerName || '—'} />
                        {sellerPhone ? (
                            <Row
                                label="Phone"
                                value={sellerPhone}
                                onPress={() => Linking.openURL(`tel:${sellerPhone}`)}
                                valueStyle={styles.link}
                            />
                        ) : null}
                        {/* {paymentMethod ? (
                            <Row label="Payment" value={paymentMethod.toUpperCase()} />
                        ) : null}
                        {inseptionDate ? (
                            <Row label="Date" value={new Date(inseptionDate).toLocaleDateString('hi-IN')} />
                        ) : null} */}
                    </View>

                    <View style={styles.divider} />

                    {/* 📍 Pickup Location Section — ADD KARO YE BLOCK */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>📍 Pickup Location</Text>
                        <Text style={styles.address}>{pickupAddress || 'Address not found'}</Text>

                        <View style={styles.locationRow}>
                            {/* <View style={styles.distanceBadge}>
                                <Text style={styles.distanceText}>
                                    {distance ? `📏 ${distance} km away` : '📏 Calculating distance...'}
                                </Text>
                            </View> */}
                            <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
                                <Text style={styles.mapsBtnText}>Open Map →</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Buttons ya Success message */}
                    {actionDone ? (
                        <View style={styles.doneBanner}>
                            <Text style={styles.doneText}>✅ Successfully Done</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    ) : loading ? (
                        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 16 }} />
                    ) : (
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.btn, styles.rejectBtn]}
                                onPress={() => handleAction('rejected')}
                            >
                                <Text style={styles.btnText}>✗ Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.acceptBtn]}
                                onPress={() => handleAction('accepted')}
                            >
                                <Text style={styles.btnText}>✓ Accept</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                </View>
            </View>
        </Modal>
    );
}

// ─── Helper component ───
function Row({ label, value, onPress, valueStyle }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <TouchableOpacity onPress={onPress} disabled={!onPress}>
                <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
            </TouchableOpacity>
        </View>
    );
}

// ─── Styles ───
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    headerIcon: { fontSize: 28 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
    section: { marginBottom: 4 },
    sectionLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    rowLabel: { fontSize: 14, color: '#666', flex: 1 },
    rowValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', textAlign: 'right', flex: 1 },
    link: { color: '#2563EB', textDecorationLine: 'underline' },
    address: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 10 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    distanceBadge: {
        flex: 1,
        backgroundColor: '#FFF7ED',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    distanceText: { fontSize: 13, color: '#EA580C', fontWeight: '600' },
    mapsBtn: {
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    mapsBtnText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    btn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    acceptBtn: { backgroundColor: '#16A34A' },
    rejectBtn: { backgroundColor: '#DC2626' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    doneBanner: { alignItems: 'center', gap: 12, marginTop: 8 },
    doneText: { fontSize: 16, fontWeight: '600', color: '#16A34A' },
    closeBtn: {
        backgroundColor: '#f3f4f6',
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 10,
    },
    closeBtnText: { fontSize: 14, color: '#374151', fontWeight: '600' },
});