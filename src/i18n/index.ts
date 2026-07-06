import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

const STORAGE_KEY = "ko-lang";

export type Lang = "en" | "fr";

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: initialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(STORAGE_KEY, lng);
  document.documentElement.lang = lng;
});

// Dev-only: flag keys whose EN and FR values are identical — usually an untranslated copy-paste
if (import.meta.env.DEV) {
  const flat = (obj: Record<string, unknown>, prefix = ""): Record<string, string> =>
    Object.entries(obj).reduce((acc, [k, v]) => {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") acc[key] = v;
      else Object.assign(acc, flat(v as Record<string, unknown>, key));
      return acc;
    }, {} as Record<string, string>);

  const enFlat = flat(en as Record<string, unknown>);
  const frFlat = flat(fr as Record<string, unknown>);
  for (const key of Object.keys(enFlat)) {
    if (!(key in frFlat)) console.warn(`[i18n] missing FR key: ${key}`);
    else if (enFlat[key] === frFlat[key]) console.warn(`[i18n] identical EN/FR: ${key}`);
  }
  for (const key of Object.keys(frFlat)) {
    if (!(key in enFlat)) console.warn(`[i18n] missing EN key: ${key}`);
  }
}

export default i18n;