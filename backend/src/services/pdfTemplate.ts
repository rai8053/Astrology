import type { VedicProfile } from '../../../shared/types/api';

const GOLD = '#f59e0b';
const DARK = '#1e1e2e';
const MID = '#6b7280';
const LIGHT = '#b4b4c8';
const BG = '#faf8f5';

const PLANET_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  'Lagna (Ascendant)': { symbol: 'As', color: GOLD },
  'Moon (Chandra)': { symbol: 'Mo', color: '#a78bfa' },
  'Sun (Surya)': { symbol: 'Su', color: '#ef4444' },
  'Mercury (Budha)': { symbol: 'Me', color: '#10b981' },
  'Venus (Shukra)': { symbol: 'Ve', color: '#ec4899' },
  'Jupiter (Guru)': { symbol: 'Ju', color: '#f97316' },
  'Saturn (Shani)': { symbol: 'Sa', color: '#3b82f6' },
  'Mars (Mangal)': { symbol: 'Ma', color: '#dc2626' },
};

function buildChartSvg(profile: VedicProfile): string {
  const SIZE = 260;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 100;
  const CR = 32;

  type House = { a: number; label: string; placements: typeof profile.planetaryPlacements };
  const houses: House[] = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => ({
    a,
    label: String(i + 1),
    placements: [] as typeof profile.planetaryPlacements,
  }));

  profile.planetaryPlacements.forEach((p) => {
    const idx = Math.max(0, Math.min(11, p.house - 1));
    houses[idx]!.placements.push(p);
  });

  const lines = houses.map((h) => {
    const rad = ((h.a - 90) * Math.PI) / 180;
    const x1 = CX + CR * Math.cos(rad);
    const y1 = CY + CR * Math.sin(rad);
    const x2 = CX + R * Math.cos(rad);
    const y2 = CY + R * Math.sin(rad);
    return `    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GOLD}" stroke-opacity="0.25" stroke-width="1"/>`;
  }).join('\n');

  const labels = houses.map((h) => {
    const midRad = ((h.a + 15 - 90) * Math.PI) / 180;
    const lx = CX + (R + 14) * Math.cos(midRad);
    const ly = CY + (R + 14) * Math.sin(midRad);
    return `    <text x="${lx}" y="${ly}" text-anchor="middle" font-size="7" fill="${MID}" font-family="sans-serif" font-weight="bold">${h.label}</text>`;
  }).join('\n');

  const planets = houses.map((h) => {
    if (!h.placements.length) return '';
    const midRad = ((h.a + 15 - 90) * Math.PI) / 180;
    const pR = (R + CR) / 2;
    const count = h.placements.length;
    return h.placements.map((p, pi) => {
      const offset = count > 1 ? (pi - (count - 1) / 2) * 14 : 0;
      const perpRad = midRad + Math.PI / 2;
      const px = CX + pR * Math.cos(midRad) + offset * Math.cos(perpRad);
      const py = CY + pR * Math.sin(midRad) + offset * Math.sin(perpRad);
      const sym = PLANET_SYMBOLS[p.planet];
      if (!sym) return '';
      return [
        `    <circle cx="${px}" cy="${py}" r="7" fill="${sym.color}" fill-opacity="0.15"/>`,
        `    <text x="${px}" y="${py + 1.5}" text-anchor="middle" font-size="5" fill="${sym.color}" font-family="sans-serif" font-weight="bold">${sym.symbol}</text>`,
      ].join('\n');
    }).join('\n');
  }).join('\n');

  return `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <circle cx="${CX}" cy="${CY}" r="${R + 10}" fill="url(#chart-glow)"/>
    <circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="0.5"/>
    <circle cx="${CX}" cy="${CY}" r="${CR}" fill="none" stroke="${GOLD}" stroke-opacity="0.3" stroke-width="0.5"/>
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="${BG}" rx="8"/>
    <defs>
      <radialGradient id="chart-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
      </radialGradient>
    </defs>
${lines}
${labels}
    <text x="${CX}" y="${CY + 1.5}" text-anchor="middle" font-size="8" fill="${GOLD}" fill-opacity="0.5" font-family="sans-serif">As</text>
${planets}
  </svg>`;
}

function sectionHeader(title: string): string {
  return `<div style="display:flex;align-items:center;gap:10px;margin:24px 0 16px;border-bottom:1px solid ${GOLD}40;padding-bottom:8px;">
    <div style="width:4px;height:18px;background:${GOLD};border-radius:2px;flex-shrink:0"></div>
    <h2 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;color:${DARK};text-transform:uppercase;letter-spacing:0.05em">${title}</h2>
  </div>`;
}

