import { chromium } from 'playwright';
import type { VedicProfile } from '../../../shared/types/api';
import { buildReportHtml } from './pdfTemplate.js';

function sanitizeLog(msg: unknown): string {
  if (typeof msg === 'string') return msg.replace(/[\n\r\t\0]/g, '_').slice(0, 500);
  if (msg instanceof Error) return sanitizeLog(msg.message);
  return sanitizeLog(String(msg));
}

export async function generatePdf(profile: VedicProfile): Promise<Buffer> {
  console.log('[PDF] 1/6 Building HTML template...');
  const html = buildReportHtml(profile);
  console.log(`[PDF] 1/6 HTML built (${sanitizeLog(`${html.length}`)} chars)`);

  console.log('[PDF] 2/6 Launching Chromium...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('[PDF] 2/6 Chromium launched successfully');
  } catch (launchErr: unknown) {
    console.error('[PDF] 2/6 FAILED to launch Chromium:', sanitizeLog(launchErr));
    throw new Error(`Chromium launch failed: ${sanitizeLog(launchErr)}`);
  }

  try {
    console.log('[PDF] 3/6 Creating new page...');
    let page;
    try {
      page = await browser.newPage();
      console.log('[PDF] 3/6 Page created');
    } catch (pageErr: unknown) {
      console.error('[PDF] 3/6 FAILED to create page:', sanitizeLog(pageErr));
      throw new Error(`Page creation failed: ${sanitizeLog(pageErr)}`);
    }

    console.log('[PDF] 4/6 Setting page content (waiting for networkidle, 30s timeout)...');
    try {
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('[PDF] 4/6 Page content set, network idle');
    } catch (contentErr: unknown) {
      console.error('[PDF] 4/6 FAILED to set content:', sanitizeLog(contentErr));
      throw new Error(`Page setContent failed: ${sanitizeLog(contentErr)}`);
    }

    console.log('[PDF] 5/6 Generating PDF...');
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true,
        displayHeaderFooter: false,
        preferCSSPageSize: true,
      });
      const pdfLen = sanitizeLog(`${pdfBuffer.length}`);
      console.log(`[PDF] 5/6 PDF generated (${pdfLen} bytes)`);
    } catch (pdfErr: unknown) {
      console.error('[PDF] 5/6 FAILED to generate PDF:', sanitizeLog(pdfErr));
      throw new Error(`PDF generation failed: ${sanitizeLog(pdfErr)}`);
    }

    console.log('[PDF] 6/6 Converting to Buffer...');
    const buf = Buffer.from(pdfBuffer);
    const bufLen = sanitizeLog(`${buf.length}`);
    console.log(`[PDF] 6/6 Done (${bufLen} bytes)`);
    return buf;
  } finally {
    if (browser) {
      console.log('[PDF] Closing browser...');
      await browser.close().catch((e: unknown) => console.error('[PDF] Error closing browser:', sanitizeLog(e)));
      console.log('[PDF] Browser closed');
    }
  }
}
