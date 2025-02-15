import { toast } from "react-hot-toast";
import i18next from "i18next";

export class ErrorHandler {
  static errorMessages = {
    network: 'error.network',
    unauthorized: 'error.unauthorized',
    forbidden: 'error.forbidden',
    notFound: 'error.notFound',
    validation: 'error.validation',
    server: 'error.server',
    unknown: 'error.unknown'
  };

  static getErrorMessage(error) {
    if (!error) return this.translate(this.errorMessages.unknown);

    // Hantera nätverksfel
    if (!error.response) {
      return this.translate(this.errorMessages.network);
    }

    // Hantera API-fel
    const status = error.response.status;
    switch (status) {
      case 400:
        return this.getValidationError(error.response.data);
      case 401:
        return this.translate(this.errorMessages.unauthorized);
      case 403:
        return this.translate(this.errorMessages.forbidden);
      case 404:
        return this.translate(this.errorMessages.notFound);
      case 500:
        return this.translate(this.errorMessages.server);
      default:
        return this.translate(this.errorMessages.unknown);
    }
  }

  static getValidationError(data) {
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(err => this.translate(err.message)).join(', ');
    }
    return data.message ? this.translate(data.message) : this.translate(this.errorMessages.validation);
  }

  static translate(key, params = {}) {
    return i18next.t(key, params);
  }

  static handle(error, options = {}) {
    const {
      showToast = true,
      logError = true,
      defaultMessage
    } = options;

    const message = this.getErrorMessage(error) || defaultMessage;

    if (showToast) {
      toast.error(message);
    }

    if (logError) {
      this.logError(error, message);
    }

    return Promise.reject(error);
  }

  static logError(error, message) {
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Details');
      console.error('Message:', message);
      console.error('Error:', error);
      console.error('Stack:', error?.stack);
      console.groupEnd();
    }
    
    // Här kan vi implementera loggning till en tjänst som Sentry
  }
} 