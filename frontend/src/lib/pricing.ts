export const SUPPORTED_CURRENCIES = {
  IN: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
  GB: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  DE: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  FR: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
  ES: { code: 'EUR', symbol: '€', locale: 'es-ES' },
  IT: { code: 'EUR', symbol: '€', locale: 'it-IT' },
  NL: { code: 'EUR', symbol: '€', locale: 'nl-NL' },
  BD: { code: 'BDT', symbol: '৳', locale: 'bn-BD' },
  JP: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  CN: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  AE: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
  AU: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
  CA: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  BR: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
} as const;

export type CountryCode = keyof typeof SUPPORTED_CURRENCIES;

export const COUNTRY_CURRENCY_MAP: Record<string, CountryCode> = {
  india: 'IN',
  'united states': 'US',
  usa: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  germany: 'DE',
  france: 'FR',
  spain: 'ES',
  italy: 'IT',
  netherlands: 'NL',
  bangladesh: 'BD',
  japan: 'JP',
  china: 'CN',
  'united arab emirates': 'AE',
  uae: 'AE',
  australia: 'AU',
  canada: 'CA',
  brazil: 'BR',
};

export function getCurrencyForCountry(country: string): { code: string; symbol: string; locale: string } {
  const normalized = country.toLowerCase().trim();
  const cc = COUNTRY_CURRENCY_MAP[normalized];
  if (cc) return SUPPORTED_CURRENCIES[cc];
  return SUPPORTED_CURRENCIES.US;
}

export function getLocalizedPrice(basePriceUSD: number, currencyCode: string): number {
  const rates: Record<string, number> = {
    USD: 1,
    INR: 83,
    GBP: 0.79,
    EUR: 0.92,
    BDT: 109,
    JPY: 149,
    CNY: 7.24,
    AED: 3.67,
    AUD: 1.53,
    CAD: 1.36,
    BRL: 5.05,
  };
  const rate = rates[currencyCode] || 1;
  const converted = basePriceUSD * rate;
  if (currencyCode === 'JPY') return Math.round(converted);
  return Math.round(converted * 100) / 100;
}

export function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: currency === 'JPY' ? 0 : 2, maximumFractionDigits: currency === 'JPY' ? 0 : 2 }).format(amount);
  } catch {
    return `${currency === 'INR' ? '₹' : '$'}${amount.toFixed(2)}`;
  }
}
