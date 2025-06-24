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

    if (settingStore.language !== FORCED_LANG) {
      settingStore.update({ language: FORCED_LANG });
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