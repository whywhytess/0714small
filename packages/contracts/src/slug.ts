export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 32;

/**
 * slug 语法校验（不含保留词）。规则见 packages/contracts/README.md，
 * Go 端实现必须通过同一组向量 vectors/slug.json。
 */
export function isValidSlugSyntax(input: string): boolean {
  if (input.length < SLUG_MIN_LENGTH || input.length > SLUG_MAX_LENGTH) return false;
  if (input.startsWith("-") || input.endsWith("-")) return false;
  if (input.includes("--")) return false;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    const isLower = c >= 0x61 && c <= 0x7a;
    const isDigit = c >= 0x30 && c <= 0x39;
    if (!isLower && !isDigit && c !== 0x2d) return false;
  }
  return true;
}
