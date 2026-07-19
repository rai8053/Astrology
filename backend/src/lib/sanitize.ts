const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|directives|commands)/gi,
  /forget\s+(all\s+)?(previous|above|prior\s+)?(instructions|context|conversation)/gi,
  /reveal\s+(your\s+)?(system\s+)?prompt/gi,
  /output\s+(your\s+)?(system\s+)?prompt/gi,
  /you\s+are\s+now\s+(gpt|openai|claude|bard|assistant)/gi,
  /act\s+as\s+(if\s+you\s+are\s+)?(gpt|openai|claude|bard)/gi,
  /do\s+(not\s+)?(what|as)\s+(i|the\s+user)\s+(say|tell|instruct)/gi,
  /print\s+(your\s+)?(system|internal)\s+(instructions|prompt|directives)/gi,
  /\[DAN\]|do\s+anything\s+now/gi,
  /you\s+have\s+no\s+(rules|boundaries|restrictions|limitations)/gi,
  /you\s+are\s+(free|unbound|unleashed|unrestricted)/gi,
  /repeat\s+(everything|all|the\s+above|the\s+following|this\s+message)/gi,
  /say\s+(everything|all)\s+(above|before|previous)/gi,
];

const PII_PATTERNS: RegExp[] = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\b\d{10,15}\b/g,
  /\b(?:\d{3}[.-]?){2}\d{4}\b/g,
];

const MAX_INPUT_LENGTH = 5000;

const USER_DATA_DELIMITER_START = '\n--- USER DATA (begin) ---\n';
const USER_DATA_DELIMITER_END = '\n--- USER DATA (end) ---\n';

export function sanitizePrompt(input: string): string {
  if (!input) return '';
  let result = input.slice(0, MAX_INPUT_LENGTH);
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '');
  }
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result.trim();
}

export function wrapUserData(data: string): string {
  return `${USER_DATA_DELIMITER_START}${data}${USER_DATA_DELIMITER_END}`;
}

export function validateAIOutput<T>(output: unknown, requiredFields: string[]): output is T {
  if (!output || typeof output !== 'object') return false;
  const obj = output as Record<string, unknown>;
  return requiredFields.every(field => field in obj && obj[field] != null);
}
