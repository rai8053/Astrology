export type CountryCode =
  | 'IN' | 'US' | 'GB' | 'DE' | 'FR' | 'ES' | 'IT' | 'NL'
  | 'BD' | 'NP' | 'PK' | 'AE' | 'AU' | 'CA' | 'BR' | 'JP' | 'CN';

export type PlanId = 'FREE' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

export interface PlanPrices {
  monthly: number;
  yearly: number;
}

export interface CountryConfig {
  code: CountryCode;
  currency: CurrencyInfo;
  plans: Record<PlanId, PlanPrices>;
  flag: string;
}

export const REGIONAL_PRICING: Record<string, CountryConfig> = {
  IN: {
    code: 'IN',
    currency: { code: 'INR', symbol: '₹', locale: 'en-IN' },
    flag: '🇮🇳',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 299, yearly: 1999 },
      PREMIUM: { monthly: 699, yearly: 3999 },
      ENTERPRISE: { monthly: 2499, yearly: 14999 },
    },
  },
  US: {
    code: 'US',
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    flag: '🇺🇸',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 4.99, yearly: 49 },
      PREMIUM: { monthly: 9.99, yearly: 99 },
      ENTERPRISE: { monthly: 29.99, yearly: 299 },
    },
  },
  GB: {
    code: 'GB',
    currency: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    flag: '🇬🇧',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 3.99, yearly: 39 },
      PREMIUM: { monthly: 7.99, yearly: 79 },
      ENTERPRISE: { monthly: 24.99, yearly: 249 },
    },
  },
  DE: {
    code: 'DE',
    currency: { code: 'EUR', symbol: '€', locale: 'de-DE' },
    flag: '🇩🇪',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 5.99, yearly: 49 },
      PREMIUM: { monthly: 11.99, yearly: 99 },
      ENTERPRISE: { monthly: 34.99, yearly: 349 },
    },
  },
  FR: {
    code: 'FR',
    currency: { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    flag: '🇫🇷',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 5.99, yearly: 49 },
      PREMIUM: { monthly: 11.99, yearly: 99 },
      ENTERPRISE: { monthly: 34.99, yearly: 349 },
    },
  },
  ES: {
    code: 'ES',
    currency: { code: 'EUR', symbol: '€', locale: 'es-ES' },
    flag: '🇪🇸',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 5.99, yearly: 49 },
      PREMIUM: { monthly: 11.99, yearly: 99 },
      ENTERPRISE: { monthly: 34.99, yearly: 349 },
    },
  },
  IT: {
    code: 'IT',
    currency: { code: 'EUR', symbol: '€', locale: 'it-IT' },
    flag: '🇮🇹',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 5.99, yearly: 49 },
      PREMIUM: { monthly: 11.99, yearly: 99 },
      ENTERPRISE: { monthly: 34.99, yearly: 349 },
    },
  },
  NL: {
    code: 'NL',
    currency: { code: 'EUR', symbol: '€', locale: 'nl-NL' },
    flag: '🇳🇱',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 5.99, yearly: 49 },
      PREMIUM: { monthly: 11.99, yearly: 99 },
      ENTERPRISE: { monthly: 34.99, yearly: 349 },
    },
  },
  BD: {
    code: 'BD',
    currency: { code: 'BDT', symbol: '৳', locale: 'bn-BD' },
    flag: '🇧🇩',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 399, yearly: 2499 },
      PREMIUM: { monthly: 899, yearly: 4999 },
      ENTERPRISE: { monthly: 2999, yearly: 19999 },
    },
  },
  NP: {
    code: 'NP',
    currency: { code: 'NPR', symbol: 'रु', locale: 'ne-NP' },
    flag: '🇳🇵',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 399, yearly: 2499 },
      PREMIUM: { monthly: 899, yearly: 4999 },
      ENTERPRISE: { monthly: 2999, yearly: 19999 },
    },
  },
  PK: {
    code: 'PK',
    currency: { code: 'PKR', symbol: 'Rs', locale: 'ur-PK' },
    flag: '🇵🇰',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 499, yearly: 2999 },
      PREMIUM: { monthly: 1099, yearly: 5999 },
      ENTERPRISE: { monthly: 3999, yearly: 24999 },
    },
  },
  AE: {
    code: 'AE',
    currency: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE' },
    flag: '🇦🇪',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 39, yearly: 299 },
      PREMIUM: { monthly: 79, yearly: 599 },
      ENTERPRISE: { monthly: 249, yearly: 1999 },
    },
  },
  AU: {
    code: 'AU',
    currency: { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    flag: '🇦🇺',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 6.99, yearly: 69 },
      PREMIUM: { monthly: 14.99, yearly: 149 },
      ENTERPRISE: { monthly: 44.99, yearly: 449 },
    },
  },
  CA: {
    code: 'CA',
    currency: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
    flag: '🇨🇦',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 6.99, yearly: 69 },
      PREMIUM: { monthly: 13.99, yearly: 139 },
      ENTERPRISE: { monthly: 39.99, yearly: 399 },
    },
  },
  BR: {
    code: 'BR',
    currency: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    flag: '🇧🇷',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 24.99, yearly: 249 },
      PREMIUM: { monthly: 49.99, yearly: 499 },
      ENTERPRISE: { monthly: 149.99, yearly: 1499 },
    },
  },
  JP: {
    code: 'JP',
    currency: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    flag: '🇯🇵',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 499, yearly: 4990 },
      PREMIUM: { monthly: 999, yearly: 9990 },
      ENTERPRISE: { monthly: 2999, yearly: 29990 },
    },
  },
  CN: {
    code: 'CN',
    currency: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    flag: '🇨🇳',
    plans: {
      FREE: { monthly: 0, yearly: 0 },
      PRO: { monthly: 29, yearly: 299 },
      PREMIUM: { monthly: 69, yearly: 699 },
      ENTERPRISE: { monthly: 199, yearly: 1999 },
    },
  },
};

