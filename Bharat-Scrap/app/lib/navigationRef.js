// lib/navigationRef.js
// ✅ Alag file mein rakha — circular import fix
// App.js aur HomeScreen.js dono yahan se import karenge
import { createRef } from 'react';

export const navigationRef = createRef();

export function navigate(screen, params) {
  if (navigationRef.current?.isReady()) {
    navigationRef.current.navigate(screen, params);
  }
}