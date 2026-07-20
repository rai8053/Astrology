import { test, expect, type Page } from '@playwright/test';
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

const VIEWPORTS: { name: string; width: number; height: number }[] = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'e2e-screenshots');
const REPORT_PATH = path.resolve(__dirname, '..', 'e2e-screenshots', 'audit-report.md');

interface Issue {
  url: string;
  viewport: string;
  theme: string;
  component: string;
  description: string;
  rootCause: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

const issues: Issue[] = [];

function reportIssue(url: string, viewport: string, theme: string, component: string, description: string, rootCause: string, severity: Issue['severity']) {
  issues.push({ url, viewport, theme, component, description, rootCause, severity });
}

async function checkPage(page: Page, url: string, viewportName: string, theme: string) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    // timeout ok, continue
  }
  await page.waitForTimeout(500);

  // Check for invisible text: elements with text that have 0 opacity, 0 size, or color matches background
  const textIssues = await page.evaluate(() => {
    const results: { tag: string; text: string; reason: string }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const text = node.textContent?.trim();
      if (!text || text.length < 2) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = getComputedStyle(el);
      const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
      if (!isVisible) {
        results.push({ tag: el.tagName.toLowerCase(), text: text.slice(0, 60), reason: 'hidden/zero-opacity' });
        continue;
      }
      // Check if color matches background too closely
      const color = style.color;
      const bg = style.backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
        const cMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (cMatch && bMatch) {
          const diff = Math.abs(Number(cMatch[1]) - Number(bMatch[1])) +
                       Math.abs(Number(cMatch[2]) - Number(bMatch[2])) +
                       Math.abs(Number(cMatch[3]) - Number(bMatch[3]));
          if (diff < 60) {
            results.push({ tag: el.tagName.toLowerCase(), text: text.slice(0, 60), reason: `low-contrast (color diff=${diff})` });
          }
        }
      }
      // Check for tiny font sizes
      const fontSize = parseFloat(style.fontSize);
      if (fontSize > 0 && fontSize < 7) {
        results.push({ tag: el.tagName.toLowerCase(), text: text.slice(0, 60), reason: `tiny-font (${fontSize}px)` });
      }
    }
    return results;
  });

  for (const ti of textIssues) {
    reportIssue(url, viewportName, theme, ti.tag, `"${ti.text}" — ${ti.reason}`, 'CSS visibility/color/font-size', ti.reason.includes('low-contrast') ? 'high' : 'medium');
  }

  // Check for overflowing elements
  const overflowIssues = await page.evaluate(() => {
    const results: string[] = [];
    const all = document.querySelectorAll('*');
    for (const el of all) {
      if (el.classList.contains('sr-only')) continue;
      const style = getComputedStyle(el);
      if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden') {
        if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
          const tag = el.tagName.toLowerCase();
          const text = (el.textContent || '').trim().slice(0, 40);
          if (text) results.push(`${tag} "${text}" overflows (${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight})`);
        }
      }
    }
    return results.slice(0, 20);
  });

  for (const oi of overflowIssues) {
    reportIssue(url, viewportName, theme, 'overflow', oi, 'CSS overflow:hidden clips content', 'high');
  }

  // Check layout shift: compare body dimensions
  const bodyDim = await page.evaluate(() => ({
    width: document.body.scrollWidth,
    height: document.body.scrollHeight,
    vw: window.innerWidth,
    vh: window.innerHeight,
  }));

  if (bodyDim.width < bodyDim.vw - 50 && url !== '/') {
    // Body narrower than viewport on non-home pages might mean missing content
    reportIssue(url, viewportName, theme, 'body', `body width ${bodyDim.width}px < viewport ${bodyDim.vw}px — possible missing content`, 'Layout/content missing', 'high');
  }

  // Check for horizontal scroll
  if (bodyDim.width > bodyDim.vw + 10) {
    reportIssue(url, viewportName, theme, 'body', `horizontal scroll: ${bodyDim.width}px > ${bodyDim.vw}px`, 'Element too wide for viewport', 'high');
  }
}

test.describe('Visual Audit — All Routes', () => {
  for (const route of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const theme of ['light', 'dark'] as const) {
        test(`${route} @ ${vp.name} ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: vp.width, height: vp.height });

          // Navigate with theme cookie
          await page.goto(`http://localhost:5173${route}`, {
            waitUntil: 'commit',
          });

          // Set theme via localStorage and cookie
          await page.evaluate((t) => {
            localStorage.setItem('theme', t);
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);

          // Reload so the app picks up the theme
          await page.goto(`http://localhost:5173${route}`, {
            waitUntil: 'networkidle',
            timeout: 15000,
          }).catch(() => {});
          await page.waitForTimeout(1000);

          const dir = path.join(SCREENSHOT_DIR, theme, vp.name);
          fs.mkdirSync(dir, { recursive: true });

          const safeRoute = route === '/' ? 'index' : route.replace(/\//g, '_');
          const screenshotPath = path.join(dir, `${safeRoute}.png`);

          await page.screenshot({ path: screenshotPath, fullPage: true });

          // Run visual checks
          await checkPage(page, route, vp.name, theme);
        });
      }
    }
  }

  test.afterAll(() => {
    // Generate report
    const reportLines: string[] = [];
    reportLines.push('# Visual Audit Report');
    reportLines.push(`Generated: ${new Date().toISOString()}`);
    reportLines.push('');
    reportLines.push(`**Total issues found: ${issues.length}**`);
    reportLines.push('');
    reportLines.push('## Summary');
    reportLines.push('');
    reportLines.push('| Severity | Count |');
    reportLines.push('|----------|-------|');
    const bySeverity: Record<string, number> = {};
    for (const i of issues) {
      bySeverity[i.severity] = (bySeverity[i.severity] || 0) + 1;
    }
    for (const [sev, count] of Object.entries(bySeverity)) {
      reportLines.push(`| ${sev} | ${count} |`);
    }
    reportLines.push('');
    reportLines.push('## Detailed Issues');
    reportLines.push('');

    let idx = 1;
    for (const i of issues) {
      reportLines.push(`### ${idx}. [${i.severity.toUpperCase()}] ${i.url}`);
      reportLines.push(`- **Viewport:** ${i.viewport} @ ${i.theme}`);
      reportLines.push(`- **Component:** ${i.component}`);
      reportLines.push(`- **Description:** ${i.description}`);
      reportLines.push(`- **Root Cause:** ${i.rootCause}`);
      reportLines.push(`- **Screenshot:** \`e2e-screenshots/${i.theme}/${i.viewport}/${i.url === '/' ? 'index' : i.url.replace(/\//g, '_')}.png\``);
      reportLines.push('');
      idx++;
    }

    fs.writeFileSync(REPORT_PATH, reportLines.join('\n'), 'utf-8');
    console.log(`\nReport written to ${REPORT_PATH}`);
    console.log(`Total issues: ${issues.length}`);
  });
});
