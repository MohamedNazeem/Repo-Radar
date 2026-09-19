import en from "./locales/en.json";
import de from "./locales/de.json";

export const LOCALES = ["en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export type TranslateVars = Record<string, string | number>;

export type TranslateFn = (key: string, vars?: TranslateVars) => string;

const catalogs: Record<Locale, Record<string, unknown>> = {
  en,
  de,
};

export const intlLocales: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "de";
}

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, vars?: TranslateVars, intlLocale?: string): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    if (value == null) return match;
    if (typeof value === "number") return value.toLocaleString(intlLocale);
    return String(value);
  });
}

export function translate(
  locale: Locale,
  key: string,
  vars?: TranslateVars,
): string {
  const messages = catalogs[locale] ?? catalogs.en;
  const count = vars?.count;
  const pluralKey =
    typeof count === "number" ? `${key}_${count === 1 ? "one" : "other"}` : null;

  const template =
    (pluralKey ? getByPath(messages, pluralKey) : undefined) ??
    getByPath(messages, key) ??
    (locale === "en" ? undefined : getByPath(catalogs.en, pluralKey ?? key));

  if (typeof template !== "string") return key;
  return interpolate(template, vars, intlLocales[locale]);
}

export function createTranslator(locale: Locale): TranslateFn {
  return (key, vars) => translate(locale, key, vars);
}
