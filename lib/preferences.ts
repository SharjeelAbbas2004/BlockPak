/** Pakistan crypto-regulation alert preference keys shared by the settings form and API. */
export const ALERT_PREFS = [
  { key: 'sbpUpdates', label: 'SBP updates', description: 'State Bank of Pakistan circulars and notices' },
  { key: 'secpUpdates', label: 'SECP updates', description: 'Securities & Exchange Commission of Pakistan' },
  { key: 'governmentPolicy', label: 'Government policy', description: 'Federal and provincial policy moves' },
  { key: 'taxDevelopments', label: 'Tax developments', description: 'FBR and taxation changes affecting crypto' },
  { key: 'digitalAssetRegulation', label: 'Digital asset regulation', description: 'Licensing, exchanges and custody rules' },
  { key: 'generalCryptoNews', label: 'General Pakistan crypto news', description: 'Everything else crypto in Pakistan' },
] as const;

export type AlertPrefKey = (typeof ALERT_PREFS)[number]['key'];
export type AlertPrefs = Record<AlertPrefKey, boolean>;

/** Defaults applied when a user has never saved preferences (opted in to everything). */
export const DEFAULT_ALERT_PREFS: AlertPrefs = {
  sbpUpdates: true,
  secpUpdates: true,
  governmentPolicy: true,
  taxDevelopments: true,
  digitalAssetRegulation: true,
  generalCryptoNews: true,
};

/** Merge a stored JSON value over the defaults, ignoring unknown keys. */
export function normalizeAlertPrefs(stored: unknown): AlertPrefs {
  const out = { ...DEFAULT_ALERT_PREFS };
  if (stored && typeof stored === 'object') {
    for (const { key } of ALERT_PREFS) {
      const value = (stored as Record<string, unknown>)[key];
      if (typeof value === 'boolean') out[key] = value;
    }
  }
  return out;
}
