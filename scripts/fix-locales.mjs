import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALE_DIR = join(__dirname, '..', 'frontend', 'src', 'lib', 'i18n');
const LOCALES = ['hi', 'bn', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'zh'];

function isPlaceholder(val) {
  if (val === undefined || val === null) return true;
  // Key name as value (e.g., "nav.home": "nav.home")
  // CamelCase/PascalCase placeholder (e.g., "Team1Bio", "StatRevenue", "BackToDashboard")
  // Contains corruption
  if (/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]*)*$/.test(val) && val.length > 2) return true;
  if (val.includes('?????')) return true;
  // Single uppercase words that are not common English
  if (/^[A-Z][a-z]+$/.test(val) && !['I', 'A'].includes(val) && val.length > 2) {
    const common = ['About', 'Analytics', 'Best', 'Cancel', 'Color', 'Contact', 'Cookie', 'Current', 'Daily', 'Date', 'Desc', 'Done', 'Element', 'Email', 'Error', 'Faq', 'Feature', 'Fire', 'Free', 'Gender', 'Health', 'High', 'Hide', 'Home', 'House', 'Intro', 'Journey', 'Login', 'Love', 'Low', 'Menu', 'Month', 'Moon', 'Name', 'Next', 'Number', 'Phase', 'Plan', 'Price', 'Pro', 'Score', 'Search', 'Sign', 'Skip', 'Show', 'Start', 'State', 'Status', 'Story', 'Team', 'Title', 'Today', 'Topic', 'Trial', 'Value', 'View', 'Weak', 'Week', 'Year', 'Zone', 'Account', 'Address', 'Advice', 'Agenda', 'Billing', 'Career', 'Chakra', 'Change', 'Charts', 'Choose', 'Create', 'Credit', 'Custom', 'Details', 'Energy', 'Engine', 'Filter', 'Footer', 'Forgot', 'Format', 'Gender', 'Header', 'Horror', 'Insight', 'Lagna', 'Launch', 'Lesson', 'Levels', 'Liquid', 'Marked', 'Medium', 'Member', 'Method', 'Metric', 'Mirror', 'Mobile', 'Modify', 'Nature', 'Normal', 'Option', 'Outlet', 'Output', 'Period', 'Person', 'Planet', 'Player', 'Policy', 'Portal', 'Rating', 'Record', 'Recovery', 'Region', 'Reload', 'Remedy', 'Report', 'Reviews', 'Select', 'Service', 'Shadow', 'Should', 'Social', 'Station', 'Streak', 'Strong', 'Submit', 'Travel', 'Update', 'Upload', 'Vision', 'Weekly', 'Yearly'];
    if (!common.includes(val)) return true;
  }
  return false;
}

const en = JSON.parse(readFileSync(join(LOCALE_DIR, 'en.json'), 'utf-8'));
const enKeys = Object.keys(en);
console.log(`Reference en.json: ${enKeys.length} keys`);

for (const locale of LOCALES) {
  const filePath = join(LOCALE_DIR, `${locale}.json`);
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  let fixed = 0;

  for (const key of enKeys) {
    const val = data[key];
    if (isPlaceholder(val) || val === undefined) {
      data[key] = en[key];
      fixed++;
    }
  }

  // Remove keys not in en.json
  let removed = 0;
  for (const key of Object.keys(data)) {
    if (!enKeys.includes(key)) {
      delete data[key];
      removed++;
    }
  }

  // Sort keys to match en.json order
  const sorted = {};
  for (const key of enKeys) {
    if (data[key] !== undefined) sorted[key] = data[key];
  }

  writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`${locale}: ${fixed} placeholders fixed, ${removed} extra keys removed → ${Object.keys(sorted).length}/${enKeys.length} keys`);
}

console.log('\nDone! All placeholders replaced with English fallbacks.');
