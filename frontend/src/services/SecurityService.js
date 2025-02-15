import { memoize } from '../utils/memoization';
import { ErrorHandler } from '../utils/errorHandler';

export class SecurityService {
  constructor() {
    this.csrfToken = null;
    this.securityHeaders = {
      'Content-Security-Policy': this.getCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };
  }

  getCSP() {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
  }

  async initializeSecurity() {
    try {
      // Hämta CSRF-token från servern
      const response = await fetch('/api/security/csrf-token');
      const { token } = await response.json();
      this.csrfToken = token;

      // Sätt säkerhetsheaders
      this.applySecurityHeaders();

      // Initiera säkerhetslyssnare
      this.initializeSecurityListeners();

      return true;
    } catch (error) {
      return ErrorHandler.handle(error, 'error.security.init');
    }
  }

  applySecurityHeaders() {
    Object.entries(this.securityHeaders).forEach(([key, value]) => {
      if (typeof document !== 'undefined') {
        document.head.appendChild(
          Object.assign(document.createElement('meta'), {
            httpEquiv: key,
            content: value
          })
        );
      }
    });
  }

  initializeSecurityListeners() {
    // Lyssna efter XSS-försök
    this.setupXSSDetection();
    
    // Lyssna efter CSRF-försök
    this.setupCSRFProtection();
    
    // Övervaka nätverksanrop
    this.setupNetworkMonitoring();
  }

  setupXSSDetection() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            this.scanForXSS(node);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanForXSS(node) {
    const dangerousAttributes = ['onclick', 'onerror', 'onload'];
    const dangerousValues = ['javascript:', 'data:'];

    // Kontrollera attribut
    if (node.attributes) {
      Array.from(node.attributes).forEach((attr) => {
        if (
          dangerousAttributes.includes(attr.name.toLowerCase()) ||
          dangerousValues.some(val => attr.value.toLowerCase().includes(val))
        ) {
          console.warn('Potential XSS detected:', node);
          node.remove();
        }
      });
    }

    // Kontrollera URL:er
    if (node.tagName === 'A' && node.href) {
      const url = node.href.toLowerCase();
      if (dangerousValues.some(val => url.includes(val))) {
        console.warn('Suspicious URL detected:', url);
        node.remove();
      }
    }
  }

  setupCSRFProtection() {
    if (this.csrfToken) {
      // Lägg till CSRF-token i alla utgående anrop
      const originalFetch = window.fetch;
      window.fetch = (url, options = {}) => {
        if (this.shouldAddCSRFToken(url, options.method)) {
          options.headers = {
            ...options.headers,
            'X-CSRF-Token': this.csrfToken
          };
        }
        return originalFetch(url, options);
      };
    }
  }

  shouldAddCSRFToken(url, method) {
    const nonGetMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    return nonGetMethods.includes(method?.toUpperCase());
  }

  setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      try {
        const response = await originalFetch(url, options);
        
        // Kontrollera efter misstänkta svarshuvuden
        this.checkResponseHeaders(response.headers);
        
        // Kontrollera efter misstänkt innehåll
        if (response.headers.get('content-type')?.includes('application/json')) {
          const clonedResponse = response.clone();
          const data = await clonedResponse.json();
          this.scanResponseData(data);
        }
        
        return response;
      } catch (error) {
        console.error('Network monitoring error:', error);
        throw error;
      }
    };
  }

  checkResponseHeaders(headers) {
    const suspiciousHeaders = [
      'X-Powered-By',
      'Server',
      'X-AspNet-Version'
    ];

    suspiciousHeaders.forEach(header => {
      if (headers.get(header)) {
        console.warn(`Sensitive header detected: ${header}`);
      }
    });
  }

  scanResponseData(data) {
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /key/i,
      /secret/i,
      /credential/i
    ];

    const scan = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null) return;

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;

        sensitivePatterns.forEach(pattern => {
          if (pattern.test(key)) {
            console.warn(`Sensitive data detected in response: ${currentPath}`);
          }
        });

        scan(value, currentPath);
      });
    };

    scan(data);
  }

  // Sanitera användarinput
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Validera URL:er
  validateUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        window.location.hostname,
        'api.example.com'
      ];

      return allowedDomains.includes(parsedUrl.hostname);
    } catch {
      return false;
    }
  }
}

export default memoize(() => new SecurityService())(); 