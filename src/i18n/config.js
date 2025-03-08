import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEN from './locales/en.json'
import translationJA from './locales/ja.json'
import translationKO from './locales/ko.json'
import translationES from './locales/es.json'
import translationFR from './locales/fr.json'
import translationVI from './locales/vi.json'
import translationID from './locales/id.json'
import translationHI from './locales/hi.json'
import translationTH from './locales/th.json'

const resources = {
  en: {
    translation: translationEN
  },
  ja: {
    translation: translationJA
  },
  ko: {
    translation: translationKO
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  vi: {
    translation: translationVI
  },
  id: {
    translation: translationID
  },
  hi: {
    translation: translationHI
  },
  th: {
    translation: translationTH
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n 