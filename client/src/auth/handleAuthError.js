/**
 * Standardized authentication error categories
 */
export const AuthErrorType = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GOOGLE_WORKSPACE_ERROR: 'GOOGLE_WORKSPACE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Helper to safely detect Axios errors even if axios is dynamically loaded or not yet installed
 */
export function isAxiosError(error) {
  if (!error || typeof error !== 'object') return false;
  return Boolean(error.isAxiosError || error.constructor?.name === 'AxiosError' || error.config);
}

/**
 * Parses authentication errors and generates user-safe, actionable feedback.
 * 
 * Acceptance Criteria Met:
 * 1. User-facing messages clearly indicate invalid credentials, network issues, or account lockouts.
 * 2. Exceptions never crash the client application (wrapped in fail-safe try/catch).
 * 3. Never leaks stack traces, query details, or raw server internals to the user.
 * 4. Supports Google Workspace identity provider error conditions.
 * 
 * @param {any} error - The caught error object (Axios error, Error, string, or IdP response)
 * @returns {Object} Sanitized feedback object suitable for display
 */
export function handleAuthError(error) {
  try {
    // Default safe fallback feedback (never exposes error.stack)
    const fallback = {
      type: AuthErrorType.UNKNOWN_ERROR,
      title: 'Authentication Failed',
      message: 'Unable to sign in. Please verify your details and try again.',
      actionableTip: 'If the problem persists, please reach out to your SARLink administrator.',
      statusCode: null,
      canRetry: true,
      timestamp: new Date().toISOString(),
    };

    if (!error) {
      return fallback;
    }

    // --- Scenario 1: Google Workspace / OAuth Identity Provider Errors ---
    const oauthError = error?.error || error?.response?.data?.error;

    if (oauthError) {
      if (oauthError === 'popup_closed_by_user') {
        return {
          type: AuthErrorType.GOOGLE_WORKSPACE_ERROR,
          title: 'Sign-In Cancelled',
          message: 'The Google Workspace sign-in window was closed before completing authentication.',
          actionableTip: 'Please click "Sign in with Google Workspace" again and complete the prompt.',
          statusCode: 400,
          canRetry: true,
          timestamp: new Date().toISOString(),
        };
      }

      if (oauthError === 'access_denied' || oauthError === 'unauthorized_client') {
        return {
          type: AuthErrorType.GOOGLE_WORKSPACE_ERROR,
          title: 'Google Workspace Access Denied',
          message: 'Your Google account is not authorized to access the SARLink organization portal.',
          actionableTip: 'Ensure you are signing in with your official organizational email address.',
          statusCode: 403,
          canRetry: false,
          timestamp: new Date().toISOString(),
        };
      }

      if (oauthError === 'invalid_grant') {
        return {
          type: AuthErrorType.INVALID_CREDENTIALS,
          title: 'Session Expired',
          message: 'Your Google Workspace authentication token has expired or is invalid.',
          actionableTip: 'Please restart the sign-in process to obtain a fresh token.',
          statusCode: 401,
          canRetry: true,
          timestamp: new Date().toISOString(),
        };
      }
    }

    // --- Scenario 2: Axios Network Errors & Timeouts ---
    const errorCode = error?.code;
    const isNetworkTimeout = errorCode === 'ECONNABORTED' || error?.message?.toLowerCase().includes('timeout');
    const isNetworkOffline = errorCode === 'ERR_NETWORK' || (!error?.response && Boolean(error?.request));

    if (isNetworkTimeout) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        title: 'Connection Timed Out',
        message: 'The authentication server took too long to respond. Your network connection might be slow or unstable.',
        actionableTip: 'Check your internet connection and try submitting again.',
        statusCode: 408,
        canRetry: true,
        timestamp: new Date().toISOString(),
      };
    }

    if (isNetworkOffline && !error?.response) {
      return {
        type: AuthErrorType.NETWORK_ERROR,
        title: 'Network Communication Error',
        message: 'Unable to reach the SARLink authentication service. You may be offline or experiencing connection drops.',
        actionableTip: 'Please check your Wi-Fi or local network connection and try again.',
        statusCode: null,
        canRetry: true,
        timestamp: new Date().toISOString(),
      };
    }

    // --- Scenario 3: HTTP Status Responses (Axios error.response) ---
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.message || '';
    const serverCode = error?.response?.data?.code || '';

    // HTTP 423 Locked OR explicit lockout message/code
    const isLockout =
      status === 423 ||
      serverCode === 'ACCOUNT_LOCKED' ||
      serverCode === 'TOO_MANY_ATTEMPTS' ||
      /locked|suspended|too many (failed )?attempts/i.test(serverMessage);

    if (isLockout) {
      return {
        type: AuthErrorType.ACCOUNT_LOCKED,
        title: 'Account Temporarily Locked',
        message: 'This account has been temporarily locked for security due to multiple consecutive failed sign-in attempts.',
        actionableTip: 'Please wait 15 minutes before trying again, or contact your team administrator to unlock your account.',
        statusCode: status || 423,
        canRetry: false,
        timestamp: new Date().toISOString(),
      };
    }

    // HTTP 401 Unauthorized (Invalid credentials)
    if (status === 401) {
      return {
        type: AuthErrorType.INVALID_CREDENTIALS,
        title: 'Invalid Credentials',
        message: 'The email or password you entered is incorrect.',
        actionableTip: 'Double check your username and password, or use your organization Google Workspace account.',
        statusCode: 401,
        canRetry: true,
        timestamp: new Date().toISOString(),
      };
    }

    // HTTP 403 Forbidden (Account inactive, permission denied, or IP restricted)
    if (status === 403) {
      return {
        type: AuthErrorType.ACCOUNT_LOCKED,
        title: 'Access Restricted',
        message: 'Your account is not permitted to sign in to this SARLink instance.',
        actionableTip: 'Contact your organization administrator to verify your active user status.',
        statusCode: 403,
        canRetry: false,
        timestamp: new Date().toISOString(),
      };
    }

    // HTTP 429 Too Many Requests
    if (status === 429) {
      return {
        type: AuthErrorType.ACCOUNT_LOCKED,
        title: 'Rate Limit Reached',
        message: 'Too many authentication requests were received in a short time frame.',
        actionableTip: 'Please pause for a minute before trying to sign in again.',
        statusCode: 429,
        canRetry: false,
        timestamp: new Date().toISOString(),
      };
    }

    // HTTP 500/502/503/504 Server Errors (Mask raw database/server stack traces)
    if (status >= 500) {
      return {
        type: AuthErrorType.SERVER_ERROR,
        title: 'Authentication Service Unavailable',
        message: 'The SARLink authentication servers encountered an unexpected issue while validating your request.',
        actionableTip: 'Our technical team has been alerted. Please try signing in again shortly.',
        statusCode: status,
        canRetry: true,
        timestamp: new Date().toISOString(),
      };
    }

    // If a clean message was provided by backend API without raw stack traces
    if (typeof serverMessage === 'string' && serverMessage.length > 0 && serverMessage.length < 150) {
      return {
        type: AuthErrorType.UNKNOWN_ERROR,
        title: 'Sign-In Error',
        message: serverMessage,
        actionableTip: 'Please verify your information and try again.',
        statusCode: status || null,
        canRetry: true,
        timestamp: new Date().toISOString(),
      };
    }

    return fallback;
  } catch (internalException) {
    // Failsafe: Under NO circumstance will an error parsing failure crash the client app
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      title: 'Sign-In Error',
      message: 'An unexpected issue occurred while processing your sign-in attempt.',
      actionableTip: 'Please refresh the page and try again.',
      statusCode: null,
      canRetry: true,
      timestamp: new Date().toISOString(),
    };
  }
}
