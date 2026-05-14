import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, Line, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';
import Toast from '../components/Toast.js';
import { saveTokens } from '../lib/api.js';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL; // 🔁 apna base URL yahan daalo

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const otpRefs = useRef([]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const validatePhone = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const sendOTP = async () => {
    if (!validatePhone()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        showToast('OTP sent to +91 ' + phone);
      } else {
        showToast(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      showToast('Network error. Please try again.');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.some((v) => !v)) {
      showToast('Please enter complete OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.join('') }),
      });
      const data = await res.json();
      if (data.success) {
        // ✅ Tokens securely save kar rahe hain
        if (data.accessToken && data.refreshToken) {
          await saveTokens(data.accessToken, data.refreshToken);
          showToast('Login successful!');

          // Navigate to main screen (replace kar rahe hain taaki back na ja sake)
          navigation.replace('MainTabs');
        } else {
          showToast('Login failed: Tokens not received');
        }
      } else {
        showToast(data.message || 'Invalid OTP');
      }
    } catch (err) {
      showToast('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (val, idx) => {
    const cleaned = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[idx] = cleaned;
    setOtp(newOtp);
    if (cleaned && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOTPKeyPress = (key, idx) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const resendOTP = async () => {
    setOtp(['', '', '', '', '', '']);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      showToast(data.success ? 'OTP resent!' : data.message || 'Failed to resend OTP');
    } catch (err) {
      showToast('Network error. Please try again.');
    }
    otpRefs.current[0]?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <LinearGradient colors={['#0D3B8C', '#1356CC']} style={styles.hero}>
            <View style={styles.logoRow}>
              <Text style={styles.logoWhite}>Bharat</Text>
              <Text style={styles.logoGreen}>Scrap</Text>
            </View>
            <Text style={styles.subtitle}>Enter your number to start selling your vehicle</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* Phone Field */}
            <View style={styles.field}>
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Svg width={16} height={11} viewBox="0 0 16 11">
                    <Rect width="16" height="11" fill="#FF9933" />
                    <Rect y="3.67" width="16" height="3.67" fill="white" />
                    <Rect y="7.33" width="16" height="3.67" fill="#138808" />
                    <Circle cx="8" cy="5.5" r="1.5" stroke="#000080" strokeWidth=".8" fill="none" />
                  </Svg>
                  <Text style={styles.ccText}>+91</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput, phoneError ? styles.inputError : null]}
                  placeholder="Enter mobile number"
                  placeholderTextColor={Colors.neutral400}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => { setPhone(t); setPhoneError(''); }}
                />
              </View>
              {!!phoneError && (
                <View style={styles.errorBox}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke={Colors.error} strokeWidth={2} />
                    <Line x1="12" y1="8" x2="12" y2="12" stroke={Colors.error} strokeWidth={2} strokeLinecap="round" />
                    <Line x1="12" y1="16" x2="12.01" y2="16" stroke={Colors.error} strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              )}
            </View>

            {/* Send OTP / Resend Button */}
            {!otpSent ? (
              <TouchableOpacity style={styles.btnPrimary} onPress={sendOTP} disabled={loading} activeOpacity={0.85}>
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.btnPrimaryText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                {/* <TouchableOpacity style={styles.btnGhost} onPress={resendOTP} activeOpacity={0.75}>
                <Text style={styles.btnGhostText}>Resend OTP</Text>
              </TouchableOpacity> */}
              </>
            )}

            {/* OTP Section */}
            {otpSent && (
              <View style={styles.otpSection}>
                <View style={styles.field}>
                  <Text style={styles.label}>Enter OTP</Text>
                  <Text style={styles.otpHint}>
                    Sent to <Text style={{ fontWeight: '700' }}>+91 {phone}</Text>
                  </Text>
                  <View style={styles.otpGrid}>
                    {otp.map((val, idx) => (
                      <TextInput
                        key={idx}
                        ref={(r) => (otpRefs.current[idx] = r)}
                        style={[styles.otpBox, val ? styles.otpBoxFilled : null]}
                        keyboardType="numeric"
                        maxLength={1}
                        value={val}
                        onChangeText={(t) => handleOTPChange(t, idx)}
                        onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, idx)}
                        textAlign="center"
                        selectTextOnFocus
                      />
                    ))}
                  </View>
                </View>
                <View style={styles.resendRow}>
                  <Text style={styles.resendText}>Didn't receive? </Text>
                  <TouchableOpacity onPress={resendOTP}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnPrimary} onPress={verifyOTP} disabled={loading} activeOpacity={0.85}>
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
        <Toast message={toastMsg} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  hero: {
    paddingTop: 52,
    paddingBottom: 36,
    paddingHorizontal: 28,
    gap: 8,
  },
  logoRow: { flexDirection: 'row' },
  logoWhite: { fontSize: 26, fontWeight: '800', color: Colors.white },
  logoGreen: { fontSize: 26, fontWeight: '800', color: '#6FD48A' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: '400' },
  body: { padding: 20, gap: 16 },
  field: { gap: 7 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.neutral700 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  countryCode: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    width: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ccText: { fontSize: 15, fontWeight: '600', color: Colors.neutral700 },
  input: {
    backgroundColor: Colors.neutral50,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.neutral900,
  },
  phoneInput: { flex: 1 },
  inputError: { borderColor: Colors.error },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    borderRadius: 8,
    padding: 10,
  },
  errorText: { fontSize: 13, color: Colors.error, fontWeight: '500', flex: 1 },
  btnPrimary: {
    backgroundColor: Colors.blue500,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  btnPrimaryText: { color: Colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
  btnGhost: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.blue300,
  },
  btnGhostText: { color: Colors.blue500, fontSize: 15, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.neutral300,
  },
  btnSecondaryText: { color: Colors.neutral700, fontSize: 15, fontWeight: '600' },
  otpSection: { gap: 14 },
  otpHint: { fontSize: 13, color: Colors.neutral500, textAlign: 'center' },
  otpGrid: { flexDirection: 'row', gap: 8 },
  otpBox: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.neutral200,
    borderRadius: 8,
    backgroundColor: Colors.neutral50,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral900,
    textAlign: 'center',
  },
  otpBoxFilled: { borderColor: Colors.blue500, backgroundColor: Colors.blue50 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  resendText: { fontSize: 13, color: Colors.neutral500 },
  resendLink: { fontSize: 13, color: Colors.blue500, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.neutral200 },
  dividerText: { fontSize: 13, color: Colors.neutral400 },
  terms: { fontSize: 13, color: Colors.neutral500, textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },
  termsLink: { color: Colors.blue500, fontWeight: '500' },
});