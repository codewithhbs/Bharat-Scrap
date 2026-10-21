import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Rect, Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const loaderWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(loaderWidth, { toValue: 48, duration: 1600, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#0D3B8C', '#1356CC', '#1B6B2E']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Car Icon */}
          <View style={styles.iconWrap}>
            <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
              <Rect x="6" y="20" width="36" height="16" rx="5" fill="rgba(255,255,255,0.3)" />
              <Path d="M9 20 L16 10 H32 L39 20" fill="rgba(255,255,255,0.5)" />
              <Rect x="16" y="11" width="16" height="9" rx="2" fill="rgba(255,255,255,0.3)" />
              <Circle cx="14" cy="37" r="5" fill="white" />
              <Circle cx="14" cy="37" r="2.5" fill="rgba(33,118,255,0.5)" />
              <Circle cx="34" cy="37" r="5" fill="white" />
              <Circle cx="34" cy="37" r="2.5" fill="rgba(33,118,255,0.5)" />
              <Line x1="2" y1="26" x2="5" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <Line x1="1" y1="30" x2="4" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
            </Svg>
          </View>

          {/* Logo Text */}
          <View style={styles.logoRow}>
            <Text style={styles.logoWhite}>Bharat</Text>
            <Text style={styles.logoGreen}>Scrap</Text>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>Sell your car in minutes</Text>

          {/* Loader Bar */}
          <View style={styles.loaderTrack}>
            <Animated.View style={[styles.loaderBar, { width: loaderWidth }]} />
          </View>

          {/* Dots */}
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 4,
  },
  logoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  logoWhite: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  logoGreen: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6FD48A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  loaderTrack: {
    width: 48,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 40,
  },
  loaderBar: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 3,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    width: 22,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
});
