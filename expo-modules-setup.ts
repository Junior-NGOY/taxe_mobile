import { Platform } from 'react-native';

// Préchargement des modules natifs Expo pour éviter les erreurs
if (Platform.OS !== 'web') {
  // Importer les modules natifs de manière conditionnelle
  try {
    require('expo-camera');
  } catch (e) {
    console.warn('expo-camera not available');
  }
  
  try {
    require('expo-constants');
  } catch (e) {
    console.warn('expo-constants not available');
  }

  try {
    require('expo-asset');
  } catch (e) {
    console.warn('expo-asset not available');
  }

  try {
    require('expo-font');
  } catch (e) {
    console.warn('expo-font not available');
  }

  try {
    require('expo-splash-screen');
  } catch (e) {
    console.warn('expo-splash-screen not available');
  }

  try {
    require('expo-system-ui');
  } catch (e) {
    console.warn('expo-system-ui not available');
  }

  try {
    require('expo-linking');
  } catch (e) {
    console.warn('expo-linking not available');
  }

  try {
    require('expo-intent-launcher');
  } catch (e) {
    console.warn('expo-intent-launcher not available');
  }

  try {
    require('expo-print');
  } catch (e) {
    console.warn('expo-print not available');
  }

  try {
    require('expo-checkbox');
  } catch (e) {
    console.warn('expo-checkbox not available');
  }
}