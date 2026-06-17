import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Svg, Path, Circle, Polyline } from 'react-native-svg';

import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen.js';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen.js';
import ProfileScreen from './screens/ProfileScreen';
import RCInputScreen from './screens/RCInputScreen';
import CarDetailsScreen from './screens/CarDetailsScreen';
import ConditionFormScreen from './screens/ConditionFormScreen';
import PriceResultScreen from './screens/PriceResultScreen';
import SuccessScreen from './screens/SuccessScreen.js';
import ProfileUpdateScreen from './screens/ProfileUpdateScreen.js';
import SoldCarDetailScreen from './screens/SoldCarDetailScreen.js';
import * as Notifications from 'expo-notifications';

import { Colors } from './constants/colors';
import { isLoggedIn } from './lib/api.js';

// ✅ Alag file se import — circular dependency khatam
import { navigationRef } from './lib/navigationRef';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('🚨 handleNotification called:', notification); // pehle confirm karo yeh hit ho raha hai
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

function HomeIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="9,22 9,12 15,12 15,22" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function HistoryIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Polyline points="12,6 12,12 16,14" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIcon({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1.5,
          borderTopColor: Colors.neutral100,
          height: 66,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: Colors.blue500,
        tabBarInactiveTintColor: Colors.neutral400,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} /> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History', tabBarIcon: ({ color }) => <HistoryIcon color={color} size={22} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <ProfileIcon color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

function AuthLoadingScreen({ navigation }) {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          navigation.replace('MainTabs');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.log('Auth check error:', error);
        navigation.replace('Login');
      }
    };
    checkAuth();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
      <ActivityIndicator size="large" color={Colors.blue500} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {/* ✅ navigationRef ab lib/navigationRef.js se aa raha hai */}
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName="AuthLoading"
          screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="RCInput" component={RCInputScreen} />
          <Stack.Screen name="CarDetails" component={CarDetailsScreen} />
          <Stack.Screen name="ConditionForm" component={ConditionFormScreen} />
          <Stack.Screen name="PriceResult" component={PriceResultScreen} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="ProfileUpdate" component={ProfileUpdateScreen} />
          <Stack.Screen name="SoldCarDetails" component={SoldCarDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});