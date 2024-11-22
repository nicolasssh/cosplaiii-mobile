import { I18n } from 'i18n-js';
import translations from './translations.json';
import { getLocales } from 'expo-localization';

const i18n = new I18n(translations);

// Configuration par défaut
i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;

// Helper function pour accéder aux traductions imbriquées
export const t = (key: string, options = {}) => {
    return i18n.t(key, options);
};

export default i18n;
