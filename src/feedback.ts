/**
 * Public visitor feedback form (Tally).
 * Use a normal external link (no Tally embed script) so CSP stays `'self'` for scripts.
 */
export const FEEDBACK_FORM_URL = 'https://tally.so/r/68aLbP';

/** Suggested Tally form fields (configure in Tally; not enforced in this static site). */
export const FEEDBACK_FORM_EXPECTATIONS = [
  'Feedback type: Bug report, Feature idea, Other',
  'Description: required',
  'Email: optional, only if the visitor wants a reply',
  'No mandatory sign-in',
  'No spreadsheet attachments or confidential data prompts'
] as const;

export function isFeedbackFormConfigured(url: string = FEEDBACK_FORM_URL): boolean {
  try {
    if (!url.trim()) return false;
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}
