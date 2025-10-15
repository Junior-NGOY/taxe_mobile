#!/usr/bin/env node

/**
 * Script Node.js pour vider AsyncStorage depuis l'ordinateur
 * Usage: node clear-storage.js
 * 
 * Note: L'appareil doit être connecté et l'app doit tourner
 */

const { execSync } = require('child_process');

console.log('🗑️ Nettoyage du storage AsyncStorage...\n');

try {
    // Pour Android
    console.log('📱 Tentative de nettoyage pour Android...');
    execSync('adb shell pm clear host.exp.exponent', { stdio: 'inherit' });
    console.log('✅ Storage Android nettoyé avec succès!\n');
} catch (error) {
    console.log('❌ Aucun appareil Android détecté ou erreur.\n');
}

console.log('💡 Autres options:');
console.log('   1. Depuis l\'app: Settings → Bouton Rouge 🔥');
console.log('   2. Désinstaller/réinstaller l\'app');
console.log('   3. Dans l\'app, appuyez sur "d" → Clear cache');
console.log('\n🚀 Redémarrez l\'app pour voir les changements!');
