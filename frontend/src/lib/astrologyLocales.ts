import { useI18nStore } from './i18n/store';

const ZODIAC: Record<string, Record<string, string>> = {
  en: { Mesh: 'Aries', Vrishabh: 'Taurus', Mithun: 'Gemini', Kark: 'Cancer', Simha: 'Leo', Kanya: 'Virgo', Tula: 'Libra', Vrishchik: 'Scorpio', Dhanu: 'Sagittarius', Makar: 'Capricorn', Kumbha: 'Aquarius', Meen: 'Pisces' },
  hi: { Mesh: 'मेष', Vrishabh: 'वृषभ', Mithun: 'मिथुन', Kark: 'कर्क', Simha: 'सिंह', Kanya: 'कन्या', Tula: 'तुला', Vrishchik: 'वृश्चिक', Dhanu: 'धनु', Makar: 'मकर', Kumbha: 'कुंभ', Meen: 'मीन' },
  bn: { Mesh: 'মেষ', Vrishabh: 'বৃষ', Mithun: 'মিথুন', Kark: 'কর্কট', Simha: 'সিংহ', Kanya: 'কন্যা', Tula: 'তুলা', Vrishchik: 'বৃশ্চিক', Dhanu: 'ধনু', Makar: 'মকর', Kumbha: 'কুম্ভ', Meen: 'মীন' },
  es: { Mesh: 'Aries', Vrishabh: 'Tauro', Mithun: 'Géminis', Kark: 'Cáncer', Simha: 'Leo', Kanya: 'Virgo', Tula: 'Libra', Vrishchik: 'Escorpio', Dhanu: 'Sagitario', Makar: 'Capricornio', Kumbha: 'Acuario', Meen: 'Piscis' },
  pt: { Mesh: 'Áries', Vrishabh: 'Touro', Mithun: 'Gêmeos', Kark: 'Câncer', Simha: 'Leão', Kanya: 'Virgem', Tula: 'Libra', Vrishchik: 'Escorpião', Dhanu: 'Sagitário', Makar: 'Capricórnio', Kumbha: 'Aquário', Meen: 'Peixes' },
  fr: { Mesh: 'Bélier', Vrishabh: 'Taureau', Mithun: 'Gémeaux', Kark: 'Cancer', Simha: 'Lion', Kanya: 'Vierge', Tula: 'Balance', Vrishchik: 'Scorpion', Dhanu: 'Sagittaire', Makar: 'Capricorne', Kumbha: 'Verseau', Meen: 'Poissons' },
  de: { Mesh: 'Widder', Vrishabh: 'Stier', Mithun: 'Zwillinge', Kark: 'Krebs', Simha: 'Löwe', Kanya: 'Jungfrau', Tula: 'Waage', Vrishchik: 'Skorpion', Dhanu: 'Schütze', Makar: 'Steinbock', Kumbha: 'Wassermann', Meen: 'Fische' },
  ar: { Mesh: 'الحمل', Vrishabh: 'الثور', Mithun: 'الجوزاء', Kark: 'السرطان', Simha: 'الأسد', Kanya: 'العذراء', Tula: 'الميزان', Vrishchik: 'العقرب', Dhanu: 'القوس', Makar: 'الجدي', Kumbha: 'الدلو', Meen: 'الحوت' },
  ja: { Mesh: '牡羊座', Vrishabh: '牡牛座', Mithun: '双子座', Kark: '蟹座', Simha: '獅子座', Kanya: '乙女座', Tula: '天秤座', Vrishchik: '蠍座', Dhanu: '射手座', Makar: '山羊座', Kumbha: '水瓶座', Meen: '魚座' },
  zh: { Mesh: '白羊座', Vrishabh: '金牛座', Mithun: '双子座', Kark: '巨蟹座', Simha: '狮子座', Kanya: '处女座', Tula: '天秤座', Vrishchik: '天蝎座', Dhanu: '射手座', Makar: '摩羯座', Kumbha: '水瓶座', Meen: '双鱼座' },
};

