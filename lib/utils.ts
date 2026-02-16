export function validateAndNormalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  
  // Add https:// if no protocol given
  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    // Must be http or https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    const hostname = url.hostname;

    // Must have a dot in the hostname (e.g. google.com, not just "google")
    if (!hostname.includes(".")) {
      return null;
    }

    // Must not start or end with a dot
    if (hostname.startsWith(".") || hostname.endsWith(".")) {
      return null;
    }

    // TLD (part after last dot) must be at least 2 characters
    // This blocks "hi", "hello", "test" etc.
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return null;
    }

    // Hostname must have at least 1 character before the TLD
    const domainPart = parts[parts.length - 2];
    if (!domainPart || domainPart.length < 1) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
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
