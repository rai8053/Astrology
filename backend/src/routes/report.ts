import { Router } from 'express';
import { generatePdf } from '../services/pdfGenerator.js';
import type { VedicProfile } from '../../../shared/types/api';

export const reportRouter = Router();

reportRouter.post('/generate-pdf', async (req, res) => {
  const startTime = Date.now();
  const bodyKeys = Object.keys(req.body || {});
  console.log(`[PDF] POST /api/report/generate-pdf received. Body keys: [${bodyKeys.join(', ')}]`);

  try {
    const profile = req.body as VedicProfile;
    console.log(`[PDF] Payload: name="${profile?.name}", hasPlanetaryPlacements=${Array.isArray(profile?.planetaryPlacements)}, hasStrengths=${Array.isArray(profile?.strengths)}`);

    if (!profile?.name || !profile?.planetaryPlacements) {
      console.warn(`[PDF] Invalid profile data: name=${!!profile?.name}, planetaryPlacements=${Array.isArray(profile?.planetaryPlacements)}`);
      res.status(400).json({ success: false, error: 'Invalid profile data' });
      return;
    }

    const pdfBuffer = await generatePdf(profile);

    const elapsed = Date.now() - startTime;
    console.log(`[PDF] PDF generated in ${elapsed}ms, size=${pdfBuffer.length} bytes`);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Premium-Kundli-${profile.name.replace(/\s+/g, '-')}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
    console.log('[PDF] Response sent successfully');
  } catch (err) {
    const elapsed = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : '';
    console.error(`[PDF ERROR] (${elapsed}ms):`);
    console.error('  message:', errorMessage);
    console.error('  stack:', errorStack);
    console.error('  stringified:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

    res.status(500).json({
      success: false,
      error: errorMessage,
      ...(process.env.NODE_ENV !== 'production' ? { stack: errorStack } : {}),
    });
  }
});
