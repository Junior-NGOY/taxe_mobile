export const ICON_MAP: Record<string, string> = {
  'moto': 'fa5+motorcycle',
  'tricycle': 'fa5+motorcycle',
  'voiture': 'fa5+car',
  'camion': 'fa5+truck',
  'camionnette': 'fa5+truck',
  'grand bus': 'mi+directions-bus'
};

export const ICON_DEFAULT_PRICE: Record<string, number> = {
  'moto': 1000,
  'tricycle': 1000
};

export function chooseIconForLabel(label?: string): string {
  if (!label) return 'fa5+car';
  const key = label.toLowerCase();
  for (const k of Object.keys(ICON_MAP)) {
    if (key.includes(k)) return ICON_MAP[k];
  }
  // If the label already looks like a lib+name, return it
  if (label.includes('+')) return label;
  // fallback
  return 'fa5+car';
}

export function getDefaultPriceForLabel(label?: string): number | undefined {
  if (!label) return undefined;
  const key = label.toLowerCase();
  for (const k of Object.keys(ICON_DEFAULT_PRICE)) {
    if (key.includes(k)) return ICON_DEFAULT_PRICE[k];
  }
  return undefined;
}
