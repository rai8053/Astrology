const CACHE_PREFIX = 'soma_tl_';

export interface TranslationResult {
  key: string;
  value: string;
}

function getCache(lang: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + lang);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCache(lang: string, key: string, value: string): void {
  try {
    const cache = getCache(lang);
    cache[key] = value;
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(cache));
  } catch {}
}

function setCacheBatch(lang: string, entries: [string, string][]): void {
  try {
    const cache = getCache(lang);
    for (const [k, v] of entries) cache[k] = v;
    localStorage.setItem(CACHE_PREFIX + lang, JSON.stringify(cache));
  } catch {}
}

const HI_MAP: Record<string, string> = {
  'Account': 'खाता', 'Accurate': 'सटीक', 'Active': 'सक्रिय', 'Activity': 'गतिविधि',
  'Advice': 'सलाह', 'Age': 'आयु', 'AI': 'एआई', 'AI-Powered': 'एआई-संचालित',
  'Air': 'वायु', 'Alerts': 'सूचनाएं', 'All': 'सभी', 'Allow': 'अनुमति',
  'Almost': 'लगभग', 'Analysis': 'विश्लेषण', 'Analytics': 'एनालिटिक्स',
  'Answer': 'उत्तर', 'Areas': 'क्षेत्र', 'Ascendant': 'लग्न', 'Astrologer': 'ज्योतिषी',
  'Astrology': 'ज्योतिष', 'Attributes': 'गुण', 'Auto-Cleanup': 'स्वतः सफाई',
  'Back': 'वापस', 'Basic': 'बुनियादी', 'Begin': 'शुरू', 'Best': 'सर्वश्रेष्ठ',
  'Billing': 'बिलिंग', 'Birth': 'जन्म', 'Birth Chart': 'जन्म कुंडली',
  'Brand': 'ब्रांड', 'Button': 'बटन', 'Calculate': 'गणना', 'Calculator': 'गणक',
  'Cancel': 'रद्द', 'Canonical': 'कैननिकल', 'Card': 'कार्ड',
  'Career': 'करियर', 'Celestial': 'खगोलीय', 'Celtic Cross': 'सेल्टिक क्रॉस',
  'Challenges': 'चुनौतियां', 'Chart': 'चार्ट', 'Chat': 'चैट', 'Check': 'जांच',
  'Choose': 'चुनें', 'Clarity': 'स्पष्टता', 'Color': 'रंग',
  'Compatibility': 'अनुकूलता', 'Compliance': 'अनुपालन', 'Confidential': 'गोपनीय',
  'Configure': 'कॉन्फ़िगर', 'Confirm': 'पुष्टि', 'Connection': 'संबंध',
  'Contact': 'संपर्क', 'Continue': 'जारी', 'Copy': 'कॉपी', 'Cosmic': 'ब्रह्मांडीय',
  'Country': 'देश', 'Create': 'बनाएं', 'Credit': 'क्रेडिट', 'Cta': 'कार्रवाई',
  'Currency': 'मुद्रा', 'Current': 'वर्तमान', 'Custom': 'अनुकूलित',
  'Daily': 'दैनिक', 'Dark': 'डार्क', 'Dasha': 'दशा', 'Dasha Period': 'दशा अवधि',
  'Dashboard': 'डैशबोर्ड', 'Data': 'डेटा', 'Date': 'तिथि', 'Day': 'दिन',
  'Default': 'डिफ़ॉल्ट', 'Delete': 'हटाएं', 'Description': 'विवरण',
  'Destiny': 'भाग्य', 'Details': 'विवरण', 'Direction': 'दिशा',
  'Distance': 'दूरी', 'Divisional': 'विभाजन', 'Dob': 'जन्म तिथि',
  'Done': 'पूर्ण', 'Dosha': 'दोष', 'Download': 'डाउनलोड', 'Draw': 'निकालें',
  'Earth': 'पृथ्वी', 'Edit': 'संपादित', 'Element': 'तत्व', 'Email': 'ईमेल',
  'Empty': 'खाली', 'Encryption': 'एन्क्रिप्शन', 'Energy': 'ऊर्जा',
  'Enterprise': 'एंटरप्राइज', 'Error': 'त्रुटि', 'Evening': 'संध्या',
  'Executive': 'कार्यकारी', 'Explore': 'अन्वेषण', 'External': 'बाहरी',
  'Failed': 'विफल', 'FAQ': 'सामान्य प्रश्न', 'Feature': 'सुविधा',
  'Features': 'सुविधाएं', 'Filter': 'फ़िल्टर', 'Finance': 'वित्त',
  'Fire': 'अग्नि', 'Forecast': 'पूर्वानुमान', 'Forgot': 'भूल गए',
  'Free': 'मुफ्त', 'Full': 'पूरा', 'Future': 'भविष्य',
  'GDPR': 'जीडीपीआर', 'Gemstone': 'रत्न', 'Gender': 'लिंग',
  'General': 'सामान्य', 'Generate': 'उत्पन्न', 'Generated': 'उत्पन्न',
  'Getting': 'प्रारंभ', 'Google': 'गूगल', 'Greeting': 'अभिवादन',
  'Guidance': 'मार्गदर्शन', 'GunMilan': 'गुणमिलान', 'GunsMatched': 'गुण मिलान',
  'Health': 'स्वास्थ्य', 'Hello': 'नमस्ते', 'Hide': 'छुपाएं',
  'History': 'इतिहास', 'Home': 'होम', 'Horoscope': 'राशिफल', 'House': 'भाव',
  'How': 'कैसे', 'Illumination': 'रोशनी', 'Info': 'जानकारी',
  'Input': 'इनपुट', 'Insight': 'अंतर्दृष्टि', 'Insights': 'अंतर्दृष्टियां',
  'Interpretation': 'व्याख्या', 'Intro': 'परिचय', 'Invalid': 'अमान्य',
  'Journey': 'यात्रा', 'Koota': 'कूट', 'Kundli': 'कुंडली',
  'Lagna': 'लग्न', 'Language': 'भाषा', 'Last': 'अंतिम', 'Learn': 'सीखें',
  'Level': 'स्तर', 'Life': 'जीवन', 'Light': 'लाइट', 'Limit': 'सीमा',
  'Loading': 'लोड हो रहा', 'Location': 'स्थान', 'Login': 'लॉगिन',
  'Logout': 'लॉगआउट', 'Looks': 'दिखता', 'Lord': 'स्वामी',
  'Love': 'प्रेम', 'Lucky': 'भाग्यशाली', 'Lunar': 'चंद्र',
  'Mahadasha': 'महादशा', 'Manage': 'प्रबंधित', 'Marriage': 'विवाह',
  'Menu': 'मेनू', 'Message': 'संदेश', 'Metrics': 'मीट्रिक्स',
  'Milan': 'मिलान', 'Mission': 'मिशन', 'Mode': 'मोड', 'Moderate': 'मध्यम',
  'Month': 'महीना', 'Moon': 'चंद्रमा', 'Morning': 'प्रभात',
  'Most': 'सबसे', 'My': 'मेरा', 'Mystical': 'रहस्यमय',
  'Nakshatra': 'नक्षत्र', 'Name': 'नाम', 'Navamsa': 'नवांश',
  'Network': 'नेटवर्क', 'Neutral': 'तटस्थ', 'New': 'नया', 'Next': 'अगला',
  'No': 'नहीं', 'North': 'उत्तर', 'Not': 'नहीं', 'Number': 'संख्या',
  'Numerology': 'अंक ज्योतिष', 'of': 'का',
  'On': 'पर', 'Options': 'विकल्प', 'Or': 'या', 'Outcome': 'परिणाम',
  'Overview': 'अवलोकन', 'Page': 'पृष्ठ', 'Partner': 'साथी',
  'Password': 'पासवर्ड', 'Past': 'अतीत', 'Payment': 'भुगतान',
  'Phase': 'चरण', 'Place': 'स्थान', 'Plan': 'योजना',
  'Planet': 'ग्रह', 'Policy': 'नीति', 'Popular': 'लोकप्रिय',
  'Position': 'स्थिति', 'Positive': 'सकारात्मक', 'Preferences': 'प्राथमिकताएं',
  'Premium': 'प्रीमियम', 'Present': 'वर्तमान', 'Preview': 'पूर्वावलोकन',
  'Prices': 'मूल्य', 'Pricing': 'मूल्य निर्धारण', 'Privacy': 'गोपनीयता',
  'Pro': 'प्रो', 'Profile': 'प्रोफ़ाइल', 'Prompt': 'प्रॉम्प्ट',
  'Protected': 'संरक्षित', 'Pull': 'खींचें', 'Purnima': 'पूर्णिमा',
  'Quick': 'त्वरित', 'Quote': 'उद्धरण', 'Rashi': 'राशि',
  'Rating': 'रेटिंग', 'Reading': 'पठन', 'Ready': 'तैयार',
  'Recent': 'हालिया', 'Redirecting': 'पुनर्निर्देशित', 'Refund': 'वापसी',
  'Register': 'पंजीकरण', 'Reload': 'पुनः लोड', 'Remaining': 'शेष',
  'Remedies': 'उपाय', 'Remedy': 'उपाय', 'Reports': 'रिपोर्ट',
  'Request': 'अनुरोध', 'Reset': 'रीसेट', 'Response': 'प्रतिक्रिया',
  'Result': 'परिणाम', 'Retry': 'पुनः प्रयास', 'Reversed': 'उल्टा',
  'Review': 'समीक्षा', 'Rules': 'नियम', 'Save': 'सहेजें',
  'Score': 'स्कोर', 'Search': 'खोज', 'Section': 'अनुभाग', 'Security': 'सुरक्षा',
  'Seeker': 'साधक', 'Select': 'चुनें', 'Send': 'भेजें', 'Session': 'सत्र',
  'Setting': 'सेटिंग', 'Settings': 'सेटिंग्स', 'Setup': 'सेटअप',
  'Sharing': 'साझाकरण', 'Show': 'दिखाएं', 'Shuffle': 'फेरबदल',
  'Sign': 'चिह्न', 'Sign In': 'साइन इन', 'Sign Out': 'साइन आउट',
  'Sign Up': 'साइन अप', 'Single': 'एकल', 'Skip': 'छोड़ें',
  'Soul': 'आत्मा', 'South': 'दक्षिण', 'Spread': 'स्प्रेड',
  'Star': 'तारा', 'Start': 'शुरू', 'State': 'राज्य', 'Status': 'स्थिति',
  'Streak': 'सिलसिला', 'Strength': 'शक्ति', 'Strengths': 'शक्तियां',
  'Strong': 'मजबूत', 'Subject': 'विषय', 'Subscription': 'सदस्यता',
  'Subtitle': 'उपशीर्षक', 'Success': 'सफलता', 'Summary': 'सारांश',
  'Support': 'समर्थन', 'System': 'सिस्टम', 'Table': 'तालिका',
  'Tagline': 'टैगलाइन', 'Tarot': 'टैरो', 'Team': 'टीम',
  'Terms': 'शर्तें', 'Testimonial': 'प्रशंसापत्र',
  'Theme': 'थीम', 'Third-Party': 'तृतीय-पक्ष', 'Time': 'समय',
  'Time zone': 'समय क्षेत्र', 'Timeline': 'समयरेखा', 'Tithi': 'तिथि',
  'Title': 'शीर्षक', 'Today': 'आज', 'Toggle': 'टॉगल',
  'Tomorrow': 'कल', 'Tracker': 'ट्रैकर', 'Trail': 'परीक्षण',
  'Transit': 'गोचर', 'Transits': 'गोचर', 'Trial': 'परीक्षण',
  'Trust': 'विश्वास', 'Try': 'प्रयास', 'Type': 'प्रकार',
  'Unable': 'असमर्थ', 'Unavailable': 'अनुपलब्ध', 'Undo': 'पूर्ववत',
  'Unexpected': 'अप्रत्याशित', 'Unlimited': 'असीमित', 'Unlock': 'अनलॉक',
  'Unsaved': 'असुरक्षित', 'Update': 'अपडेट', 'Upcoming': 'आगामी',
  'Upgrade': 'अपग्रेड', 'Uppercase': 'बड़े अक्षर', 'Upsell': 'अपसेल',
  'Urge': 'इच्छा', 'User': 'उपयोगकर्ता', 'Users': 'उपयोगकर्ता',
  'Value': 'मूल्य', 'Vedic': 'वैदिक', 'Verified': 'सत्यापित',
  'View': 'देखें', 'Water': 'जल', 'Weak': 'कमजोर', 'Wealth': 'धन',
  'Week': 'सप्ताह', 'Welcome': 'स्वागत', 'Western': 'पश्चिमी',
  'Year': 'वर्ष', 'Yoga': 'योग', 'Yogas': 'योग',
  'Your': 'आपका', 'Zodiac': 'राशिचक्र',
};

