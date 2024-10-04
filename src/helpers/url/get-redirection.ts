import { URL } from "node:url";

// Set a constant for the 30-second timeout in milliseconds
const TIMEOUT_MS = 30000;

/**
 * Extracts the URL from a meta refresh tag in the HTML content.
 * @param html - The HTML content to search for a meta redirect.
 * @param baseUrl - The base URL for resolving relative URLs.
 * @returns - The redirect URL or null if not found.
 */
function extractMetaRefreshUrl(html: string, baseUrl: string): string | null {
  const metaTagMatch = html.match(
    /<meta\s+http-equiv=["']refresh["']\s+content=["']\d+;\s*url=(.*?)["']/i,
  );
  if (metaTagMatch) {
    const metaRedirectUrl = metaTagMatch[1];
    return new URL(metaRedirectUrl, baseUrl).href; // Resolve relative URL
  }
  return null;
}

/**
 * Helper function to fetch a URL with a timeout and track redirection.
 * @param url - The shortened URL to be resolved.
 * @param hasRedirected - Boolean indicating if a redirection has occurred.
 * @returns - The final URL or null if it can't be resolved or no redirection happened.
 */
export const getRedirectedUrl = async (
  url: string,
  hasRedirected: boolean = false,
): Promise<string | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "manual", // No auto-redirects, handle them manually
      signal: controller.signal,
    });

    // Handle standard HTTP redirects (3xx status codes)
    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get("location");
      if (redirectUrl) {
        const resolvedUrl = new URL(redirectUrl, url).href;
        return getRedirectedUrl(resolvedUrl, true); // Recursively resolve further redirects
      }
    }

    // If the response is an HTML page, check for meta tag redirection
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      const metaRedirectUrl = extractMetaRefreshUrl(html, url);
      if (metaRedirectUrl) {
        return getRedirectedUrl(metaRedirectUrl, true); // Recursively resolve meta tag redirects
      }
    }

    // If no redirection happened, return null
    return hasRedirected ? url : null;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.error("Request timed out");
    } else {
      console.error("Failed to resolve URL:", error);
    }
    return null;
  } finally {
    clearTimeout(timeout); // Clear the timeout on completion or error
  }
};
