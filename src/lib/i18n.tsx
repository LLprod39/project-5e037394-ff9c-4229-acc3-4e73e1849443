import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Locale, LocalizedText } from "@/types/quiz";

const STORAGE_KEY = "umay-locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (value: LocalizedText | string | undefined | null) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function localize(locale: Locale, value: LocalizedText | string | undefined | null) {
  if (!value) {
    return "";
  }

  return typeof value === "string" ? value : value[locale] || value.ru;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "ru";
    }

    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    return savedLocale === "kz" ? "kz" : "ru";
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === "kz" ? "kk" : "ru";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (input: LocalizedText | string | undefined | null) => localize(locale, input),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider.");
  }

  return context;
}