const BN_MAP: Record<string, string> = {
  'Account': 'অ্যাকাউন্ট', 'Active': 'সক্রিয়', 'Activity': 'কার্যকলাপ',
  'Advice': 'পরামর্শ', 'Age': 'বয়স', 'AI': 'এআই', 'AI-Powered': 'এআই-চালিত',
  'Air': 'বায়ু', 'Alerts': 'সতর্কতা', 'All': 'সব', 'Allow': 'অনুমতি',
  'Almost': 'প্রায়', 'Analysis': 'বিশ্লেষণ', 'Analytics': 'অ্যানালিটিক্স',
  'Answer': 'উত্তর', 'Areas': 'ক্ষেত্র', 'Ascendant': 'লগ্ন', 'Astrologer': 'জ্যোতিষী',
  'Astrology': 'জ্যোতিষ', 'Attributes': 'গুণাবলী', 'Auto-Cleanup': 'স্বয়ং-পরিষ্কার',
  'Back': 'পেছনে', 'Basic': 'মৌলিক', 'Begin': 'শুরু', 'Best': 'সেরা',
  'Billing': 'বিলিং', 'Birth': 'জন্ম', 'Birth Chart': 'জন্ম কুণ্ডলী',
  'Brand': 'ব্র্যান্ড', 'Calculate': 'গণনা', 'Calculator': 'গণক',
  'Cancel': 'বাতিল', 'Card': 'কার্ড', 'Career': 'কর্মজীবন',
  'Celestial': 'নভোমণ্ডলীয়', 'Challenges': 'চ্যালেঞ্জ', 'Chart': 'চার্ট',
  'Chat': 'চ্যাট', 'Check': 'পরীক্ষা', 'Choose': 'বেছে নিন',
  'Color': 'রং', 'Compatibility': 'সামঞ্জস্য', 'Compliance': 'অনুবর্তিতা',
  'Confidential': 'গোপনীয়', 'Confirm': 'নিশ্চিত', 'Connection': 'সংযোগ',
  'Contact': 'যোগাযোগ', 'Continue': 'চালিয়ে', 'Copy': 'কপি',
  'Cosmic': 'মহাজাগতিক', 'Country': 'দেশ', 'Create': 'তৈরি করুন',
  'Credit': 'ক্রেডিট', 'Currency': 'মুদ্রা', 'Current': 'বর্তমান',
  'Custom': 'কাস্টম', 'Daily': 'দৈনিক', 'Dark': 'ডার্ক',
  'Dasha': 'দশা', 'Dashboard': 'ড্যাশবোর্ড', 'Data': 'ডেটা',
  'Date': 'তারিখ', 'Day': 'দিন', 'Delete': 'মুছুন',
  'Description': 'বর্ণনা', 'Destiny': 'ভাগ্য', 'Details': 'বিবরণ',
  'Direction': 'দিক', 'Distance': 'দূরত্ব', 'Dosha': 'দোষ',
  'Download': 'ডাউনলোড', 'Earth': 'পৃথিবী', 'Element': 'উপাদান',
  'Email': 'ইমেল', 'Empty': 'খালি', 'Encryption': 'এনক্রিপশন',
  'Energy': 'শক্তি', 'Enterprise': 'এন্টারপ্রাইজ', 'Error': 'ত্রুটি',
  'Evening': 'সন্ধ্যা', 'Explore': 'অন্বেষণ', 'External': 'বাহ্যিক',
  'Failed': 'ব্যর্থ', 'FAQ': 'সাধারণ জিজ্ঞাসা', 'Feature': 'বৈশিষ্ট্য',
  'Features': 'বৈশিষ্ট্য', 'Filter': 'ফিল্টার', 'Finance': 'অর্থ',
  'Fire': 'অগ্নি', 'Forecast': 'পূর্বাভাস', 'Free': 'বিনামূল্যে',
  'Future': 'ভবিষ্যত', 'Gemstone': 'রত্ন', 'Gender': 'লিঙ্গ',
  'General': 'সাধারণ', 'Generate': 'উৎপন্ন', 'Generated': 'উৎপন্ন',
  'Google': 'গুগল', 'Greeting': 'অভিবাদন', 'Guidance': 'নির্দেশনা',
  'Health': 'স্বাস্থ্য', 'Hello': 'হ্যালো', 'Hide': 'লুকান',
  'History': 'ইতিহাস', 'Home': 'হোম', 'Horoscope': 'রাশিফল',
  'House': 'ঘর', 'Illumination': 'আলোকসজ্জা', 'Info': 'তথ্য',
  'Insight': 'অন্তর্দৃষ্টি', 'Insights': 'অন্তর্দৃষ্টি', 'Interpretation': 'ব্যাখ্যা',
  'Invalid': 'অবৈধ', 'Journey': 'যাত্রা', 'Kundli': 'কুণ্ডলী',
  'Language': 'ভাষা', 'Learn': 'শিখুন', 'Level': 'স্তর',
  'Life': 'জীবন', 'Light': 'লাইট', 'Loading': 'লোড হচ্ছে',
  'Location': 'অবস্থান', 'Login': 'লগইন', 'Logout': 'লগআউট',
  'Lord': 'প্রভু', 'Love': 'প্রেম', 'Lucky': 'ভাগ্যবান',
  'Lunar': 'চান্দ্র', 'Manage': 'পরিচালনা', 'Menu': 'মেনু',
  'Message': 'বার্তা', 'Mode': 'মোড', 'Month': 'মাস',
  'Moon': 'চন্দ্র', 'Morning': 'সকাল', 'Nakshatra': 'নক্ষত্র',
  'Name': 'নাম', 'Network': 'নেটওয়ার্ক', 'New': 'নতুন',
  'Next': 'পরবর্তী', 'North': 'উত্তর', 'Number': 'সংখ্যা',
  'Numerology': 'অঙ্কজ্যোতিষ', 'Overview': 'ওভারভিউ', 'Partner': 'অংশীদার',
  'Password': 'পাসওয়ার্ড', 'Past': 'অতীত', 'Payment': 'পেমেন্ট',
  'Phase': 'পর্ব', 'Place': 'স্থান', 'Plan': 'পরিকল্পনা',
  'Planet': 'গ্রহ', 'Policy': 'নীতি', 'Position': 'অবস্থান',
  'Preferences': 'পছন্দ', 'Premium': 'প্রিমিয়াম', 'Present': 'বর্তমান',
  'Pricing': 'মূল্য নির্ধারণ', 'Privacy': 'গোপনীয়তা',
  'Pro': 'প্রো', 'Profile': 'প্রোফাইল', 'Quick': 'দ্রুত',
  'Rashi': 'রাশি', 'Recent': 'সাম্প্রতিক', 'Refund': 'ফেরত',
  'Register': 'নিবন্ধন', 'Reload': 'রিলোড', 'Remedies': 'প্রতিকার',
  'Remedy': 'প্রতিকার', 'Reports': 'রিপোর্ট', 'Reset': 'রিসেট',
  'Result': 'ফলাফল', 'Retry': 'পুনরায় চেষ্টা', 'Save': 'সংরক্ষণ',
  'Score': 'স্কোর', 'Search': 'অনুসন্ধান', 'Security': 'নিরাপত্তা',
  'Select': 'নির্বাচন', 'Send': 'পাঠান', 'Session': 'সেশন',
  'Settings': 'সেটিংস', 'Setup': 'সেটআপ', 'Show': 'দেখান',
  'Sign': 'চিহ্ন', 'Skip': 'এড়িয়ে', 'Soul': 'আত্মা', 'South': 'দক্ষিণ',
  'Star': 'তারা', 'Start': 'শুরু', 'State': 'রাজ্য', 'Status': 'অবস্থা',
  'Streak': 'ধারা', 'Strength': 'শক্তি', 'Strengths': 'শক্তি',
  'Subject': 'বিষয়', 'Subscription': 'সাবস্ক্রিপশন', 'Success': 'সফলতা',
  'Summary': 'সারাংশ', 'Support': 'সমর্থন', 'System': 'সিস্টেম',
  'Tarot': 'ট্যারট', 'Team': 'টিম', 'Terms': 'শর্তাবলী',
  'Theme': 'থিম', 'Time': 'সময়', 'Timeline': 'সময়রেখা',
  'Tithi': 'তিথি', 'Title': 'শিরোনাম', 'Today': 'আজ',
  'Tomorrow': 'আগামীকাল', 'Transit': 'অনুচর', 'Transits': 'অনুচর',
  'Trial': 'পরীক্ষা', 'Unlock': 'আনলক', 'Update': 'আপডেট',
  'Upgrade': 'আপগ্রেড', 'User': 'ব্যবহারকারী', 'Users': 'ব্যবহারকারী',
  'Vedic': 'বৈদিক', 'View': 'দেখুন', 'Water': 'জল',
  'Week': 'সপ্তাহ', 'Welcome': 'স্বাগতম', 'Year': 'বছর',
  'Yoga': 'যোগ', 'Your': 'আপনার', 'Zodiac': 'রাশিচক্র',
};

