import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLOSURE_KEY = '@bg_location_disclosure_shown_v1';

// role kuch bhi case me ho (craneMan / crane_man / craneman) — sab handle
export async function getPostLoginRoute(user) {
  const role = (user?.role || '').toLowerCase();
  console.log('role:', role);

  if (role === 'craneMan' || role === 'crane_man') {
    cosnole.log('craneMan');
    const shown = await AsyncStorage.getItem(DISCLOSURE_KEY);
    return shown === 'true' ? 'MainTabs' : 'LocationDisclosure';
  }

  return 'MainTabs';
}