function bodyHtml(content: string): string {
  return content.split('\n').map(line => {
    if (!line.trim()) return '<div style="height:6px"></div>';
    return `<p style="margin:0 0 6px;font-family:Noto Sans,Helvetica,Arial,sans-serif;font-size:10px;line-height:1.6;color:#374151">${escapeHtml(line)}</p>`;
  }).join('\n');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildReportHtml(profile: VedicProfile): string {
  const chartSvg = buildChartSvg(profile);

  const planetTableRows = profile.planetaryPlacements.map(p => {
    const sym = PLANET_SYMBOLS[p.planet];
    const dotColor = sym?.color || '#999';
    return `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:10px;color:${DARK}">
        <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${dotColor}20;color:${dotColor};text-align:center;font-size:7px;font-weight:700;line-height:16px;margin-right:6px">${sym?.symbol || '?'}</span>
        ${p.planet}
      </td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:10px;color:${MID}">${p.sign}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;">
        <span style="background:${GOLD}15;color:${GOLD};padding:1px 6px;border-radius:4px;font-size:9px;font-weight:700;font-family:monospace">${p.house}</span>
      </td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;font-size:9px;color:${MID}">${escapeHtml(p.description)}</td>
    </tr>`;
  }).join('\n');

  const strengthsHtml = (profile.strengths || []).map(s =>
    `<div style="display:flex;gap:8px;margin-bottom:6px;font-size:10px;color:#374151"><span style="color:${GOLD};flex-shrink:0;margin-top:1px">✦</span><span>${escapeHtml(s)}</span></div>`
  ).join('\n');

  const weaknessesHtml = (profile.weaknesses || []).map(w =>
    `<div style="display:flex;gap:8px;margin-bottom:6px;font-size:10px;color:#374151"><span style="color:#f472b6;flex-shrink:0;margin-top:1px">◈</span><span>${escapeHtml(w)}</span></div>`
  ).join('\n');

  const insightsHtml = (profile.insights || []).map(ins =>
    `<div style="margin-bottom:12px;break-inside:avoid">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <div style="width:3px;height:12px;background:${GOLD};border-radius:1.5px;flex-shrink:0"></div>
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:11px;font-weight:700;color:${DARK}">${ins.title}</span>
        <span style="margin-left:auto;font-size:10px;font-weight:700;color:${GOLD}">${ins.score}<span style="font-size:8px;color:${LIGHT}">/100</span></span>
      </div>
      <p style="margin:0 0 0 11px;font-size:9px;line-height:1.5;color:${MID}">${escapeHtml(ins.content)}</p>
    </div>`
  ).join('\n');

  const remediesHtml = (profile.remedies || []).map(rem =>
    `<div style="margin-bottom:8px;padding:8px 10px;background:#f9fafb;border-radius:6px;break-inside:avoid">
      <div style="font-size:10px;font-weight:700;color:${DARK};margin-bottom:2px">${escapeHtml(rem.title)}</div>
      <div style="font-size:9px;color:${MID};line-height:1.5">${escapeHtml(rem.description)}</div>
    </div>`
  ).join('\n');

  const transitHtml = (profile.transitTimeline || []).map(evt => {
    const impactColors: Record<string, string> = {
      positive: '#34d399',
      challenging: '#f87171',
      neutral: '#fbbf24',
    };
    const dotColor = impactColors[evt.impact] || MID;
    return `<div style="display:flex;gap:10px;margin-bottom:10px;break-inside:avoid">
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0"></div>
        <div style="width:1px;flex:1;background:#e5e7eb;min-height:20px"></div>
      </div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:2px">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:10px;font-weight:700;color:${DARK}">${escapeHtml(evt.title)}</span>
          <span style="font-size:8px;color:${LIGHT};white-space:nowrap">${evt.date}</span>
        </div>
        <p style="margin:0 0 4px;font-size:9px;color:${MID};line-height:1.5">${escapeHtml(evt.description)}</p>
        <span style="display:inline-block;font-size:7px;font-weight:700;text-transform:uppercase;padding:1px 4px;border-radius:3px;background:${dotColor}15;color:${dotColor}">${evt.impact}</span>
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Premium Birth Chart Report - ${escapeHtml(profile.name)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Noto+Sans:wght@400;700&display=swap');
  @page { margin: 0; size: A4; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Noto Sans', Helvetica, Arial, sans-serif; background: white; color: ${DARK}; }
  .page { width: 210mm; min-height: 297mm; padding: 0; position: relative; page-break-after: always; overflow: hidden; }
  .content { padding: 20px; }
  .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 297mm; background: ${BG}; }
  .footer { position: absolute; bottom: 10px; left: 20px; right: 20px; text-align: center; font-size: 7px; color: ${LIGHT}; border-top: 0.5px solid ${GOLD}; padding-top: 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 8px; font-size: 8px; font-weight: 700; color: ${MID}; text-transform: uppercase; letter-spacing: 0.1em; text-align: left; border-bottom: 1px solid ${GOLD}30; }
  .field-row { display: flex; padding: 5px 8px; font-size: 10px; }
  .field-row:nth-child(even) { background: #f9fafb; border-radius: 4px; }
  .field-label { width: 100px; color: ${MID}; font-weight: 700; flex-shrink: 0; }
  .field-value { color: ${DARK}; }
  .column-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: #f9fafb; border-radius: 8px; padding: 14px; margin-bottom: 14px; }
  .card-title { font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: ${DARK}; margin: 0 0 10px; display: flex; align-items: center; gap: 6px; }
  .lucky-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .lucky-item { background: #f9fafb; border-radius: 6px; padding: 10px; text-align: center; }
  .lucky-item .label { font-size: 8px; font-weight: 700; color: ${MID}; text-transform: uppercase; letter-spacing: 0.1em; }
  .lucky-item .value { font-size: 14px; font-weight: 700; color: ${GOLD}; margin-top: 4px; font-family: Georgia, 'Times New Roman', serif; }
  .info-text { font-size: 9px; color: ${LIGHT}; margin-top: 8px; }
</style>
</head>
<body>

<div class="page cover">
  <div style="position:absolute;top:0;left:0;right:0;height:5px;background:${GOLD}"></div>
  <div style="text-align:center;padding:0 40px">
    <div style="font-size:36px;font-weight:700;color:${GOLD};font-family:Georgia,'Times New Roman',serif;margin-bottom:4px">PREMIUM</div>
    <div style="font-size:24px;font-weight:700;color:${GOLD};font-family:Georgia,'Times New Roman',serif;margin-bottom:12px">Birth Chart Report</div>
    <div style="width:80px;height:2px;background:${GOLD};margin:0 auto 20px"></div>
    <div style="font-size:18px;font-weight:700;color:${DARK};font-family:Georgia,'Times New Roman',serif;margin-bottom:16px">${escapeHtml(profile.name)}</div>
    <div style="font-size:10px;color:${MID};line-height:2">
      <div>Date of Birth: ${profile.birthDate}</div>
      <div>Time of Birth: ${profile.birthTime}</div>
      <div>Place of Birth: ${escapeHtml(profile.birthPlace)}</div>
    </div>
    <div style="width:50px;height:1px;background:#d1d5db;margin:14px auto"></div>
    <div style="font-size:8px;color:${LIGHT}">Report Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
  </div>
  <div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:${GOLD};padding:10px 40px;border-radius:4px;text-align:center">
    <div style="font-size:12px;font-weight:700;color:white">Soma &amp; Surya</div>
    <div style="font-size:7px;color:rgba(255,255,255,0.8)">Enlighten Your Path</div>
  </div>
  <div style="position:absolute;bottom:0;left:0;right:0;height:5px;background:${GOLD}"></div>
</div>

<div class="page">
  <div class="content">
    ${sectionHeader('Executive Summary')}
    ${bodyHtml(`This comprehensive report provides a detailed analysis of your birth chart based on Vedic Astrology principles. The following insights combine traditional Jyotish wisdom with modern interpretation to offer guidance on your cosmic blueprint.`)}
    <div style="width:100%;height:1px;background:${GOLD}30;margin:8px 0"></div>
    <div style="display:flex;align-items:center;gap:8px;margin:10px 0 12px">
      <div style="width:4px;height:14px;background:${GOLD};border-radius:2px;flex-shrink:0"></div>
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;font-weight:700;color:${DARK}">Celestial Profile</div>
    </div>
    <div class="field-row"><span class="field-label">Moon Rashi</span><span class="field-value">${profile.rashi}</span></div>
    <div class="field-row"><span class="field-label">Western Equivalent</span><span class="field-value">${profile.westernSign}</span></div>
    <div class="field-row"><span class="field-label">Nakshatra</span><span class="field-value">${profile.nakshatra}</span></div>
    <div class="field-row"><span class="field-label">Nakshatra Lord</span><span class="field-value">${profile.nakshatraLord}</span></div>
    <div class="field-row"><span class="field-label">Ascendant</span><span class="field-value">${profile.lagna}</span></div>
    <div class="field-row"><span class="field-label">Rashi Lord</span><span class="field-value">${profile.rashiLord}</span></div>
    <div class="field-row"><span class="field-label">Element</span><span class="field-value">${profile.element}</span></div>
    <div class="field-row"><span class="field-label">Dosha Dominance</span><span class="field-value">${profile.doshaDominance}</span></div>
    <div style="width:100%;height:1px;background:${GOLD}30;margin:12px 0"></div>
    ${bodyHtml(profile.generalReading)}
  </div>
  <div class="footer">Premium Birth Chart Report | Confidential | Page 1/2</div>
</div>

<div class="page">
  <div class="content">
    ${sectionHeader('Birth Chart (Kundli)')}
    <div style="display:flex;justify-content:center;margin:8px 0">${chartSvg}</div>
    <div style="text-align:center;font-size:8px;color:${MID};margin-bottom:10px">North Indian chart style — House positions with planetary markers</div>
    <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:14px">
      ${Object.values(PLANET_SYMBOLS).map(p => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:7px;color:${MID}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;border:0.5px solid ${GOLD};text-align:center;font-size:5px;line-height:8px;font-weight:700;color:${GOLD}">${p.symbol}</span> ${p.symbol === 'As' ? 'Ascendant' : p.symbol === 'Mo' ? 'Moon' : p.symbol === 'Su' ? 'Sun' : p.symbol === 'Me' ? 'Mercury' : p.symbol === 'Ve' ? 'Venus' : p.symbol === 'Ju' ? 'Jupiter' : p.symbol === 'Sa' ? 'Saturn' : p.symbol === 'Ma' ? 'Mars' : ''}</span>`).join('')}
    </div>
    ${sectionHeader('Planetary Placements')}
    <p style="font-size:9px;color:${MID};margin:0 0 10px">The positions of planets in houses and signs at the time of your birth.</p>
    <table>
      <thead><tr><th>Planet</th><th>Sign</th><th>House</th><th>Interpretation</th></tr></thead>
      <tbody>${planetTableRows}</tbody>
    </table>
    ${sectionHeader('Strengths &amp; Challenges')}
    <div class="column-2">
      <div class="card">
        <div class="card-title"><span style="color:${GOLD}">✦</span> Your Strengths</div>
        ${strengthsHtml}
      </div>
      <div class="card">
        <div class="card-title"><span style="color:#f472b6">♥</span> Areas for Growth</div>
        ${weaknessesHtml}
      </div>
    </div>
    ${profile.insights.length ? sectionHeader('Life Area Insights') : ''}
    ${profile.insights.length ? `<div class="column-2">${insightsHtml}</div>` : ''}
  </div>
  <div class="footer">Premium Birth Chart Report | Confidential | Page 2/2</div>
</div>

<div class="page">
  <div class="content">
    ${profile.remedies.length ? sectionHeader('Remedies') : ''}
    ${profile.remedies.length ? `<p style="font-size:9px;color:${MID};margin:0 0 10px">Suggested remedies to balance planetary influences and enhance well-being.</p>` : ''}
    ${profile.remedies.length ? `<div class="column-2">${remediesHtml}</div>` : ''}
    ${sectionHeader('Lucky Elements')}
    <div class="lucky-grid">
      <div class="lucky-item"><div class="label">Lucky Number</div><div class="value">${profile.luckyNumber}</div></div>
      <div class="lucky-item"><div class="label">Lucky Color</div><div class="value">${profile.luckyColor}</div></div>
      <div class="lucky-item"><div class="label">Lucky Gemstone</div><div class="value">${profile.gemstone}</div></div>
    </div>
    <div class="info-text">Your element is ${profile.element}. Your dosha dominance is ${profile.doshaDominance}. Lucky color: ${profile.luckyColor}, Gemstone: ${profile.gemstone}.</div>
    ${profile.transitTimeline.length ? sectionHeader('Upcoming Transits') : ''}
    ${profile.transitTimeline.length ? '<p style="font-size:9px;color:' + MID + ';margin:0 0 10px">Significant planetary transits affecting your chart in the coming months.</p>' : ''}
    ${transitHtml}
  </div>
  <div class="footer">Premium Birth Chart Report | Confidential | Page 3/3</div>
</div>

</body>
</html>`;
}