const PLANETS: Record<string, Record<string, string>> = {
  en: { Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' },
  hi: { Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' },
  bn: { Sun: 'সূর্য', Moon: 'চন্দ্র', Mars: 'মঙ্গল', Mercury: 'বুধ', Jupiter: 'গুরু', Venus: 'শুক্র', Saturn: 'শনি', Rahu: 'রাহু', Ketu: 'কেতু' },
  es: { Sun: 'Sol', Moon: 'Luna', Mars: 'Marte', Mercury: 'Mercurio', Jupiter: 'Júpiter', Venus: 'Venus', Saturn: 'Saturno', Rahu: 'Rahu', Ketu: 'Ketu' },
  pt: { Sun: 'Sol', Moon: 'Lua', Mars: 'Marte', Mercury: 'Mercúrio', Jupiter: 'Júpiter', Venus: 'Vênus', Saturn: 'Saturno', Rahu: 'Rahu', Ketu: 'Ketu' },
  fr: { Sun: 'Soleil', Moon: 'Lune', Mars: 'Mars', Mercury: 'Mercure', Jupiter: 'Jupiter', Venus: 'Vénus', Saturn: 'Saturne', Rahu: 'Rahu', Ketu: 'Ketu' },
  de: { Sun: 'Sonne', Moon: 'Mond', Mars: 'Mars', Mercury: 'Merkur', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' },
  ar: { Sun: 'الشمس', Moon: 'القمر', Mars: 'المريخ', Mercury: 'عطارد', Jupiter: 'المشتري', Venus: 'الزهرة', Saturn: 'زحل', Rahu: 'راهو', Ketu: 'كيتو' },
  ja: { Sun: '太陽', Moon: '月', Mars: '火星', Mercury: '水星', Jupiter: '木星', Venus: '金星', Saturn: '土星', Rahu: 'ラーフ', Ketu: 'ケートゥ' },
  zh: { Sun: '太阳', Moon: '月亮', Mars: '火星', Mercury: '水星', Jupiter: '木星', Venus: '金星', Saturn: '土星', Rahu: '罗睺', Ketu: '计都' },
};

const ELEMENTS: Record<string, Record<string, string>> = {
  en: { Fire: 'Fire', Earth: 'Earth', Air: 'Air', Water: 'Water' },
  hi: { Fire: 'अग्नि', Earth: 'पृथ्वी', Air: 'वायु', Water: 'जल' },
  bn: { Fire: 'অগ্নি', Earth: 'পৃথিবী', Air: 'বায়ু', Water: 'জল' },
  es: { Fire: 'Fuego', Earth: 'Tierra', Air: 'Aire', Water: 'Agua' },
  pt: { Fire: 'Fogo', Earth: 'Terra', Air: 'Ar', Water: 'Água' },
  fr: { Fire: 'Feu', Earth: 'Terre', Air: 'Air', Water: 'Eau' },
  de: { Fire: 'Feuer', Earth: 'Erde', Air: 'Luft', Water: 'Wasser' },
  ar: { Fire: 'النار', Earth: 'الأرض', Air: 'الهواء', Water: 'الماء' },
  ja: { Fire: '火', Earth: '地', Air: '風', Water: '水' },
  zh: { Fire: '火', Earth: '土', Air: '风', Water: '水' },
};

const ENERGY_LEVELS: Record<string, Record<string, string>> = {
  en: { Excellent: 'Excellent', High: 'High', Moderate: 'Moderate', Low: 'Low' },
  hi: { Excellent: 'उत्कृष्ट', High: 'उच्च', Moderate: 'मध्यम', Low: 'निम्न' },
  bn: { Excellent: 'উত্তম', High: 'উচ্চ', Moderate: 'মাঝারি', Low: 'নিম্ন' },
  es: { Excellent: 'Excelente', High: 'Alto', Moderate: 'Moderado', Low: 'Bajo' },
  pt: { Excellent: 'Excelente', High: 'Alto', Moderate: 'Moderado', Low: 'Baixo' },
  fr: { Excellent: 'Excellent', High: 'Élevé', Moderate: 'Modéré', Low: 'Faible' },
  de: { Excellent: 'Hervorragend', High: 'Hoch', Moderate: 'Mäßig', Low: 'Niedrig' },
  ar: { Excellent: 'ممتاز', High: 'عالٍ', Moderate: 'معتدل', Low: 'منخفض' },
  ja: { Excellent: '素晴らしい', High: '高い', Moderate: '中程度', Low: '低い' },
  zh: { Excellent: '极佳', High: '高', Moderate: '中等', Low: '低' },
};

const IMPACTS: Record<string, Record<string, string>> = {
  en: { Positive: 'Positive', Neutral: 'Neutral', Challenging: 'Challenging' },
  hi: { Positive: 'सकारात्मक', Neutral: 'तटस्थ', Challenging: 'चुनौतीपूर्ण' },
  bn: { Positive: 'ইতিবাচক', Neutral: 'নিরপেক্ষ', Challenging: 'চ্যালেঞ্জিং' },
  es: { Positive: 'Positivo', Neutral: 'Neutral', Challenging: 'Desafiante' },
  pt: { Positive: 'Positivo', Neutral: 'Neutro', Challenging: 'Desafiador' },
  fr: { Positive: 'Positif', Neutral: 'Neutre', Challenging: 'Difficile' },
  de: { Positive: 'Positiv', Neutral: 'Neutral', Challenging: 'Herausfordernd' },
  ar: { Positive: 'إيجابي', Neutral: 'محايد', Challenging: 'صعب' },
  ja: { Positive: 'ポジティブ', Neutral: '中立', Challenging: '挑戦的' },
  zh: { Positive: '积极', Neutral: '中立', Challenging: '挑战' },
};

const SCORE_CATEGORIES: Record<string, Record<string, string>> = {
  en: { Love: 'Love', Career: 'Career', Health: 'Health', Finance: 'Finance', Spirit: 'Spirit' },
  hi: { Love: 'प्रेम', Career: 'करियर', Health: 'स्वास्थ्य', Finance: 'वित्त', Spirit: 'आध्यात्म' },
  bn: { Love: 'প্রেম', Career: 'ক্যারিয়ার', Health: 'স্বাস্থ্য', Finance: 'অর্থ', Spirit: 'আধ্যাত্মিক' },
  es: { Love: 'Amor', Career: 'Carrera', Health: 'Salud', Finance: 'Finanzas', Spirit: 'Espíritu' },
  pt: { Love: 'Amor', Career: 'Carreira', Health: 'Saúde', Finance: 'Finanças', Spirit: 'Espírito' },
  fr: { Love: 'Amour', Career: 'Carrière', Health: 'Santé', Finance: 'Finances', Spirit: 'Esprit' },
  de: { Love: 'Liebe', Career: 'Karriere', Health: 'Gesundheit', Finance: 'Finanzen', Spirit: 'Geist' },
  ar: { Love: 'الحب', Career: 'المهنة', Health: 'الصحة', Finance: 'المالية', Spirit: 'الروح' },
  ja: { Love: '愛', Career: 'キャリア', Health: '健康', Finance: '財務', Spirit: '精神' },
  zh: { Love: '爱情', Career: '事业', Health: '健康', Finance: '财务', Spirit: '精神' },
};

const MOON_PHASES: Record<string, Record<string, string>> = {
  en: { NewMoon: 'New Moon', WaxingCrescent: 'Waxing Crescent', FirstQuarter: 'First Quarter', WaxingGibbous: 'Waxing Gibbous', FullMoon: 'Full Moon', WaningGibbous: 'Waning Gibbous', ThirdQuarter: 'Third Quarter', WaningCrescent: 'Waning Crescent' },
  hi: { NewMoon: 'अमावस्या', WaxingCrescent: 'शुक्ल प्रतिपदा', FirstQuarter: 'शुक्ल सप्तमी', WaxingGibbous: 'शुक्ल दशमी', FullMoon: 'पूर्णिमा', WaningGibbous: 'कृष्ण दशमी', ThirdQuarter: 'कृष्ण सप्तमी', WaningCrescent: 'कृष्ण प्रतिपदा' },
  bn: { NewMoon: 'অমাবস্যা', WaxingCrescent: 'শুক্ল প্রতিপদ', FirstQuarter: 'শুক্ল সপ্তমী', WaxingGibbous: 'শুক্ল দশমী', FullMoon: 'পূর্ণিমা', WaningGibbous: 'কৃষ্ণ দশমী', ThirdQuarter: 'কৃষ্ণ সপ্তমী', WaningCrescent: 'কৃষ্ণ প্রতিপদ' },
  es: { NewMoon: 'Luna Nueva', WaxingCrescent: 'Creciente', FirstQuarter: 'Cuarto Creciente', WaxingGibbous: 'Gibosa Creciente', FullMoon: 'Luna Llena', WaningGibbous: 'Gibosa Menguante', ThirdQuarter: 'Cuarto Menguante', WaningCrescent: 'Menguante' },
  pt: { NewMoon: 'Lua Nova', WaxingCrescent: 'Crescente', FirstQuarter: 'Quarto Crescente', WaxingGibbous: 'Crescente Gibosa', FullMoon: 'Lua Cheia', WaningGibbous: 'Minguante Gibosa', ThirdQuarter: 'Quarto Minguante', WaningCrescent: 'Minguante' },
  fr: { NewMoon: 'Nouvelle Lune', WaxingCrescent: 'Croissant', FirstQuarter: 'Premier Quartier', WaxingGibbous: 'Gibbeuse Croissante', FullMoon: 'Pleine Lune', WaningGibbous: 'Gibbeuse Décroissante', ThirdQuarter: 'Dernier Quartier', WaningCrescent: 'Croissant Décroissant' },
  de: { NewMoon: 'Neumond', WaxingCrescent: 'Zunehmende Sichel', FirstQuarter: 'Erstes Viertel', WaxingGibbous: 'Zunehmender Mond', FullMoon: 'Vollmond', WaningGibbous: 'Abnehmender Mond', ThirdQuarter: 'Letztes Viertel', WaningCrescent: 'Abnehmende Sichel' },
  ar: { NewMoon: 'محاق', WaxingCrescent: 'هلال متزايد', FirstQuarter: 'الربع الأول', WaxingGibbous: 'أحدب متزايد', FullMoon: 'بدر', WaningGibbous: 'أحدب متناقص', ThirdQuarter: 'الربع الأخير', WaningCrescent: 'هلال متناقص' },
  ja: { NewMoon: '新月', WaxingCrescent: '三日月', FirstQuarter: '上弦の月', WaxingGibbous: '満ちていく月', FullMoon: '満月', WaningGibbous: '欠けていく月', ThirdQuarter: '下弦の月', WaningCrescent: '細い月' },
  zh: { NewMoon: '新月', WaxingCrescent: '蛾眉月', FirstQuarter: '上弦月', WaxingGibbous: '盈凸月', FullMoon: '满月', WaningGibbous: '亏凸月', ThirdQuarter: '下弦月', WaningCrescent: '残月' },
};

const PAKSHA: Record<string, Record<string, string>> = {
  en: { ShuklaPaksha: 'Shukla Paksha', KrishnaPaksha: 'Krishna Paksha' },
  hi: { ShuklaPaksha: 'शुक्ल पक्ष', KrishnaPaksha: 'कृष्ण पक्ष' },
  bn: { ShuklaPaksha: 'শুক্ল পক্ষ', KrishnaPaksha: 'কৃষ্ণ পক্ষ' },
  es: { ShuklaPaksha: 'Shukla Paksha', KrishnaPaksha: 'Krishna Paksha' },
  pt: { ShuklaPaksha: 'Shukla Paksha', KrishnaPaksha: 'Krishna Paksha' },
  fr: { ShuklaPaksha: 'Shukla Paksha', KrishnaPaksha: 'Krishna Paksha' },
  de: { ShuklaPaksha: 'Shukla Paksha', KrishnaPaksha: 'Krishna Paksha' },
  ar: { ShuklaPaksha: 'شوكلا باكشا', KrishnaPaksha: 'كريشنا باكشا' },
  ja: { ShuklaPaksha: 'シュクラ・パクシャ', KrishnaPaksha: 'クリシュナ・パクシャ' },
  zh: { ShuklaPaksha: '白半月', KrishnaPaksha: '黑半月' },
};

const DOSHAS: Record<string, Record<string, string>> = {
  en: { Vata: 'Vata', Pitta: 'Pitta', Kapha: 'Kapha', VataPitta: 'Vata-Pitta', KaphaVata: 'Kapha-Vata' },
  hi: { Vata: 'वात', Pitta: 'पित्त', Kapha: 'कफ', VataPitta: 'वात-पित्त', KaphaVata: 'कफ-वात' },
  bn: { Vata: 'বাত', Pitta: 'পিত্ত', Kapha: 'কফ', VataPitta: 'বাত-পিত্ত', KaphaVata: 'কফ-বাত' },
  es: { Vata: 'Vata', Pitta: 'Pitta', Kapha: 'Kapha', VataPitta: 'Vata-Pitta', KaphaVata: 'Kapha-Vata' },
  pt: { Vata: 'Vata', Pitta: 'Pitta', Kapha: 'Kapha', VataPitta: 'Vata-Pitta', KaphaVata: 'Kapha-Vata' },
  fr: { Vata: 'Vata', Pitta: 'Pitta', Kapha: 'Kapha', VataPitta: 'Vata-Pitta', KaphaVata: 'Kapha-Vata' },
  de: { Vata: 'Vata', Pitta: 'Pitta', Kapha: 'Kapha', VataPitta: 'Vata-Pitta', KaphaVata: 'Kapha-Vata' },
  ar: { Vata: 'فاتا', Pitta: 'بيتا', Kapha: 'كافا', VataPitta: 'فاتا-بيتا', KaphaVata: 'كافا-فاتا' },
  ja: { Vata: 'ヴァータ', Pitta: 'ピッタ', Kapha: 'カパ', VataPitta: 'ヴァータ・ピッタ', KaphaVata: 'カパ・ヴァータ' },
  zh: { Vata: '风型', Pitta: '火型', Kapha: '水型', VataPitta: '风火型', KaphaVata: '水风型' },
};

const NAKSHATRAS: Record<string, Record<string, string>> = {
  en: { Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini', Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya', Ashlesha: 'Ashlesha', Magha: 'Magha', PurvaPhalguni: 'Purva Phalguni', UttaraPhalguni: 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati', Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula', PurvaAshadha: 'Purva Ashadha', UttaraAshadha: 'Uttara Ashadha', Shravana: 'Shravana', Dhanishta: 'Dhanishta', Shatabhisha: 'Shatabhisha', PurvaBhadrapada: 'Purva Bhadrapada', UttaraBhadrapada: 'Uttara Bhadrapada', Revati: 'Revati' },
  hi: { Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी', Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा', Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य', Ashlesha: 'आश्लेषा', Magha: 'मघा', PurvaPhalguni: 'पूर्व फाल्गुनी', UttaraPhalguni: 'उत्तर फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाति', Vishakha: 'विशाखा', Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल', PurvaAshadha: 'पूर्वाषाढ़ा', UttaraAshadha: 'उत्तराषाढ़ा', Shravana: 'श्रवण', Dhanishta: 'धनिष्ठा', Shatabhisha: 'शतभिषा', PurvaBhadrapada: 'पूर्व भाद्रपद', UttaraBhadrapada: 'उत्तर भाद्रपद', Revati: 'रेवती' },
  bn: { Ashwini: 'অশ্বিনী', Bharani: 'ভরণী', Krittika: 'কৃত্তিকা', Rohini: 'রোহিণী', Mrigashira: 'মৃগশিরা', Ardra: 'আর্দ্রা', Punarvasu: 'পুনর্বসু', Pushya: 'পুষ্যা', Ashlesha: 'আশ্লেষা', Magha: 'মঘা', PurvaPhalguni: 'পূর্ব ফাল্গুনী', UttaraPhalguni: 'উত্তর ফাল্গুনী', Hasta: 'হস্ত', Chitra: 'চিত্রা', Swati: 'স্বাতী', Vishakha: 'বিশাখা', Anuradha: 'অনুরাধা', Jyeshtha: 'জ্যেষ্ঠা', Mula: 'মূল', PurvaAshadha: 'পূর্বাষাঢ়া', UttaraAshadha: 'উত্তরাষাঢ়া', Shravana: 'শ্রবণা', Dhanishta: 'ধনিষ্ঠা', Shatabhisha: 'শতভিষা', PurvaBhadrapada: 'পূর্ব ভাদ্রপদ', UttaraBhadrapada: 'উত্তর ভাদ্রপদ', Revati: 'রেবতী' },
  es: { Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini', Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya', Ashlesha: 'Ashlesha', Magha: 'Magha', PurvaPhalguni: 'Purva Phalguni', UttaraPhalguni: 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati', Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula', PurvaAshadha: 'Purva Ashadha', UttaraAshadha: 'Uttara Ashadha', Shravana: 'Shravana', Dhanishta: 'Dhanishta', Shatabhisha: 'Shatabhisha', PurvaBhadrapada: 'Purva Bhadrapada', UttaraBhadrapada: 'Uttara Bhadrapada', Revati: 'Revati' },
  pt: { Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini', Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya', Ashlesha: 'Ashlesha', Magha: 'Magha', PurvaPhalguni: 'Purva Phalguni', UttaraPhalguni: 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati', Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula', PurvaAshadha: 'Purva Ashadha', UttaraAshadha: 'Uttara Ashadha', Shravana: 'Shravana', Dhanishta: 'Dhanishta', Shatabhisha: 'Shatabhisha', PurvaBhadrapada: 'Purva Bhadrapada', UttaraBhadrapada: 'Uttara Bhadrapada', Revati: 'Revati' },
  fr: { Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini', Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya', Ashlesha: 'Ashlesha', Magha: 'Magha', PurvaPhalguni: 'Purva Phalguni', UttaraPhalguni: 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati', Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula', PurvaAshadha: 'Purva Ashadha', UttaraAshadha: 'Uttara Ashadha', Shravana: 'Shravana', Dhanishta: 'Dhanishta', Shatabhisha: 'Shatabhisha', PurvaBhadrapada: 'Purva Bhadrapada', UttaraBhadrapada: 'Uttara Bhadrapada', Revati: 'Revati' },
  de: { Ashwini: 'Ashwini', Bharani: 'Bharani', Krittika: 'Krittika', Rohini: 'Rohini', Mrigashira: 'Mrigashira', Ardra: 'Ardra', Punarvasu: 'Punarvasu', Pushya: 'Pushya', Ashlesha: 'Ashlesha', Magha: 'Magha', PurvaPhalguni: 'Purva Phalguni', UttaraPhalguni: 'Uttara Phalguni', Hasta: 'Hasta', Chitra: 'Chitra', Swati: 'Swati', Vishakha: 'Vishakha', Anuradha: 'Anuradha', Jyeshtha: 'Jyeshtha', Mula: 'Mula', PurvaAshadha: 'Purva Ashadha', UttaraAshadha: 'Uttara Ashadha', Shravana: 'Shravana', Dhanishta: 'Dhanishta', Shatabhisha: 'Shatabhisha', PurvaBhadrapada: 'Purva Bhadrapada', UttaraBhadrapada: 'Uttara Bhadrapada', Revati: 'Revati' },
  ar: { Ashwini: 'أشفيني', Bharani: 'بهاراني', Krittika: 'كريتيكا', Rohini: 'روهيني', Mrigashira: 'مريغاشيرا', Ardra: 'أردرا', Punarvasu: 'بونارفاسو', Pushya: 'بوشيا', Ashlesha: 'أاشليشا', Magha: 'ماغا', PurvaPhalguni: 'بورفا فالغوني', UttaraPhalguni: 'أوتارا فالغوني', Hasta: 'هاستا', Chitra: 'شيترا', Swati: 'سواتي', Vishakha: 'فيشاكا', Anuradha: 'أنورادها', Jyeshtha: 'جاييشثا', Mula: 'مولا', PurvaAshadha: 'بورفا آشادها', UttaraAshadha: 'أوتارا آشادها', Shravana: 'شرافانا', Dhanishta: 'دهانيشثا', Shatabhisha: 'شاتابيشا', PurvaBhadrapada: 'بورفا بهادرابادا', UttaraBhadrapada: 'أوتارا بهادرابادا', Revati: 'ريفاتي' },
  ja: { Ashwini: 'アシュヴィニー', Bharani: 'バラニー', Krittika: 'クリッティカー', Rohini: 'ローヒニー', Mrigashira: 'ムリガシーラ', Ardra: 'アールドラー', Punarvasu: 'プナルヴァス', Pushya: 'プシュヤ', Ashlesha: 'アシュレーシャー', Magha: 'マガー', PurvaPhalguni: 'プールヴァ・ファルグニー', UttaraPhalguni: 'ウッタラ・ファルグニー', Hasta: 'ハスタ', Chitra: 'チトラー', Swati: 'スヴァーティー', Vishakha: 'ヴィシャーカー', Anuradha: 'アヌラーダー', Jyeshtha: 'ジェーシュター', Mula: 'ムーラ', PurvaAshadha: 'プールヴァ・アシャーラー', UttaraAshadha: 'ウッタラ・アシャーラー', Shravana: 'シュラヴァナ', Dhanishta: 'ダニシュター', Shatabhisha: 'シャタビシャー', PurvaBhadrapada: 'プールヴァ・バードラパダー', UttaraBhadrapada: 'ウッタラ・バードラパダー', Revati: 'レーヴァティー' },
  zh: { Ashwini: '阿说你', Bharani: '婆罗尼', Krittika: '克黎底迦', Rohini: '罗希尼', Mrigashira: '密伽尸罗', Ardra: '阿陀罗', Punarvasu: '补那筏沙', Pushya: '颇沙', Ashlesha: '阿什雷沙', Magha: '摩伽', PurvaPhalguni: '前弗沙尼', UttaraPhalguni: '后弗沙尼', Hasta: '手', Chitra: '质多罗', Swati: '萨伐底', Vishakha: '毗沙迦', Anuradha: '阿奴罗陀', Jyeshtha: '月月', Mula: '牟罗', PurvaAshadha: '前阿沙达', UttaraAshadha: '后阿沙达', Shravana: '室罗伐拏', Dhanishta: '陀尼沙', Shatabhisha: '沙塔毗沙', PurvaBhadrapada: '前跋德罗巴达', UttaraBhadrapada: '后跋德罗巴达', Revati: '雷瓦蒂' },
};

type Dict = Record<string, string>;
const DICTIONARIES: Record<string, Dict> = {
  zodiac: {}, planets: {}, elements: {}, energyLevels: {}, impacts: {}, scoreCategories: {}, moonPhases: {}, paksha: {}, doshas: {},
};

function lookup(dict: Record<string, Record<string, string>>, key: string, lang: string): string {
  return dict[lang]?.[key] || dict.en?.[key] || key;
}

export function getAstrologyLabel(category: keyof typeof DICTIONARIES, key: string, language?: string): string {
  const lang = language || useI18nStore.getState().language || 'en';
  switch (category) {
    case 'zodiac': return lookup(ZODIAC, key, lang);
    case 'planets': return lookup(PLANETS, key, lang);
    case 'elements': return lookup(ELEMENTS, key, lang);
    case 'energyLevels': return lookup(ENERGY_LEVELS, key, lang);
    case 'impacts': return lookup(IMPACTS, key, lang);
    case 'scoreCategories': return lookup(SCORE_CATEGORIES, key, lang);
    case 'moonPhases': return lookup(MOON_PHASES, key, lang);
    case 'paksha': return lookup(PAKSHA, key, lang);
    case 'doshas': return lookup(DOSHAS, key, lang);
    default: return key;
  }
}

export function getNakshatraName(sanskritKey: string, language?: string): string {
  return lookup(NAKSHATRAS, sanskritKey, language);
}

export {
  ZODIAC, PLANETS, ELEMENTS, ENERGY_LEVELS, IMPACTS, SCORE_CATEGORIES,
  MOON_PHASES, PAKSHA, DOSHAS, NAKSHATRAS,
};
