/**
 * Platform & Device Utility Service
 * 
 * Provides safe, isolated abstractions for:
 * - Clipboard operations
 * - Smooth scroll behavior
 * - Navigation and hash handling
 * - Platform detection (Web vs Native iOS/Android WebView)
 * - Safe dialogs / prompts without blocking webview threads
 */

export class PlatformService {
  /**
   * Check if running in a native Capacitor mobile environment
   */
  isNative(): boolean {
    if (typeof window === 'undefined') return false;
    return !!((window as any).Capacitor?.isNativePlatform?.() || (window as any).Capacitor?.isNative);
  }

  /**
   * Check if device is touch-primary
   */
  isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || (navigator?.maxTouchPoints ?? 0) > 0;
  }

  /**
   * Safely copy text to clipboard across desktop and mobile
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Safe fallback using textarea element
      if (typeof document !== 'undefined') {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      }
      return false;
    } catch (e) {
      console.warn('[Platform] Clipboard copy failed:', e);
      return false;
    }
  }

  /**
   * Safely scroll viewport to top or position
   */
  scrollTo(top = 0, behavior: ScrollBehavior = 'smooth') {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top, behavior });
      } catch {
        window.scrollTo(0, top);
      }
    }
  }

  /**
   * Safe confirmation dialog
   */
  confirm(message: string): boolean {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(message);
    }
    return true;
  }

  /**
   * Safe navigation setter
   */
  navigateToHash(path: string) {
    if (typeof window !== 'undefined') {
      const cleanPath = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`;
      window.location.hash = cleanPath;
    }
  }
}

export const platformService = new PlatformService();
