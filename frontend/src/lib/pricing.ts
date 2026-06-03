import {
  REGIONAL_PRICING,
  COUNTRY_NAME_MAP,
  getPricing,
  getCurrencyForCountryCode,
  formatPrice as formatPriceShared,
  type CountryCode,
  type CurrencyInfo,
  type CountryConfig,
} from '@shared/config/pricing';

const STORAGE_KEY = 'soma_currency_override';

const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Dhaka': 'BD',
  'Asia/Kathmandu': 'NP',
  'Asia/Karachi': 'PK',
  'Asia/Dubai': 'AE',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Hong_Kong': 'CN',
};

function detectCountryFromLocale(): string | null {
  try {
    const locale = navigator.language;
    if (!locale) return null;
    const parts = locale.split('-');
    const region = parts[parts.length - 1]?.toUpperCase();
    if (region && region.length === 2 && REGIONAL_PRICING[region]) {
      return region;
    }
    if (region === 'IN' || region === 'IN') return region;
    return null;
  } catch {
    return null;
  }
}

function detectCountryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return null;
    return TIMEZONE_COUNTRY_MAP[tz] || null;
  } catch {
    return null;
  }
}

let ipDetectedCountry: string | null = null;
let ipDetectionPromise: Promise<string | null> | null = null;

async function detectCountryFromIP(): Promise<string | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    const code = data?.country_code;
    if (code && REGIONAL_PRICING[code]) {
      return code;
    }
    const name = data?.country_name;
    if (name) {
      const mapped = COUNTRY_NAME_MAP[name.toLowerCase().trim()];
      if (mapped) return mapped;
    }
    return null;
  } catch {
    return null;
  }
}

async function detectCountryFromIPFallback(): Promise<string | null> {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=countryCode', { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = await res.json();
    const code = data?.countryCode;
    if (code && REGIONAL_PRICING[code]) {
      return code;
    }
    return null;
  } catch {
    return null;
  }
}

let detectionInitialized = false;

export async function detectCountry(): Promise<string> {
  if (detectionInitialized && ipDetectedCountry) return ipDetectedCountry;

  const override = getManualCountryOverride();
  if (override) {
    detectionInitialized = true;
    return override;
  }

  const fromTz = detectCountryFromTimezone();
  if (fromTz && REGIONAL_PRICING[fromTz]) {
    detectionInitialized = true;
    return fromTz;
  }

  if (!ipDetectedCountry && !ipDetectionPromise) {
    ipDetectionPromise = (async () => {
      const fromIP = await detectCountryFromIP();
      if (fromIP) {
        ipDetectedCountry = fromIP;
        detectionInitialized = true;
        return fromIP;
      }
      const fromIPFallback = await detectCountryFromIPFallback();
      if (fromIPFallback) {
        ipDetectedCountry = fromIPFallback;
        detectionInitialized = true;
        return fromIPFallback;
      }
      const fromLocale = detectCountryFromLocale();
      if (fromLocale) {
        ipDetectedCountry = fromLocale;
        detectionInitialized = true;
        return fromLocale;
      }
      ipDetectedCountry = 'US';
      detectionInitialized = true;
      return 'US';
    })();
  }

  return (await ipDetectionPromise) || 'US';
}

let cachedCountry: string | null = null;

export async function getDetectedCountry(): Promise<string> {
  if (cachedCountry) return cachedCountry;
  cachedCountry = await detectCountry();
  return cachedCountry;
}

export function getManualCountryOverride(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setManualCountryOverride(countryCode: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, countryCode);
    cachedCountry = null;
    ipDetectedCountry = null;
    ipDetectionPromise = null;
    detectionInitialized = false;
  } catch {
  }
}

export function clearManualCountryOverride(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedCountry = null;
    ipDetectedCountry = null;
    ipDetectionPromise = null;
    detectionInitialized = false;
  } catch {
  }
}

export function getCurrencyInfo(countryCode?: string | null): CurrencyInfo {
  if (countryCode && REGIONAL_PRICING[countryCode]) {
    return REGIONAL_PRICING[countryCode]!.currency;
  }
  const override = getManualCountryOverride();
  if (override && REGIONAL_PRICING[override]) {
    return REGIONAL_PRICING[override]!.currency;
  }
  return REGIONAL_PRICING.US!.currency;
}

export function getPlans(countryCode?: string | null): CountryConfig['plans'] {
  return getPricing(countryCode || undefined).plans;
}

export function formatPrice(amount: number, currency: string, locale: string): string {
  return formatPriceShared(amount, currency, locale);
}

export function getCurrencyForCountry(country: string): { code: string; symbol: string; locale: string } {
  const config = getPricing(country);
  return config.currency;
}

export function getLocalizedPrice(basePriceUSD: number, currencyCode: string): number {
  const usdConfig = REGIONAL_PRICING.US!;
  const targetConfig = Object.values(REGIONAL_PRICING).find((c) => c.currency.code === currencyCode);
  if (!targetConfig) return basePriceUSD;

  const proRatio = targetConfig.plans.PRO.monthly / usdConfig.plans.PRO.monthly;
  const premiumRatio = targetConfig.plans.PREMIUM.monthly / usdConfig.plans.PREMIUM.monthly;
  const enterpriseRatio = targetConfig.plans.ENTERPRISE.monthly / usdConfig.plans.ENTERPRISE.monthly;

  const avgRatio = (proRatio + premiumRatio + enterpriseRatio) / 3;
  const converted = basePriceUSD * avgRatio;
  return currencyCode === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
}

export { REGIONAL_PRICING, COUNTRY_NAME_MAP, type CountryCode, type CurrencyInfo, type CountryConfig };
