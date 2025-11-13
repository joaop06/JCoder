import { ApiService } from '../api.service';

/**
 * Gera um fingerprint único do navegador baseado em características do dispositivo
 * Isso ajuda a identificar visitantes únicos mesmo sem cookies
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

  // Hash simples (em produção, considere usar uma biblioteca de hash)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Obtém ou cria um fingerprint persistente no localStorage
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
 * Verifica se o usuário atual é o dono do portfólio
 * Compara o username da URL com o username do usuário logado
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
 * Serviço para tracking de acessos ao portfólio
 */
export const PortfolioTrackingService = {
  /**
   * Registra um acesso ao portfólio
   * @param username - Username do portfólio acessado
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
          // Não retry em caso de erro para evitar múltiplas contagens
          retries: 0,
          retryDelay: 0,
        }
      );
    } catch (error) {
      // Silenciosamente falha - não queremos interromper a experiência do usuário
      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PortfolioTracking] Failed to track view:', error);
      }
    }
  },
};

