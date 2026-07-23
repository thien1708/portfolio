/** Shared text helpers used by the hero, brand mark and project cards. */

const bulletCache = new Map<string, string[]>();

/**
 * Split a newline-separated description into trimmed, non-empty bullet
 * lines. Memoized — templates call this on every change-detection pass.
 */
export function splitBullets(text: string): string[] {
  let lines = bulletCache.get(text);
  if (!lines) {
    lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    bulletCache.set(text, lines);
  }
  return lines;
}

/**
 * Uppercase initials of the first `maxWords` words that start with a letter
 * or digit (unicode-aware, so Vietnamese names like "Đặng" keep their Đ).
 */
export function initialsOf(name: string, maxWords = 2): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, maxWords)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}
