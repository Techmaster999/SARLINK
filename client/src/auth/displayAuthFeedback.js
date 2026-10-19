import { handleAuthError, AuthErrorType } from './handleAuthError.js';

/**
 * Functional feedback dispatcher required by the subtask specification.
 * 
 * Safely processes an error and triggers feedback via a state setter or callback.
 * Guaranteed never to crash the client application or expose stack traces.
 * 
 * @param {any} errorOrFeedback - Raw error or parsed feedback object
 * @param {Function} [setterCallback] - React state setter (e.g. setFeedback)
 * @returns {Object} The sanitized feedback object
 */
export function displayAuthFeedback(errorOrFeedback, setterCallback) {
  try {
    // If it's already a sanitized feedback object, use it; otherwise process with handleAuthError
    const isAlreadyProcessed =
      errorOrFeedback &&
      typeof errorOrFeedback === 'object' &&
      errorOrFeedback.type &&
      errorOrFeedback.message;

    const feedback = isAlreadyProcessed ? errorOrFeedback : handleAuthError(errorOrFeedback);

    // If caller provided a React state setter (e.g. setAuthFeedback), dispatch it safely
    if (typeof setterCallback === 'function') {
      setterCallback(feedback);
    }

    return feedback;
  } catch (err) {
    // Failsafe to protect the client app from crashing
    const fallbackFeedback = {
      type: AuthErrorType.UNKNOWN_ERROR,
      title: 'Sign-In Error',
      message: 'An error occurred during authentication. Please try again.',
      actionableTip: 'Please refresh the page and try again.',
      canRetry: true,
      timestamp: new Date().toISOString(),
    };

    if (typeof setterCallback === 'function') {
      setterCallback(fallbackFeedback);
    }

    return fallbackFeedback;
  }
}

export default displayAuthFeedback;
