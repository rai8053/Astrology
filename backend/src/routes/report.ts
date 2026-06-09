import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { logger } from '../lib/logger.js';
import { generatePdf } from '../services/pdfGenerator.js';
import type { VedicProfile } from '../../../shared/types/api';

export const reportRouter = Router();

const pdfSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  planetaryPlacements: z.array(z.any()),
  strengths: z.array(z.any()).optional(),
});

reportRouter.post('/generate-pdf', authenticate, validate(pdfSchema), asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const profile = req.body as VedicProfile;

  logger.info({ name: profile.name, hasPlanetaryPlacements: Array.isArray(profile.planetaryPlacements), hasStrengths: Array.isArray(profile.strengths) }, 'PDF generation started');

  const pdfBuffer = await generatePdf(profile);

  const elapsed = Date.now() - startTime;
  logger.info({ elapsed, size: pdfBuffer.length }, 'PDF generated successfully');

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="Premium-Kundli-${profile.name.replace(/\s+/g, '-')}.pdf"`,
    'Content-Length': pdfBuffer.length.toString(),
  });
  res.send(pdfBuffer);
  logger.info({ elapsed }, 'PDF response sent');
}));
