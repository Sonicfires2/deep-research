// src/utils/i18n.ts
import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";

// ───────────────────────────────────────────────────────────
// 1️⃣  pick ONE constant language for the whole app
const FORCED_LANG = "en-US";

// 2️⃣  if you have a locales map, keep it—or just hard-code ["en-US"]
// import locales from "@/constants/locales";
// const SUPPORTED = Object.keys(locales);
const SUPPORTED = [FORCED_LANG];   // English only

// 3️⃣  init i18next
i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend((lang: string) =>
      import(`../locales/${FORCED_LANG}.json`)  // ← always load en-US file
    )
  )
  .init({
    lng: FORCED_LANG,          // force at bootstrap
    fallbackLng: FORCED_LANG,  // always fall back to English
    supportedLngs: SUPPORTED,  // optional, but keeps i18next strict
    // detection: { }          // ⬅️  removed: no browser detection
  });

export default i18next;