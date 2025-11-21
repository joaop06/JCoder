import { ApiService } from '../api.service';

/**
 * Generates a unique browser fingerprint based on device characteristics
 * This helps identify unique visitors even without cookies
 */
function generateBrowserFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser fingerprint', 4, 17);
  }

  // Type assertion para propriedades experimentais do Navigator
  const nav = navigator as Navigator & {
    deviceMemory?: number;
  };

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    navigator.hardwareConcurrency || '',
    nav.deviceMemory || '',
  ].join('|');

  // Simple hash (in production, consider using a hash library)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Gets or creates a persistent fingerprint in localStorage
 */
function getOrCreateFingerprint(): string {
  const STORAGE_KEY = 'jcoder_portfolio_fingerprint';
  let fingerprint = localStorage.getItem(STORAGE_KEY);

  if (!fingerprint) {
    fingerprint = generateBrowserFingerprint();
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }

  return fingerprint;
}

/**
 * Checks if the current user is the portfolio owner
 * Compares the URL username with the logged-in user's username
 */
function isPortfolioOwner(username: string): boolean {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    return user?.username === username;
  } catch {
    return false;
  }
}

/**
 * Service for tracking portfolio access
 */
export const PortfolioTrackingService = {
  /**
   * Records a portfolio access
   * @param username - Username of the accessed portfolio
   */
  async trackView(username: string): Promise<void> {
    try {
      const fingerprint = getOrCreateFingerprint();
      const isOwner = isPortfolioOwner(username);
      const referer = document.referrer || undefined;

      await ApiService.post(
        `/portfolio/${username}/track-view`,
        {
          fingerprint,
          referer,
          isOwner,
        },
        undefined, // config
        {
          // No retry on error to avoid multiple counts
          retries: 0,
          retryDelay: 0,
        }
      );
    } catch (error) {
      // Silently fails - we don't want to interrupt the user experience
      // Log only in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PortfolioTracking] Failed to track view:', error);
      }
    }
  },
};

