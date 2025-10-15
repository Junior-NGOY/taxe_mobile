const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ajout de la résolution pour les modules natifs
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;