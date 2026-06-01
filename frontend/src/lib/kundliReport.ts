import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { VedicProfile } from '@shared/types/api';
type Language = 'en' | 'hi' | 'bn' | 'es' | 'pt' | 'fr' | 'de' | 'ar' | 'ja' | 'zh';

import { translations } from './i18n/translations';

function t(key: string): string {
  let lang: Language = 'en';
  try { const raw = localStorage.getItem('lang'); if (raw) lang = JSON.parse(raw) as Language; } catch { /* fall back */ }
  const val = translations[lang]?.[key] || translations.en?.[key];
  return typeof val === 'string' ? val : key;
}

const GOLD: [number, number, number] = [245, 158, 11];
const DARK: [number, number, number] = [30, 30, 46];
const MID: [number, number, number] = [107, 114, 128];
const LIGHT: [number, number, number] = [180, 180, 200];
const BG: [number, number, number] = [250, 248, 245];
const WHITE: [number, number, number] = [255, 255, 255];

export function generatePremiumReport(profile: VedicProfile) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  const M = 20;
  const CW = W - M * 2;
  let y = M;

  const addFooter = () => {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.line(M, 282, W - M, 282);
      doc.setFontSize(6);
      doc.setTextColor(...LIGHT);
      doc.setFont('helvetica', 'normal');
      doc.text(`${t('report.title')} | ${t('report.confidential')} | ${t('report.pageOf').replace('{page}', String(i)).replace('{pages}', String(pages))}`, W / 2, 288, { align: 'center' });
      doc.text(t('report.generated').replace('{date}', new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })), W / 2, 292, { align: 'center' });
    }
  };

  const checkPage = (needed = 20) => {
    if (y > 275 - needed) { doc.addPage(); y = M; return true; }
    return false;
  };

  const sectionHeader = (title: string) => {
    checkPage(30);
    doc.setFillColor(...GOLD);
    doc.rect(M, y, 3, 14, 'F');
    doc.setTextColor(...DARK);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), M + 8, y + 10);
    y += 18;
  };

  const bodyText = (text: string, indent = 0, size = 9) => {
    doc.setFontSize(size);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, CW - indent);
    lines.forEach((line: string) => {
      checkPage(10);
      doc.text(line, M + indent, y);
      y += 4.5;
    });
    y += 2;
  };

  const divider = () => {
    y += 2;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.15);
    doc.line(M, y, W - M, y);
    y += 4;
  };

  const goldBar = (w: number, h: number) => {
    doc.setFillColor(...GOLD);
    doc.rect(M, y, w, h, 'F');
  };

  // ============ COVER PAGE ============
  doc.setFillColor(...BG);
  doc.rect(0, 0, W, 297, 'F');

  doc.setFillColor(...GOLD);
  doc.rect(0, 0, W, 4, 'F');

  doc.setTextColor(...GOLD);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.premium'), W / 2, 70, { align: 'center' });
  doc.setFontSize(28);
  doc.text(t('report.birthChartReport'), W / 2, 82, { align: 'center' });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 40, 90, W / 2 + 40, 90);

  doc.setTextColor(...DARK);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.name, W / 2, 108, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(...MID);
  doc.setFont('helvetica', 'normal');
  doc.text(`${t('report.dateOfBirth')}${profile.birthDate}`, W / 2, 120, { align: 'center' });
  doc.text(`${t('report.timeOfBirth')}${profile.birthTime}`, W / 2, 127, { align: 'center' });
  doc.text(`${t('report.placeOfBirth')}${profile.birthPlace}`, W / 2, 134, { align: 'center' });

  doc.setDrawColor(...MID);
  doc.setLineWidth(0.2);
  doc.line(W / 2 - 25, 142, W / 2 + 25, 142);

  doc.setFontSize(7);
  doc.setTextColor(...LIGHT);
  doc.text(`${t('report.reportGenerated')}${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, W / 2, 155, { align: 'center' });

  // Brand box bottom
  doc.setFillColor(...GOLD);
  doc.rect(W / 2 - 30, 240, 60, 18, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.brandName'), W / 2, 252, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(t('report.brandTagline'), W / 2, 258, { align: 'center' });

  doc.setFillColor(...GOLD);
  doc.rect(0, 293, W, 4, 'F');

  // ============ PAGE 2: EXECUTIVE SUMMARY ============
  doc.addPage();
  y = M;

  sectionHeader(t('report.executiveSummary'));

  const et = profile.element;
  const elementDesc: Record<string, string> = {
    Fire: t('report.elementFire'),
    Earth: t('report.elementEarth'),
    Air: t('report.elementAir'),
    Water: t('report.elementWater'),
  };

  bodyText(t('report.introParagraph'));
  divider();

  y += 2;
  goldBar(4, 14);
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.celestialProfile'), M + 8, y + 10);
  y += 16;

  const fields = [
    [t('report.moonRashi'), profile.rashi],
    [t('report.westernEquivalent'), profile.westernSign],
    [t('report.nakshatra'), profile.nakshatra],
    [t('report.nakshatraLord'), profile.nakshatraLord],
    [t('report.ascendant'), profile.lagna],
    [t('report.rashiLord'), profile.rashiLord],
    [t('report.element'), profile.element],
    [t('report.doshaDominance'), profile.doshaDominance],
  ];

  fields.forEach((item, i) => {
    checkPage(20);
    const bg: [number, number, number] | null = i % 2 === 0 ? [249, 250, 251] : null;
    if (bg) { doc.setFillColor(...bg); doc.rect(M, y - 3, CW, 9, 'F'); }
    doc.setFontSize(8);
    doc.setTextColor(...MID);
    doc.setFont('helvetica', 'bold');
    doc.text(item[0]!, M + 2, y + 2);
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(item[1]!, M + 60, y + 2);
    y += 9;
  });

  divider();
  bodyText(profile.generalReading);

  // ============ BIRTH CHART ============
  doc.addPage();
  y = M;
  sectionHeader(t('report.birthChart'));

  y += 2;
  const CX = W / 2;
  const CY = y + 55;
  const R = 50;
  const CR = 18;

  const placements = profile.planetaryPlacements;
  const houseLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const planetData: { symbol: string; name: string }[] = [];
  const knownPlanets: Record<string, { name: string; symbol: string }> = {
    'Lagna (Ascendant)': { name: 'Lagna (Ascendant)', symbol: 'As' },
    'Moon (Chandra)': { name: 'Moon (Chandra)', symbol: 'Mo' },
    'Sun (Surya)': { name: 'Sun (Surya)', symbol: 'Su' },
    'Mercury (Budha)': { name: 'Mercury (Budha)', symbol: 'Me' },
    'Venus (Shukra)': { name: 'Venus (Shukra)', symbol: 'Ve' },
    'Jupiter (Guru)': { name: 'Jupiter (Guru)', symbol: 'Ju' },
    'Saturn (Shani)': { name: 'Saturn (Shani)', symbol: 'Sa' },
    'Mars (Mangal)': { name: 'Mars (Mangal)', symbol: 'Ma' },
  };

  // Draw chart
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.circle(CX, CY, R + 8, 'D');
  doc.circle(CX, CY, R, 'D');
  doc.circle(CX, CY, CR, 'D');

  angles.forEach((deg) => {
    const rad = (deg - 90) * Math.PI / 180;
    doc.line(
      CX + CR * Math.cos(rad), CY + CR * Math.sin(rad),
      CX + R * Math.cos(rad), CY + R * Math.sin(rad),
    );
  });

  // House numbers
  angles.forEach((deg, i) => {
    const rad = (deg + 15 - 90) * Math.PI / 180;
    doc.setFontSize(5);
    doc.setTextColor(...MID);
    doc.text(houseLabels[i]!, CX + (R + 14) * Math.cos(rad), CY + (R + 14) * Math.sin(rad), { align: 'center' });
  });

  // "As" in center
  doc.setFontSize(6);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text('As', CX, CY + 1.5, { align: 'center' });

  // Planets
  placements.forEach((p) => {
    const known = knownPlanets[p.planet];
    if (!known) return;
    const idx = Math.max(0, Math.min(11, p.house - 1));
    const midRad = (angles[idx]! + 15 - 90) * Math.PI / 180;
    const pR = (R + CR) / 2;
    let px = CX + pR * Math.cos(midRad);
    let py = CY + pR * Math.sin(midRad);

    // Offset multiple planets in same house
    const sameHouse = placements.filter((pp, pi) => pp.house === p.house && pi < placements.indexOf(p));
    const offset = sameHouse.length * 5;
    if (sameHouse.length > 0) {
      const perpRad = midRad + Math.PI / 2;
      px += offset * Math.cos(perpRad);
      py += offset * Math.sin(perpRad);
    }

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.15);
    doc.circle(px, py, 3, 'D');
    doc.setFontSize(4);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text(known.symbol, px, py + 1, { align: 'center' });
  });

  y = CY + R + 20;

  doc.setFontSize(7);
  doc.setTextColor(...MID);
  doc.setFont('helvetica', 'normal');
  doc.text(t('report.chartDescription'), W / 2, y, { align: 'center' });
  y += 8;

  // Planet key
  doc.setFontSize(6);
  doc.setTextColor(...DARK);
  const legendItems = Object.values(knownPlanets);
  const maxPerRow = 4;
  for (let i = 0; i < legendItems.length; i += maxPerRow) {
    const row = legendItems.slice(i, i + maxPerRow);
    const startX = W / 2 - (row.length * 35) / 2;
    row.forEach((item, j) => {
      const lx = startX + j * 35;
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.1);
      doc.circle(lx, y - 1, 1.5, 'D');
      doc.text(item.symbol, lx, y + 1, { align: 'center' });
      doc.text(item.name.split(' (')[0]!, lx + 6, y, { align: 'left' });
    });
    y += 6;
  }

  // ============ PLANETARY PLACEMENTS ============
  y += 4;
  checkPage(40);
  sectionHeader(t('report.planetaryPlacements'));
  bodyText(t('report.planetaryDesc'));

  const tableData = placements.map((p) => [p.planet, p.sign, t('report.houseLabel').replace('{number}', String(p.house)), p.description]);
  (doc as any).autoTable({
    startY: y + 2,
    head: [[t('report.planet'), t('report.sign'), t('report.houseLabel'), t('report.interpretation')]],
    body: tableData,
    margin: { left: M, right: M },
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: GOLD, textColor: WHITE, fontStyle: 'bold', fontSize: 7 },
    columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 28 }, 2: { cellWidth: 16 }, 3: { cellWidth: 'auto' } },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ============ YOGAS & DASHA ============
  checkPage(40);
  sectionHeader(t('report.yogasDasha'));

  const yogaCandidates = [
    { name: 'Gajakesari Yoga', condition: 'Jupiter and Moon in same quadrant', present: placements.some(p => p.planet.includes('Jupiter') && p.house >= 1) },
    { name: 'Budha-Aditya Yoga', condition: 'Sun and Mercury in same house', present: true },
    { name: 'Dhana Yoga', condition: 'Lords of 2nd, 5th, 9th, 11th houses in Kendra/Kona', present: true },
  ];

  bodyText(t('report.yogasDesc'), 0, 8);

  yogaCandidates.forEach((yoga) => {
    checkPage(15);
    const status = yoga.present ? t('report.present') : t('report.notFormed');
    doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text(yoga.name, M + 2, y);
    doc.setFontSize(6);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(`${yoga.condition} — ${status}`, M + 55, y);
    y += 6;
  });

  y += 4;
  bodyText(t('report.dashaPeriods'));
  bodyText(t('report.dashaBasedOn').replace('{nakshatra}', profile.nakshatra).replace('{lord}', profile.nakshatraLord));

  // ============ STRENGTHS & CHALLENGES ============
  checkPage(40);
  sectionHeader(t('report.strengths'));

  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.yourStrengths'), M, y);
  y += 7;

  profile.strengths.forEach((s, i) => {
    checkPage(10);
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(`✦ ${s}`, M + 2, y);
    y += 5;
  });

  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.setFont('helvetica', 'bold');
  doc.text(t('report.areasForGrowth'), M, y);
  y += 7;

  profile.weaknesses.forEach((w) => {
    checkPage(10);
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.setFont('helvetica', 'normal');
    doc.text(`◈ ${w}`, M + 2, y);
    y += 5;
  });

  // ============ LIFE AREA INSIGHTS ============
  checkPage(40);
  sectionHeader(t('report.lifeAreaInsights'));

  if (profile.insights?.length) {
    profile.insights.forEach((ins) => {
      checkPage(25);
      doc.setFillColor(...GOLD);
      doc.rect(M, y - 2, 2, 12, 'F');
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ins.title}`, M + 6, y + 2);
      doc.setFontSize(7);
      doc.setTextColor(...MID);
      doc.setFont('helvetica', 'normal');
      doc.text(t('report.score').replace('{score}', String(ins.score)), M + 60, y + 2);
      y += 7;
      bodyText(ins.content, 4, 7);
      y += 2;
    });
  }

  // ============ REMEDIES ============
  checkPage(40);
  sectionHeader(t('report.remedies'));
  bodyText(t('report.remediesDesc'));

  if (profile.remedies?.length) {
    profile.remedies.forEach((rem) => {
      checkPage(20);
      doc.setFillColor(245, 158, 11, 0.12 as any);
      doc.rect(M, y - 2, CW, 14, 'F');
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(rem.title, M + 3, y + 3);
      doc.setFontSize(7);
      doc.setTextColor(...MID);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(rem.description, CW - 6);
      doc.text(descLines as string[], M + 3, y + 8);
      y += 16;
    });
  }

  // ============ LUCKY ELEMENTS ============
  checkPage(40);
  sectionHeader(t('report.luckyElements'));

  const luckyItems = [
    { label: t('report.luckyNumber'), value: String(profile.luckyNumber) },
    { label: t('report.luckyColor'), value: profile.luckyColor },
    { label: t('report.luckyGemstone'), value: profile.gemstone },
  ];

  luckyItems.forEach((item, i) => {
    checkPage(15);
    const bg: [number, number, number] | null = i % 2 === 0 ? [249, 250, 251] : null;
    if (bg) { doc.setFillColor(...bg); doc.rect(M, y - 2, CW, 10, 'F'); }
    doc.setFontSize(8);
    doc.setTextColor(...MID);
    doc.setFont('helvetica', 'bold');
    doc.text(item.label, M + 4, y + 3);
    doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, M + 75, y + 3);
    y += 10;
  });

  // ============ TRANSIT TIMELINE ============
  if (profile.transitTimeline?.length) {
    checkPage(40);
    sectionHeader(t('report.upcomingTransits'));
    bodyText(t('report.transitsDesc'), 0, 8);

    profile.transitTimeline.forEach((t) => {
      checkPage(18);
      const impactColor: [number, number, number] = t.impact === 'positive' ? [52, 211, 153] : t.impact === 'challenging' ? [248, 113, 113] : [251, 191, 36];
      doc.setFillColor(...impactColor);
      doc.circle(M + 3, y + 2, 1.5, 'F');

      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.setFont('helvetica', 'bold');
      doc.text(t.title, M + 9, y + 2);
      doc.setFontSize(6);
      doc.setTextColor(...MID);
      doc.setFont('helvetica', 'normal');
      doc.text(t.date, M + 80, y + 2);
      y += 5;
      doc.setFontSize(7);
      doc.setTextColor(...MID);
      doc.text(doc.splitTextToSize(t.description, CW - 12) as string[], M + 9, y);
      y += 7;
    });
  }

  // ============ PAGE NUMBERS & FOOTER ============
  addFooter();

  doc.save(`Premium-Kundli-${profile.name.replace(/\s+/g, '-')}.pdf`);
}
