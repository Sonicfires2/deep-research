import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import locales from "@/constants/locales";
import { keys } from "radash";

const normalizeLocale = (locale: string) => {
  console.log(locale);
  return "en-US";
};

export function detectLanguage() {
  const languageDetector = new LanguageDetector();
  languageDetector.init();
  const detectedLang = languageDetector.detect();
  console.log("Detected:", detectedLang);
  const lang: string = "en-US";
  return lang;
}

i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(async (lang: string) => {
      return await import(`../locales/${normalizeLocale(lang)}.json`);
    })
  )
  .init({
    supportedLngs: keys(locales),
    fallbackLng: "en-US",
  });

export default i18next;