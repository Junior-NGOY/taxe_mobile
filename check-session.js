/**
 * Script pour vérifier l'état de la session dans AsyncStorage
 * À exécuter depuis l'application mobile (console de debug React Native)
 * 
 * OU depuis le simulateur:
 * 1. Ouvrir Chrome DevTools
 * 2. Aller dans Console
 * 3. Copier-coller ce code
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

async function checkSession() {
  try {
    console.log('🔍 Vérification de la session stockée...\n');
    
    // 1. Vérifier la session parking
    const sessionParking = await AsyncStorage.getItem('@sessionParking');
    console.log('📊 Session Parking:');
    if (sessionParking) {
      const session = JSON.parse(sessionParking);
      console.log('  ✅ Session trouvée');
      console.log('  - Parking:', session.parking?.name || 'Non défini');
      console.log('  - Account:', session.account ? session.account.person?.name : 'Aucun compte');
      console.log('  - Account username:', session.account?.username || 'N/A');
      console.log('  - Account password (présent):', session.account?.password ? 'OUI' : 'NON');
      console.log('  - Start At:', session.startAt || 'N/A');
      console.log('\n  Détails complets:', JSON.stringify(session, null, 2));
    } else {
      console.log('  ❌ Aucune session trouvée\n');
    }
    
    // 2. Vérifier les perceptors
    const perceptors = await AsyncStorage.getItem('@perceptors');
    console.log('\n👷 Perceptors stockés:');
    if (perceptors) {
      const perceptorsList = JSON.parse(perceptors);
      console.log(`  ✅ ${perceptorsList.length} perceptors trouvés`);
      perceptorsList.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.person?.name} (${p.username})`);
      });
    } else {
      console.log('  ❌ Aucun perceptor stocké\n');
    }
    
    // 3. Vérifier le device
    const device = await AsyncStorage.getItem('@device');
    console.log('\n📱 Device:');
    if (device) {
      const deviceData = JSON.parse(device);
      console.log('  ✅ Device trouvé');
      console.log('  - Code:', deviceData.code || deviceData.serialNumber);
      console.log('  - Site:', deviceData.site?.name);
    } else {
      console.log('  ❌ Aucun device trouvé\n');
    }
    
    // 4. Vérifier les superviseurs
    const supervisors = await AsyncStorage.getItem('@supervisors');
    console.log('\n👔 Supervisors:');
    if (supervisors) {
      const supervisorsList = JSON.parse(supervisors);
      console.log(`  ✅ ${supervisorsList.length} supervisors trouvés`);
    } else {
      console.log('  ❌ Aucun supervisor stocké\n');
    }
    
    // 5. Liste de toutes les clés
    console.log('\n📋 Toutes les clés AsyncStorage:');
    const allKeys = await AsyncStorage.getAllKeys();
    allKeys.forEach(key => console.log(`  - ${key}`));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkSession();
