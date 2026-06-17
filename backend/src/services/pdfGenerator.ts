import { chromium } from 'playwright';
import type { VedicProfile } from '../../../shared/types/api';
import { buildReportHtml } from './pdfTemplate.js';
import { logger } from '../lib/logger.js';

function sanitizeErr(msg: unknown): string {
  if (typeof msg === 'string') return msg.replace(/[\x00-\x1f\x7f]/g, '_').slice(0, 500);
  if (msg instanceof Error) return sanitizeErr(msg.message);
  return sanitizeErr(String(msg));
}

export async function generatePdf(profile: VedicProfile): Promise<Buffer> {
  logger.info({ step: '1/6' }, 'Building HTML template...');
  const html = buildReportHtml(profile);
  logger.info({ step: '1/6', htmlLength: html.length }, 'HTML built');

  logger.info({ step: '2/6' }, 'Launching Chromium...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    logger.info({ step: '2/6' }, 'Chromium launched');
  } catch (launchErr: unknown) {
    logger.error({ step: '2/6', err: sanitizeErr(launchErr) }, 'Failed to launch Chromium');
    throw new Error(`Chromium launch failed: ${sanitizeErr(launchErr)}`);
  }

  try {
    logger.info({ step: '3/6' }, 'Creating new page...');
    let page;
    try {
      page = await browser.newPage();
      logger.info({ step: '3/6' }, 'Page created');
    } catch (pageErr: unknown) {
      logger.error({ step: '3/6', err: sanitizeErr(pageErr) }, 'Failed to create page');
      throw new Error(`Page creation failed: ${sanitizeErr(pageErr)}`);
    }

    logger.info({ step: '4/6' }, 'Setting page content...');
    try {
      await page.setContent(html, { waitUntil: 'networkidle', timeout: 30000 });
      logger.info({ step: '4/6' }, 'Page content set, network idle');
    } catch (contentErr: unknown) {
      logger.error({ step: '4/6', err: sanitizeErr(contentErr) }, 'Failed to set content');
      throw new Error(`Page setContent failed: ${sanitizeErr(contentErr)}`);
    }

    logger.info({ step: '5/6' }, 'Generating PDF...');
    let pdfBuffer;
    try {
      pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true,
        displayHeaderFooter: false,
        preferCSSPageSize: true,
      });
      logger.info({ step: '5/6', pdfSize: pdfBuffer.length }, 'PDF generated');
    } catch (pdfErr: unknown) {
      logger.error({ step: '5/6', err: sanitizeErr(pdfErr) }, 'Failed to generate PDF');
      throw new Error(`PDF generation failed: ${sanitizeErr(pdfErr)}`);
    }

    logger.info({ step: '6/6', bufferSize: pdfBuffer.length }, 'Done');
    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      logger.info('Closing browser...');
      await browser.close().catch((e: unknown) => logger.error({ err: sanitizeErr(e) }, 'Error closing browser'));
      logger.info('Browser closed');
    }
  }
}
