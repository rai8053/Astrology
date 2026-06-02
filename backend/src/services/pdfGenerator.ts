import { chromium } from 'playwright';
import type { VedicProfile } from '../../../shared/types/api';
import { buildReportHtml } from './pdfTemplate.js';

export async function generatePdf(profile: VedicProfile): Promise<Buffer> {
  const html = buildReportHtml(profile);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
