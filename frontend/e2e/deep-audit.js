import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES = [
  '/', '/pricing', '/numerology', '/tarot', '/transits',
  '/login', '/register', '/about', '/contact', '/faq',
  '/privacy', '/terms', '/refund',
  '/dashboard', '/dashboard/horoscope', '/dashboard/kundli',
  '/dashboard/compatibility', '/dashboard/moon', '/dashboard/chat',
  '/dashboard/settings',
  '/admin', '/admin/users', '/admin/analytics', '/admin/reports',
  '/nonexistent',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const BASE = 'http://localhost:5173';
const OUT = path.resolve(__dirname, '..', 'e2e-screenshots');
const REPORT = path.join(OUT, 'audit-report.md');

const allIssues = [];

function luminance(r, g, b) {
  const [R, G, B] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(c1, c2) {
  const l1 = luminance(...c1);
  const l2 = luminance(...c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function parseRgb(s) {
  if (!s) return null;
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

async function audit() {
  const browser = await chromium.launch({ headless: true });

  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const theme of ['light', 'dark']) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await ctx.newPage();

        try {
          await page.goto(`${BASE}${route}`, { waitUntil: 'commit', timeout: 10000 });
          await page.evaluate((t) => {
            localStorage.setItem('theme', t);
            if (t === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }, theme);
          await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(800);

          // Check all visible text for contrast
          const textEls = await page.evaluate(() => {
            const results = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
              const text = node.textContent?.trim();
              if (!text || text.length < 3) continue;
              const el = node.parentElement;
              if (!el) continue;
              const cs = getComputedStyle(el);
              if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
              const color = cs.color;
              const bg = cs.backgroundColor;
              const fontSize = cs.fontSize;
              let sel = el.tagName.toLowerCase();
              if (el.id) sel += `#${el.id}`;
              else if (el.className && typeof el.className === 'string') sel += '.' + el.className.split(' ').slice(0, 2).join('.');
              results.push({ tag: sel, text: text.slice(0, 80), color, bg, fontSize });
            }
            return results;
          });

          for (const te of textEls) {
            const cRgb = parseRgb(te.color);
            const bRgb = parseRgb(te.bg);

            if (cRgb && bRgb && bRgb[0] + bRgb[1] + bRgb[2] > 0) {
              const cr = contrastRatio(cRgb, bRgb);
              const fontSize = parseFloat(te.fontSize);
              if (cr < 2.5) {
                allIssues.push({
                  url: route, viewport: vp.name, theme,
                  selector: te.tag, text: te.text.slice(0, 60),
                  problem: `CRITICAL contrast: ratio=${cr.toFixed(2)}`,
                  color: te.color, bg: te.bg,
                  severity: 'critical',
                });
              } else if (cr < 3.5) {
                allIssues.push({
                  url: route, viewport: vp.name, theme,
                  selector: te.tag, text: te.text.slice(0, 60),
                  problem: `Low contrast: ratio=${cr.toFixed(2)}`,
                  color: te.color, bg: te.bg,
                  severity: 'high',
                });
              }
            }

            const fSize = parseFloat(te.fontSize);
            if (fSize > 0 && fSize < 7) {
              allIssues.push({
                url: route, viewport: vp.name, theme,
                selector: te.tag, text: te.text.slice(0, 60),
                problem: `Tiny text: ${te.fontSize}`,
                severity: 'medium',
              });
            }
          }

          // Check for hidden or invisible elements
          const hiddenTexts = await page.evaluate(() => {
            const results = [];
            const all = document.querySelectorAll('[class*="hidden"], [class*="invisible"], [style*="display: none"]');
            for (const el of all) {
              const text = el.textContent?.trim();
              if (text && text.length > 2) {
                const cs = getComputedStyle(el);
                results.push({ tag: el.tagName.toLowerCase(), text: text.slice(0, 60), display: cs.display, visibility: cs.visibility, opacity: cs.opacity });
              }
            }
            return results;
          });

          for (const ht of hiddenTexts) {
            if (ht.display !== 'none' && ht.visibility !== 'hidden' && ht.opacity !== '0') continue;
            allIssues.push({
              url: route, viewport: vp.name, theme,
              selector: ht.tag, text: ht.text,
              problem: `Hidden/invisible element has text: "${ht.text}"`,
              severity: 'medium',
            });
          }

          // Check overflows
          const overflows = await page.evaluate(() => {
            const results = [];
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const cs = getComputedStyle(el);
              if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden') && el.textContent?.trim()) {
                if (el.scrollWidth > el.clientWidth + 3) {
                  results.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 40)}" overflows`);
                }
              }
            }
            return results.slice(0, 15);
          });

          for (const ov of overflows) {
            allIssues.push({
              url: route, viewport: vp.name, theme,
              selector: '', text: ov,
              problem: 'Overflow clipping content',
              severity: 'high',
            });
          }

          // Check horizontal scroll
          const hasHScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 5);
          if (hasHScroll) {
            allIssues.push({
              url: route, viewport: vp.name, theme,
              selector: 'body', text: '',
              problem: 'Horizontal scrollbar',
              severity: 'high',
            });
          }

          // Screenshot
          const dir = path.join(OUT, theme, vp.name);
          fs.mkdirSync(dir, { recursive: true });
          const safeRoute = route === '/' ? 'index' : route.replace(/\//g, '_');
          await page.screenshot({ path: path.join(dir, `${safeRoute}.png`), fullPage: true });

        } catch (e) {
          allIssues.push({
            url: route, viewport: vp.name, theme,
            selector: '', text: '',
            problem: `Error: ${(e.message || '').slice(0, 120)}`,
            severity: 'critical',
          });
        }

        await ctx.close();
        console.log(`Done: ${route} @ ${vp.name} ${theme}`);
      }
    }
  }

  await browser.close();

  // Write report
  const lines = [];
  lines.push('# Visual Audit Report');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`**Total issues: ${allIssues.length}**`);
  lines.push('');
  lines.push('## Summary by Severity');
  const bySev = {};
  for (const i of allIssues) bySev[i.severity] = (bySev[i.severity] || 0) + 1;
  for (const [s, n] of Object.entries(bySev)) lines.push(`- **${s}**: ${n}`);
  lines.push('');
  lines.push('## Summary by Route');
  const byRoute = {};
  for (const i of allIssues) byRoute[i.url] = (byRoute[i.url] || 0) + 1;
  for (const [r, n] of Object.entries(byRoute).sort((a, b) => b[1] - a[1])) lines.push(`- **${r}**: ${n} issues`);
  lines.push('');

  let idx = 1;
  for (const i of allIssues) {
    const sfx = i.url === '/' ? 'index' : i.url.replace(/\//g, '_');
    const ssPath = `screenshots/${i.theme}/${i.viewport}/${sfx}.png`;
    lines.push(`### ${idx}. [${i.severity.toUpperCase()}] \`${i.url}\` @ ${i.viewport} ${i.theme}`);
    lines.push(`- **Selector:** \`${i.selector}\``);
    lines.push(`- **Text:** "${i.text}"`);
    lines.push(`- **Problem:** ${i.problem}`);
    if (i.color) lines.push(`- **Color:** ${i.color}`);
    if (i.bg) lines.push(`- **Background:** ${i.bg}`);
    lines.push(`- **Screenshot:** ${ssPath}`);
    lines.push('');
    idx++;
  }

  fs.writeFileSync(REPORT, lines.join('\n'), 'utf-8');
  console.log(`\nReport: ${REPORT} (${allIssues.length} issues)`);
  console.log(JSON.stringify(allIssues, null, 2));
}

audit().catch(console.error);
