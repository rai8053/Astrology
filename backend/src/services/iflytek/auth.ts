import crypto from 'crypto';

function toRFC1123(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = days[date.getUTCDay()];
  const m = months[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${d}, ${day} ${m} ${date.getUTCFullYear()} ${hh}:${mm}:${ss} GMT`;
}

function encodeURIComponentRFC3986(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

export interface AuthParams {
  host: string;
  path: string;
  apiKey: string;
  apiSecret: string;
}

export interface AuthResult {
  url: string;
  date: string;
}

export function generateAuthUrl(params: AuthParams): AuthResult {
  const { host, path, apiKey, apiSecret } = params;
  const date = toRFC1123(new Date());
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signatureDigest = crypto.createHmac('sha256', apiSecret).update(signatureOrigin, 'utf-8').digest('base64');
  const signature = encodeURIComponentRFC3986(signatureDigest);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = encodeURIComponentRFC3986(authorizationOrigin);
  const url = `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponentRFC3986(date)}&host=${encodeURIComponentRFC3986(host)}`;
  return { url, date };
}
