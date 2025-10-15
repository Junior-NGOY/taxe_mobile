const PROD_URL = 'https://taxe-parking.osc-fr1.scalingo.io/api/graphql';
const PROD_BASE_URL = 'https://taxeparkingbackend-production.up.railway.app/api'; // ✅ Inclut /api

// ⚠️ IMPORTANT: Pour mobile, utiliser l'IP accessible depuis l'appareil/émulateur
// - Émulateur Android (pas Expo Go): 10.0.2.2 (alias pour localhost du PC)
// - Expo Go: IP locale du PC sur le même réseau WiFi
// - Appareil physique: IP locale du PC (ex: 192.168.1.100)

// 🔧 Configuration pour test local
// const LOCAL_HOST = '10.0.2.2'; // Pour émulateur Android
// const LOCAL_HOST = 'localhost'; // Pour simulateur iOS uniquement
const LOCAL_HOST = '192.168.43.13'; // ✅ Pour Expo Go sur appareil physique (même réseau WiFi)

const LOCAL_URL = `http://${LOCAL_HOST}:4000/api/graphql`; // Legacy GraphQL
const LOCAL_BASE_URL = `http://${LOCAL_HOST}:4000/api`; // ✅ BASE_URL doit inclure /api

const RAILWAY_URL = 'https://taxeparkingbackend-production.up.railway.app/api'; // Backend déployé
const RAILWAY_BASE_URL = 'https://taxeparkingbackend-production.up.railway.app/api'; // ✅ Inclut /api

const TEST_URL = 'https://test-taxe-parking.osc-fr1.scalingo.io/api/graphql';
const TEST_BASE_URL = `http://${LOCAL_HOST}:4000/api`; // ✅ Inclut /api

// Configuration active - Utiliser RAILWAY pour production
const URL = RAILWAY_URL;
const BASE_URL = RAILWAY_BASE_URL; // ✅ Backend Railway en production
export { URL, LOCAL_URL, LOCAL_BASE_URL, RAILWAY_URL, RAILWAY_BASE_URL, TEST_URL, PROD_URL, BASE_URL, TEST_BASE_URL, PROD_BASE_URL };
