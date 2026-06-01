import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';

export const locationsRouter = Router();

const CITIES: { city: string; country: string; countryCode: string; timezone: string }[] = [
  { city: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Bangalore', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Hyderabad', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Chennai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Kolkata', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Ahmedabad', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Pune', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'Jaipur', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata' },
  { city: 'New York', country: 'United States', countryCode: 'US', timezone: 'America/New_York' },
  { city: 'Los Angeles', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles' },
  { city: 'Chicago', country: 'United States', countryCode: 'US', timezone: 'America/Chicago' },
  { city: 'San Francisco', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles' },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London' },
  { city: 'Manchester', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London' },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australia', countryCode: 'AU', timezone: 'Australia/Melbourne' },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', timezone: 'America/Toronto' },
  { city: 'Vancouver', country: 'Canada', countryCode: 'CA', timezone: 'America/Vancouver' },
  { city: 'Dubai', country: 'UAE', countryCode: 'AE', timezone: 'Asia/Dubai' },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore' },
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo' },
  { city: 'Osaka', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo' },
  { city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', timezone: 'Asia/Dhaka' },
  { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo' },
  { city: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris' },
  { city: 'Berlin', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin' },
  { city: 'Madrid', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid' },
  { city: 'Rome', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome' },
  { city: 'Cairo', country: 'Egypt', countryCode: 'EG', timezone: 'Africa/Cairo' },
  { city: 'Istanbul', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul' },
  { city: 'Karachi', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi' },
  { city: 'Lahore', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi' },
  { city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', timezone: 'Asia/Jakarta' },
  { city: 'Seoul', country: 'South Korea', countryCode: 'KR', timezone: 'Asia/Seoul' },
  { city: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'Asia/Bangkok' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh' },
  { city: 'Lagos', country: 'Nigeria', countryCode: 'NG', timezone: 'Africa/Lagos' },
  { city: 'Nairobi', country: 'Kenya', countryCode: 'KE', timezone: 'Africa/Nairobi' },
];

locationsRouter.get('/cities', asyncHandler(async (req, res) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (q.length < 2) {
    res.json({ success: true, data: [] });
    return;
  }
  const results = CITIES.filter(
    c => c.city.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  ).slice(0, 10);
  res.json({ success: true, data: results });
}));

locationsRouter.get('/countries', asyncHandler(async (_req, res) => {
  const seen = new Set<string>();
  const countries = CITIES.reduce((acc, c) => {
    if (!seen.has(c.countryCode)) {
      seen.add(c.countryCode);
      acc.push({ name: c.country, code: c.countryCode });
    }
    return acc;
  }, [] as { name: string; code: string }[]);
  res.json({ success: true, data: countries });
}));
