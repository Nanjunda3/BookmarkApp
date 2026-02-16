/**
 * Validates a URL string using the WHATWG URL parser.
 * Returns the normalized URL on success, or null on failure.
 */
export function validateAndNormalizeUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    // Try adding https:// prefix if the user forgot it
    try {
      const url = new URL(`https://${input.trim()}`);
      return url.toString();
    } catch {
      return null;
    }
  }
}

/**
 * Extract the domain from a URL for favicon fetching.
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Truncate a string to a maximum length, appending ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}
