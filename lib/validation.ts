/**
 * Input validation rules for the SME AI Risk wizard.
 *
 * Used by both the client-side wizard (app/wizard/page.tsx)
 * and the server-side API handler (app/api/assess/route.ts).
 */

/** Fields that require at least MIN_WORDS_TEXTAREA words AND MIN_CHARS_TEXTAREA characters. */
export const TEXTAREA_FIELDS = [
  "purpose",
  "dataSensitivity",
  "decisionImpact",
  "humanOversight",
  "transparency",
  "errorConsequence",
  "thirdPartySharing",
  "geographicScope",
] as const;

/** Fields that only require a minimum character length (no word count). */
export const SHORT_TEXT_FIELDS = ["toolName", "department"] as const;

export const MIN_CHARS_SHORT = 2;
export const MIN_CHARS_TEXTAREA = 15;
export const MIN_WORDS_TEXTAREA = 3;

export const TEXTAREA_ERROR_MSG =
  "Please describe this in at least 3 words so we can assess it accurately.";

/**
 * Returns true if `value` meets the textarea quality bar:
 * at least MIN_WORDS_TEXTAREA non-empty words AND at least MIN_CHARS_TEXTAREA characters.
 */
export function isValidTextarea(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < MIN_CHARS_TEXTAREA) return false;
  return trimmed.split(/\s+/).filter(Boolean).length >= MIN_WORDS_TEXTAREA;
}

/**
 * Returns true if `value` meets the short-text quality bar:
 * at least MIN_CHARS_SHORT characters after trimming.
 */
export function isValidShortText(value: string): boolean {
  return value.trim().length >= MIN_CHARS_SHORT;
}
