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
];

export function sanitizePrompt(input: string): string {
  let result = input;
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, (match) => {
      return `[${match.replace(/[\[\]]/g, '')}]`;
    });
  }
  return result;
}
