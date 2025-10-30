// This file exports icons for better compatibility across different devices
// Using @svgr-iconkit for better SVG rendering (same as old app)
import IoniconsExpo from '@svgr-iconkit/ionicons';
import MaterialIconsExpo from '@svgr-iconkit/material-design';
import MaterialCommunityIconsExpo from '@svgr-iconkit/material-community';
import FontAwesomeExpo from '@svgr-iconkit/fontawesome';
import FontAwesome5Expo from '@svgr-iconkit/fontawesome5';

// Octicons not available in @svgr-iconkit, using @expo/vector-icons
import { Octicons as OcticonsExpo } from '@expo/vector-icons';

// Re-export icons
export const Ionicons = IoniconsExpo;
export const MaterialIcons = MaterialIconsExpo;
export const MaterialCommunityIcons = MaterialCommunityIconsExpo;
export const FontAwesome = FontAwesomeExpo;
export const FontAwesome5 = FontAwesome5Expo;
export const Octicons = OcticonsExpo;