import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALE_DIR = join(__dirname, '..', 'frontend', 'src', 'lib', 'i18n');
const LOG_DIR = join(__dirname, '..', 'logs');
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324';
if (!OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY env var required');
  process.exit(1);
}

const LOCALES = ['hi', 'bn', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'zh'];
const MAX_BATCH = 200; // keys per API call

function log(msg) {
  console.log(msg);
  writeFileSync(join(LOG_DIR, 'translate-locales.log'), msg + '\n', { flag: 'a' });
}

function isPlaceholder(val, key) {
  if (val === undefined || val === null) return true;
  if (val === key) return true;
  if (val.includes('?????')) return true;
  // camelCase English placeholder (e.g., "Team1Bio", "StatRevenue")
  if (/^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$/.test(val.replace(/[\d]/g, 'X'))) return true;
  // PascalCase phrases like "BackToDashboard"
  if (/^[A-Z][a-z]+(?:[A-Z][a-z]+)+$/.test(val)) return true;
  // TitleCase single-word placeholders like "Quote", "Team", "Subtitle"
  if (/^[A-Z][a-z]+$/.test(val) && val.length > 1) return true;
  return false;
}

async function callOpenRouter(systemMsg, userMsg) {
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Soma & Surya Locale Translator',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
      temperature: 0.1,
      max_tokens: 32000,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter error ${resp.status}: ${text.slice(0, 200)}`);
  }

  const data = await resp.json();
  return data.choices[0]?.message?.content || '';
}

async function translateBatch(entries, targetLang, locale) {
  const items = entries.map(([key, val]) => ({ key, text: val }));
  const systemMsg = `You are a professional translator. Translate the following JSON key-value pairs from English to ${targetLang}. Return ONLY a valid JSON object where each key maps to its translated value. Preserve placeholders like {name}, {date}, {n}, {color}, {gemstone}, {plan}, {score}, {page}, {pages} exactly as-is. Never translate: Soma, Surya, Vedic, Kundli, Nakshatra, Rashi, Lagna, Dasha, Yoga, Rahu, Ketu, Mahadasha, Antardasha, Tithi, Nitya, Ayanamsa, Lahiri, Gun Milan, Ashta Koota, Purnima, Amavasya, Muhurta, Dosha, Graha, Bhukti. Keep JSON structure valid.`;
  const userMsg = JSON.stringify(items, null, 2);

  const raw = await callOpenRouter(systemMsg, userMsg);
  // Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${raw.slice(0, 200)}`);
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Map back to { key: translatedText }
  const result = {};
  for (const item of items) {
    if (parsed[item.key] && typeof parsed[item.key] === 'string') {
      result[item.key] = parsed[item.key];
    } else if (parsed[item.text] && typeof parsed[item.text] === 'string') {
      result[item.key] = parsed[item.text];
    } else {
      log(`  ⚠ No translation for key "${item.key}" in ${locale}, using English: "${item.text}"`);
      result[item.key] = item.text;
    }
  }
  return result;
}

async function main() {
  const en = JSON.parse(readFileSync(join(LOCALE_DIR, 'en.json'), 'utf-8'));
  const enKeys = Object.keys(en);
  log(`Reference en.json: ${enKeys.length} keys`);

  for (const locale of LOCALES) {
    const filePath = join(LOCALE_DIR, `${locale}.json`);
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    
    // Find placeholder and missing keys
    const needsTranslation = [];
    for (const key of enKeys) {
      const val = data[key];
      if (isPlaceholder(val, key)) {
        needsTranslation.push([key, en[key]]);
      }
    }

    // Also check for corrupt keys already in data (not in en.json)
    const extraKeys = Object.keys(data).filter(k => !enKeys.includes(k));
    if (extraKeys.length > 0) {
      log(`  ${locale}: ${extraKeys.length} extra keys not in en.json (will be removed)`);
    }

    log(`${locale}: ${needsTranslation.length} keys need translation (${Math.round(needsTranslation.length / enKeys.length * 100)}% of total)`);

    if (needsTranslation.length === 0) {
      log(`  ✅ ${locale} is complete, skipping`);
      continue;
    }

    // Batch by namespace for coherence
    const byNamespace = {};
    for (const [key, text] of needsTranslation) {
      const ns = key.split('.')[0];
      if (!byNamespace[ns]) byNamespace[ns] = [];
      byNamespace[ns].push([key, text]);
    }

    const translated = {};
    for (const [ns, entries] of Object.entries(byNamespace)) {
      log(`  Translating ${locale}/${ns} (${entries.length} keys)...`);
      // Split into max_batch size
      for (let i = 0; i < entries.length; i += MAX_BATCH) {
        const batch = entries.slice(i, i + MAX_BATCH);
        let attempts = 0;
        await new Promise(r => setTimeout(r, 500)); // rate-limit delay
        while (attempts < 3) {
          try {
            const result = await translateBatch(batch, getLangName(locale), locale);
            Object.assign(translated, result);
            break;
          } catch (err) {
            attempts++;
            log(`  ⚠ Batch failed (attempt ${attempts}): ${err.message.slice(0, 100)}`);
            if (attempts >= 3) {
              log(`  ❌ Giving up on batch, keeping English fallbacks`);
              for (const [k, t] of batch) translated[k] = t;
            } else {
              await new Promise(r => setTimeout(r, 2000 * attempts));
            }
          }
        }
      }
    }

    // Merge translations into existing data
    const merged = { ...data };
    for (const [key] of needsTranslation) {
      if (translated[key]) {
        merged[key] = translated[key];
      }
    }

    // Remove keys not in en.json
    for (const key of Object.keys(merged)) {
      if (!enKeys.includes(key)) {
        delete merged[key];
      }
    }

    // Sort keys to match en.json order
    const sorted = {};
    for (const key of enKeys) {
      if (merged[key] !== undefined) {
        sorted[key] = merged[key];
      }
    }

    writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
    log(`  ✅ ${locale}.json written (${Object.keys(sorted).length} keys)`);
  }

  log('\n🎉 All locale files translated and saved!');
}

function getLangName(locale) {
  const map = { hi: 'Hindi', bn: 'Bengali', es: 'Spanish', pt: 'Portuguese', fr: 'French', de: 'German', ar: 'Arabic', ja: 'Japanese', zh: 'Chinese (Simplified)' };
  return map[locale] || locale;
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
