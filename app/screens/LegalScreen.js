import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

const APP_NAME = 'ABH Vehicle Scrap';
const EFFECTIVE_DATE = '23 October 2026';
const SUPPORT_WHATSAPP = '919355222165';

// ─── Content ──────────────────────────────────────────────────────────────────

const TERMS = [
  {
    h: '1. Acceptance of Terms',
    p: [
      `By downloading, installing or using the ${APP_NAME} mobile application ("App"), you agree to these Terms of Service. If you do not agree, please do not use the App.`,
    ],
  },
  {
    h: '2. Our Service',
    p: [
      `${APP_NAME} helps vehicle owners sell their old or end-of-life vehicles for scrapping. Through the App you can submit vehicle details, receive a price, schedule a pickup and track the pickup crew.`,
      'Prices shown in the App are estimates based on the information you provide. The final price is confirmed after physical inspection of the vehicle by our team.',
    ],
  },
  {
    h: '3. Eligibility & Account',
    p: [
      'You must be at least 18 years old and legally competent to enter into a contract to use the App.',
      'You log in using your mobile number and a one-time password (OTP). You are responsible for keeping access to your phone and account secure and for all activity under your account.',
    ],
  },
  {
    h: '4. Your Responsibilities as a Seller',
    p: [
      '• You confirm that you are the registered owner of the vehicle, or are legally authorised by the owner to sell it.',
      '• All details you submit (RC number, vehicle condition, photos, documents, address) must be true, accurate and complete.',
      '• The vehicle must not be stolen, under an undisclosed loan or hypothecation, or involved in any legal proceeding.',
      '• You will hand over the original documents required for scrapping and de-registration (such as the RC and ID proof) at the time of pickup.',
      '• Any pending challans, taxes or dues on the vehicle up to the date of handover remain your responsibility unless agreed otherwise in writing.',
    ],
  },
  {
    h: '5. Inspection, Pricing & Payment',
    p: [
      'Our crew will inspect the vehicle at pickup. If the actual condition differs from what was submitted, the offered price may be revised. You may accept or reject the revised price before the vehicle is taken.',
      'Payment is made to the UPI ID or bank account you provide in the App, as per the agreed price. Please make sure your payment details are correct; we are not responsible for delays caused by incorrect details.',
    ],
  },
  {
    h: '6. Pickup & Cancellation',
    p: [
      'Pickup is scheduled based on your selected location and crew availability. Timings are indicative and may change due to traffic, weather or other circumstances.',
      'You may cancel a request before the vehicle is picked up. Once the vehicle has been handed over and payment is made, the sale cannot be reversed.',
    ],
  },
  {
    h: '7. Crane / Pickup Partners',
    p: [
      'If you use the App as a crane or pickup partner, you agree to share your live location while you are on an active job (on the way to a pickup or to the garage), to follow the job flow in the App, and to treat customers and their vehicles with care.',
    ],
  },
  {
    h: '8. Prohibited Use',
    p: [
      'You must not misuse the App, submit false information, attempt to access other users’ data, interfere with the App’s security or operation, or use the App for any unlawful purpose.',
    ],
  },
  {
    h: '9. Limitation of Liability',
    p: [
      `The App is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, ${APP_NAME} is not liable for any indirect or consequential loss arising from the use of the App. Our total liability for any claim relating to a transaction is limited to the amount payable for that vehicle.`,
    ],
  },
  {
    h: '10. Suspension & Termination',
    p: [
      'We may suspend or terminate your access to the App if you breach these Terms or if we suspect fraud or misuse.',
    ],
  },
  {
    h: '11. Changes to these Terms',
    p: [
      'We may update these Terms from time to time. The updated version will be available in the App with a new effective date. Continued use of the App after changes means you accept the updated Terms.',
    ],
  },
  {
    h: '12. Governing Law',
    p: [
      'These Terms are governed by the laws of India. Courts at Delhi, India shall have exclusive jurisdiction over any dispute arising from these Terms or the use of the App.',
    ],
  },
  {
    h: '13. Contact Us',
    p: ['For any questions about these Terms, contact us on WhatsApp using the button below.'],
  },
];

