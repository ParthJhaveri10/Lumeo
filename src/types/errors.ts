/**
 * @fileoverview Error handling system for Saavn API
 * @author Principal Software Engineer
 * @version 2.0.0
 */

/**
 * Base error class for all Saavn API errors
 */
export class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
  }

  /**
   * Serializes error for logging/debugging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }

  /**
   * Creates user-friendly error message
   */
  getUserMessage(): string {
    return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Network-related errors (timeouts, connection issues, etc.)
 */
export class NetworkError extends BaseError {
  public readonly originalError?: Error;

  constructor(
    message: string,
    originalError?: Error
  ) {
    super(message, { originalError: originalError?.message });
    this.originalError = originalError;
  }

  getUserMessage(): string {
    return 'Network error. Please check your connection and try again.';
  }
}

/**
 * API response errors (4xx, 5xx status codes)
 */
export class ApiResponseError extends BaseError {
  public readonly statusCode: number;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    statusCode: number,
    responseData?: unknown
  ) {
    super(message, { statusCode, responseData });
    this.statusCode = statusCode;
    this.responseData = responseData;
  }

  getUserMessage(): string {
    if (this.statusCode === 404) {
      return 'Content not found. Please check your search terms.';
    }
    if (this.statusCode === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (this.statusCode >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'Request failed. Please try again.';
  }
}

/**
 * Input validation errors
 */
export class ValidationError extends BaseError {
  public readonly field?: string;

  constructor(
    message: string,
    field?: string
  ) {
    super(message, { field });
    this.field = field;
  }

  getUserMessage(): string {
    return this.message;
  }
}

/**
 * General Saavn API errors
 */
export class SaavnApiError extends BaseError {
  public readonly operation?: string;

  constructor(
    message: string,
    operation?: string,
    context?: Record<string, unknown>
  ) {
    super(message, { operation, ...context });
    this.operation = operation;
  }

  getUserMessage(): string {
    return 'API request failed. Please try again.';
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends BaseError {
  public readonly retryAfter?: number;

  constructor(
    message: string,
    retryAfter?: number
  ) {
    super(message, { retryAfter });
    this.retryAfter = retryAfter;
  }

  getUserMessage(): string {
    const retryMessage = this.retryAfter 
      ? ` Please wait ${this.retryAfter} seconds before trying again.`
      : ' Please wait a moment before trying again.';
    return `Rate limit exceeded.${retryMessage}`;
  }
}