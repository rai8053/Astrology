import { Router } from 'express';
import { generatePdf } from '../services/pdfGenerator.js';
import type { VedicProfile } from '../../../shared/types/api';

export const reportRouter = Router();

reportRouter.post('/generate-pdf', async (req, res) => {
  try {
    const profile = req.body as VedicProfile;

    if (!profile?.name || !profile?.planetaryPlacements) {
      res.status(400).json({ success: false, error: 'Invalid profile data' });
      return;
    }

    const pdfBuffer = await generatePdf(profile);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Premium-Kundli-${profile.name.replace(/\s+/g, '-')}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('[PDF] Generation failed:', err);
    res.status(500).json({ success: false, error: 'PDF generation failed' });
  }
});
