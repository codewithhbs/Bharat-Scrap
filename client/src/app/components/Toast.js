import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

// ─── Icons ───────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#22c55e" />
      <Path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ErrorIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#ef4444" />
      <Path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function InfoIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill="#3b82f6" />
      <Path d="M12 8v4M12 16h.01" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  success: {
    icon: <SuccessIcon />,
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    textColor: '#15803d',
  },
  error: {
    icon: <ErrorIcon />,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    textColor: '#b91c1c',
  },
  info: {
    icon: <InfoIcon />,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    textColor: '#1d4ed8',
  },
};

// ─── Toast Component ──────────────────────────────────────────────────────────
/**
 * Usage:
 *   <Toast message={toastMsg} type="success" />
 *   <Toast message={toastMsg} type="error" />
 *   <Toast message={toastMsg} type="info" />
 *   <Toast message={toastMsg} />   ← default: info
 *
 * Show karne ke liye:
 *   setToastMsg('Your message here');
 *   setTimeout(() => setToastMsg(''), 2500);
 */
export default function Toast({ message, type = 'info' }) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.92)).current;

  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    if (message) {
      // Slide up + fade in + scale up
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(scale,      { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    } else {
      // Slide down + fade out
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 250, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 200, useNativeDriver: true }),
        Animated.timing(scale,      { toValue: 0.92,duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          backgroundColor: cfg.backgroundColor,
          borderColor: cfg.borderColor,
        },
      ]}
    >
      <View style={styles.iconWrap}>{cfg.icon}</View>
      <Text style={[styles.message, { color: cfg.textColor }]} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 9999,
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});