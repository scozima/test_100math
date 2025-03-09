import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  // 言語検出機能を追加
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: {
      // ブラウザの言語設定を最優先で検出
      order: ['navigator', 'localStorage'],
      // 検出した言語設定をLocalStorageにキャッシュ
      caches: ['localStorage']
    }
  })

export default i18n 