const PRIVACY = [
  {
    h: '1. Introduction',
    p: [
      `This Privacy Policy explains how ${APP_NAME} ("we", "us") collects, uses and protects your information when you use our mobile application. By using the App, you agree to this policy.`,
    ],
  },
  {
    h: '2. Information We Collect',
    p: [
      '• Account details: your name, mobile number and, if provided, email address and profile photo.',
      '• Vehicle details: RC number, make, model, variant, fuel type, kilometres driven, condition details, vehicle photos and documents you upload.',
      '• Pickup details: your pickup address and the map location you select.',
      '• Payment details: UPI ID or bank account details you provide to receive payment.',
      '• Location (crane / pickup partners): precise live location, including in the background, only while an active job is in progress (on the way to a pickup or the garage). A notification is shown on Android while location is being shared.',
      '• Device information: push notification token and basic device information needed to deliver notifications.',
    ],
  },
  {
    h: '3. How We Use Your Information',
    p: [
      '• To create and manage your account and verify your mobile number via OTP.',
      '• To fetch vehicle details from your RC number, estimate a price and process your scrap request.',
      '• To schedule pickups, show routes and let customers and our team track the pickup crew in real time.',
      '• To make payments to you for your vehicle.',
      '• To send you updates, OTPs and booking notifications (in-app, push or WhatsApp).',
      '• To prevent fraud, resolve disputes and comply with legal and regulatory requirements related to vehicle scrapping.',
    ],
  },
  {
    h: '4. Location Data',
    p: [
      'Customers: we use your location only when you choose a pickup location in the App.',
      'Crane / pickup partners: live location is collected only while a job is active and is shared with our team and the customer of that job so they can track the pickup. Tracking stops automatically when the job reaches the inspection or garage stage. You can disable location permission at any time from your phone settings, but job tracking features will not work without it.',
    ],
  },
  {
    h: '5. Sharing of Information',
    p: [
      'We do not sell your personal information. We share it only as needed to run the service:',
      '• With our pickup crew and team members handling your request.',
      '• Between the customer and the assigned crane partner (name, phone number, pickup location and live location during the job).',
      '• With service providers that help us operate the App, such as cloud hosting and image storage, maps and routing services (Google Maps), push notification services (Firebase / Expo), messaging (WhatsApp) and vehicle registration lookup services.',
      '• With government authorities or when required by law, court order or for vehicle de-registration.',
    ],
  },
  {
    h: '6. Data Security',
    p: [
      'We use reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS) and secure token-based login. However, no method of transmission or storage is 100% secure.',
    ],
  },
  {
    h: '7. Data Retention',
    p: [
      'We keep your information for as long as your account is active and as required to complete transactions, maintain records of vehicle sale and scrapping, and comply with legal obligations. After that, it is deleted or anonymised.',
    ],
  },
  {
    h: '8. Your Rights & Choices',
    p: [
      '• You can view and update your profile details in the App.',
      '• You can turn off location and notification permissions from your phone settings.',
      '• You can request access to, correction of, or deletion of your personal data and account by contacting us. Some records may be retained where required by law.',
    ],
  },
  {
    h: '9. Children’s Privacy',
    p: ['The App is not intended for anyone under 18 years of age, and we do not knowingly collect data from children.'],
  },
  {
    h: '10. Changes to this Policy',
    p: [
      'We may update this Privacy Policy from time to time. The updated version will be available in the App with a new effective date.',
    ],
  },
  {
    h: '11. Contact Us',
    p: ['For privacy questions or data deletion requests, contact us on WhatsApp using the button below.'],
  },
];

// ─── UI ───────────────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={Colors.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function LegalScreen({ navigation, route }) {
  const type = route?.params?.type === 'privacy' ? 'privacy' : 'terms';
  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const sections = type === 'privacy' ? PRIVACY : TERMS;

  const contact = () =>
    Linking.openURL(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`Hi, I have a question about the ${APP_NAME} ${title}.`)}`
    );

  return (
    <View style={s.root}>
      <LinearGradient colors={[Colors.blue900, Colors.blue700]}>
        <SafeAreaView edges={['top']}>
          <View style={s.header}>
            <TouchableOpacity
              style={s.back}
              onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Login'))}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BackIcon />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{title}</Text>
              <Text style={s.sub}>Effective from {EFFECTIVE_DATE}</Text>
            </View>
          </View>

          <View style={s.tabs}>
            {[
              ['terms', 'Terms'],
              ['privacy', 'Privacy'],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[s.tab, type === key && s.tabActive]}
                onPress={() => navigation.setParams({ type: key })}
                activeOpacity={0.8}
              >
                <Text style={[s.tabText, type === key && s.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        {sections.map((sec) => (
          <View key={sec.h} style={s.section}>
            <Text style={s.h}>{sec.h}</Text>
            {sec.p.map((para, i) => (
              <Text key={i} style={[s.p, para.startsWith('•') && s.bullet]}>
                {para}
              </Text>
            ))}
          </View>
        ))}

        <TouchableOpacity style={s.contactBtn} onPress={contact} activeOpacity={0.85}>
          <Text style={s.contactText}>Contact us on WhatsApp</Text>
        </TouchableOpacity>

        <Text style={s.footer}>{APP_NAME} · Made with ❤️ in India</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.neutral50 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  back: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.white },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 14, padding: 4, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.white },
  tabText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  tabTextActive: { color: Colors.blue900 },
  body: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: '#EAECF5',
    padding: 16, marginBottom: 12,
  },
  h: { fontSize: 15, fontWeight: '800', color: Colors.neutral900, marginBottom: 8 },
  p: { fontSize: 13.5, lineHeight: 21, color: Colors.neutral600, marginBottom: 6 },
  bullet: { paddingLeft: 4 },
  contactBtn: {
    marginTop: 6, backgroundColor: Colors.whatsapp, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  contactText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 12, color: Colors.neutral400, marginTop: 18 },
});
