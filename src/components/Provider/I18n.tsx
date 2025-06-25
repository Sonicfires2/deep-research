"use client";
import { useLayoutEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { useSettingStore } from "@/store/setting";
import i18n from "@/utils/i18n";          // ⬅️  no detectLanguage import

const FORCED_LANG = "en";

function I18Provider({ children }: { children: React.ReactNode }) {
  // you can still keep the store in case other parts of the app read it

  useLayoutEffect(() => {
    const settingStore = useSettingStore.getState();
    if (language === "") {
      const browserLang = detectLanguage();
      settingStore.update({ language: browserLang });
      i18n.changeLanguage(browserLang);
    } else {
      i18n.changeLanguage(language);
    }

    if (i18n.language !== FORCED_LANG) {
      i18n.changeLanguage(FORCED_LANG);
    }

    // 3️⃣ keep HTML attrs + title consistent
    document.documentElement.setAttribute("lang", FORCED_LANG);
    document.title = i18n.t("title");
  }, []);                  

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

export default I18Provider;