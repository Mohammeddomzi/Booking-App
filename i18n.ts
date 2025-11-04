import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale from the request
  let locale = await requestLocale;

  // Ensure the locale is valid
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
