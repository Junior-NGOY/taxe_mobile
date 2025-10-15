// @ts-nocheck - Disable type checking due to React 19 / React Native compatibility issues
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';

// Import conditionnel pour éviter les erreurs de module natif
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const ExpoCamera = require('expo-camera');
  CameraView = ExpoCamera.CameraView;
  useCameraPermissions = ExpoCamera.useCameraPermissions;
} catch (error) {
  console.log('expo-camera not available:', error);
}

interface SafeBarcodeProps {
  onBarCodeScanned: (data: { type: string; data: string }) => void;
  style?: any;
}

export const SafeBarcodeScanner: React.FC<SafeBarcodeProps> = ({ 
  onBarCodeScanned, 
  style 
}) => {
  const [scanned, setScanned] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permission, requestPermission] = useCameraPermissions ? useCameraPermissions() : [null, () => {}];

  useEffect(() => {
    if (!CameraView || !useCameraPermissions) {
      setIsSupported(false);
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    onBarCodeScanned({ type, data });
  };

  // @ts-ignore - Ignore all View/Text type errors due to React 19 compatibility
  if (!isSupported) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          Scanner de codes barres non disponible sur cette plateforme.
        </Text>
        <Text style={styles.subText}>
          Veuillez utiliser un appareil physique ou Expo Go pour tester cette fonctionnalité.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Demande d'autorisation caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Pas d'accès à la caméra</Text>
        <Button 
          mode="contained" 
          onPress={requestPermission}
        >
          Autoriser la caméra
        </Button>
      </View>
    );
  }

  if (!CameraView) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>Module de scan non disponible</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      {scanned && (
        <Button 
          mode="contained" 
          onPress={() => setScanned(false)}
          style={styles.scanAgainButton}
        >
          Scanner à nouveau
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  subText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
});

export default SafeBarcodeScanner;