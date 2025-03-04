import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳ファイルをインポート
import jaTranslation from './locales/ja.json';
import enTranslation from './locales/en.json';

i18n
  .use(LanguageDetector) // ブラウザの言語設定を検出
  .use(initReactI18next) // i18nextをReactと連携
  .init({
    resources: {
      ja: { translation: jaTranslation },
      en: { translation: enTranslation }
    },
    fallbackLng: 'ja', // デフォルト言語
    interpolation: { 
      escapeValue: false // Reactは既にXSS対策を行っているため
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 