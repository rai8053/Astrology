import { chromium } from 'playwright';
import type { VedicProfile } from '../../../shared/types/api';
import { buildReportHtml } from './pdfTemplate.js';

export async function generatePdf(profile: VedicProfile): Promise<Buffer> {
  console.log('[PDF] 1/6 Building HTML template...');
  const html = buildReportHtml(profile);
  console.log(`[PDF] 1/6 HTML built (${html.length} chars)`);

  console.log('[PDF] 2/6 Launching Chromium...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('[PDF] 2/6 Chromium launched successfully');
  } catch (launchErr: unknown) {
    console.error('[PDF] 2/6 FAILED to launch Chromium:', launchErr);
    throw new Error(`Chromium launch failed: ${launchErr instanceof Error ? launchErr.message : launchErr}`);
  }

  try {
    console.log('[PDF] 3/6 Creating new page...');
    let page;
    try {
      page = await browser.newPage();
      console.log('[PDF] 3/6 Page created');
    } catch (pageErr: unknown) {
      console.error('[PDF] 3/6 FAILED to create page:', pageErr);
      throw new Error(`Page creation failed: ${pageErr instanceof Error ? pageErr.message : pageErr}`);
    }

    console.log('[PDF] 4/6 Setting page content (waiting for networkidle, 30s timeout)...');
    try {
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('[PDF] 4/6 Page content set, network idle');
    } catch (contentErr: unknown) {
      console.error('[PDF] 4/6 FAILED to set content:', contentErr);
      throw new Error(`Page setContent failed: ${contentErr instanceof Error ? contentErr.message : contentErr}`);
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
      console.log(`[PDF] 5/6 PDF generated (${pdfBuffer.length} bytes)`);
    } catch (pdfErr: unknown) {
      console.error('[PDF] 5/6 FAILED to generate PDF:', pdfErr);
      throw new Error(`PDF generation failed: ${pdfErr instanceof Error ? pdfErr.message : pdfErr}`);
    }

    console.log('[PDF] 6/6 Converting to Buffer...');
    const buf = Buffer.from(pdfBuffer);
    console.log(`[PDF] 6/6 Done (${buf.length} bytes)`);
    return buf;
  } finally {
    if (browser) {
      console.log('[PDF] Closing browser...');
      await browser.close().catch(e => console.error('[PDF] Error closing browser:', e));
      console.log('[PDF] Browser closed');
    }
  }
}
