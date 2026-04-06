import en from "@/public/locales/en/common.json";
import hi from "@/public/locales/hi/common.json";

const dictionaries = { en, hi };

export type AppLocale = keyof typeof dictionaries;

export function getDictionary(locale: AppLocale = "en") {
  return dictionaries[locale] ?? dictionaries.en;
}