export const COUNTRY_NAME_MAP: Record<string, string> = {
  'india': 'IN',
  'united states': 'US',
  'usa': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'germany': 'DE',
  'france': 'FR',
  'spain': 'ES',
  'italy': 'IT',
  'netherlands': 'NL',
  'bangladesh': 'BD',
  'nepal': 'NP',
  'pakistan': 'PK',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'australia': 'AU',
  'canada': 'CA',
  'brazil': 'BR',
  'japan': 'JP',
  'china': 'CN',
};

export function getCountryCode(countryName?: string | null): string {
  if (!countryName) return 'US';
  return COUNTRY_NAME_MAP[countryName.toLowerCase().trim()] || 'US';
}

export function getPricing(countryCode?: string | null): CountryConfig {
  if (countryCode && REGIONAL_PRICING[countryCode]) {
    return REGIONAL_PRICING[countryCode]!;
  }
  return REGIONAL_PRICING.US!;
}

export function getCurrencyForCountryCode(countryCode?: string | null): CurrencyInfo {
  return getPricing(countryCode).currency;
}

export function formatPrice(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 0,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    const config = Object.values(REGIONAL_PRICING).find((c) => c.currency.code === currency);
    const sym = config?.currency.symbol || '$';
    const formatted = currency === 'JPY' ? Math.round(amount).toString() : amount.toFixed(2);
    return `${sym}${formatted}`;
  }
}

export function getLocalizedPrice(basePriceUSD: number, targetCurrency: string): number {
  const usdConfig = REGIONAL_PRICING.US!;
  const targetConfig = Object.values(REGIONAL_PRICING).find((c) => c.currency.code === targetCurrency);
  if (!targetConfig) return basePriceUSD;

  const proRatio = targetConfig.plans.PRO.monthly / usdConfig.plans.PRO.monthly;
  const premiumRatio = targetConfig.plans.PREMIUM.monthly / usdConfig.plans.PREMIUM.monthly;
  const enterpriseRatio = targetConfig.plans.ENTERPRISE.monthly / usdConfig.plans.ENTERPRISE.monthly;

  const avgRatio = (proRatio + premiumRatio + enterpriseRatio) / 3;
  const converted = basePriceUSD * avgRatio;
  return targetCurrency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
}