function translateWord(word: string, lang: string): string {
  if (!word || word.length <= 1) return word;
  const map = lang === 'hi' ? HI_MAP : BN_MAP;
  const direct = map[word];
  if (direct) return direct;
  const lower = word.toLowerCase();
  const titleKey = word.charAt(0).toUpperCase() + word.slice(1);
  if (map[titleKey]) return map[titleKey];
  for (const [en, translated] of Object.entries(map)) {
    if (en.toLowerCase() === lower) return translated;
  }
  return word;
}

const DO_NOT_TRANSLATE = new Set([
  'kundli', 'nakshatra', 'lagna', 'mahadasha', 'antardasha',
  'rashi', 'yoga', 'yogas', 'dasha', 'makar', 'kumbha', 'meen',
  'mesha', 'vrishabh', 'mithun', 'kark', 'simha', 'kanya',
  'tula', 'vrishchik', 'dhanu', 'mesh', 'kumbh',
]);

function isSkipValue(val: string): boolean {
  const lower = val.toLowerCase().trim();
  return DO_NOT_TRANSLATE.has(lower);
}

function translateValue(val: string | undefined, lang: string): string {
  if (!val || val.length <= 1) return val ?? '';
  if (isSkipValue(val)) return val;
  const preserveVars = val.replace(/\{(.*?)\}/g, '\x00$1\x01');
  const parts = preserveVars.split(/(\x00[^\x01]+\x01)/);
  const translatedParts = parts.map(p => {
    if (p.startsWith('\x00') && p.endsWith('\x01')) return `{${p.slice(1, -1)}}`;
    const words = p.split(/(\s+|(?=[.,!?;:'"])|(?<=[.,!?;:'"]))/g);
    return words.map(w => translateWord(w, lang)).join('');
  });
  return translatedParts.join('');
}

export function batchTranslate(keys: Record<string, string>, targetLang: string): Record<string, string> {
  const result: Record<string, string> = {};
  const cache = getCache(targetLang);
  const uncached: string[] = [];
  for (const key of Object.keys(keys)) {
    if (cache[key] !== undefined) {
      result[key] = cache[key];
    } else {
      result[key] = '';
      uncached.push(key);
    }
  }
  if (uncached.length === 0) return result;
  const batch: [string, string][] = [];
  for (const key of uncached) {
    const translated = translateValue(keys[key], targetLang);
    result[key] = translated;
    batch.push([key, translated]);
  }
  setCacheBatch(targetLang, batch);
  return result;
}

export function translateText(text: string, targetLang: string): string {
  if (!text || targetLang === 'en') return text;
  const cacheKey = `_inline_${targetLang}`;
  const cache = getCache(cacheKey);
  if (cache[text]) return cache[text];
  const translated = translateValue(text, targetLang);
  setCache(cacheKey, text, translated);
  return translated;
}

export function hasCachedTranslations(lang: string): boolean {
  const cache = getCache(lang);
  return Object.keys(cache).length > 0;
}

export function getCacheSize(lang: string): number {
  return Object.keys(getCache(lang)).length;
}
