import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enCommon from "./locales/en/common.json"
import trCommon from "./locales/tr/common.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      tr: { common: trCommon },
      en: { common: enCommon },
    },
    fallbackLng: "tr",
    supportedLngs: ["tr", "en"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
  })

export default i18n
