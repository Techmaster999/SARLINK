const REDACTED_VALUE = "[REDACTED]";

/**
 * Credential-related property names that must never appear in logs
 * or error responses.
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "passphrase",
  "secret",
  "clientsecret",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "sessiontoken",
  "token",
  "authorization",
  "cookie",
  "setcookie",
  "apikey",
  "credential",
  "credentials",
]);

/**
 * Normalizes property names so values such as access_token,
 * access-token, and accessToken are treated the same.
 */
function normalizeKey(key) {
  return String(key).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function isSensitiveKey(key) {
  const normalizedKey = normalizeKey(key);

  return (
    SENSITIVE_KEYS.has(normalizedKey) ||
    normalizedKey.endsWith("password") ||
    normalizedKey.endsWith("secret") ||
    normalizedKey.endsWith("token")
  );
}

/**
 * Removes credentials that might appear inside an error message
 * or other string.
 */
function sanitizeText(value) {
  return value
    .replace(/\b(Bearer|Basic)\s+[^\s,;]+/gi, "$1 [REDACTED]")
    .replace(
      /([?&](?:password|token|access_token|refresh_token|api_key)=)[^&\s]+/gi,
      "$1[REDACTED]",
    );
}

/**
 * Returns a sanitized copy of an authentication payload.
 *
 * Passwords, session tokens, OAuth tokens, authorization headers,
 * cookies, and related credentials are replaced with [REDACTED].
 * The original payload is not changed.
 */
function sanitizeAuthPayload(payload) {
  const visitedObjects = new WeakSet();

  function sanitizeValue(value) {
    if (typeof value === "string") {
      return sanitizeText(value);
    }

    if (
      value === null ||
      value === undefined ||
      typeof value !== "object"
    ) {
      return value;
    }

    if (visitedObjects.has(value)) {
      return "[CIRCULAR]";
    }

    visitedObjects.add(value);

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: sanitizeText(value.message),
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item));
    }

    const sanitizedObject = {};

    for (const [key, propertyValue] of Object.entries(value)) {
      sanitizedObject[key] = isSensitiveKey(key)
        ? REDACTED_VALUE
        : sanitizeValue(propertyValue);
    }

    return sanitizedObject;
  }

  return sanitizeValue(payload);
}

/**
 * Audits session-cookie settings against the credential-security
 * requirements.
 *
 * Accepts either a cookie configuration directly or an object
 * containing a cookie property.
 */
function auditCredentialSecurity(configuration = {}) {
  const cookie = configuration.cookie || configuration;
  const sameSite =
    typeof cookie.sameSite === "string"
      ? cookie.sameSite.toLowerCase()
      : cookie.sameSite;

  const checks = {
    httpOnly: cookie.httpOnly === true,
    secure: cookie.secure === true,
    sameSite: ["strict", "lax", "none"].includes(sameSite),
  };

  const issues = [];

  if (!checks.httpOnly) {
    issues.push("The session cookie must use HttpOnly.");
  }

  if (!checks.secure) {
    issues.push("The session cookie must use Secure.");
  }

  if (!checks.sameSite) {
    issues.push("The session cookie must use SameSite.");
  }

  if (sameSite === "none" && cookie.secure !== true) {
    issues.push("A SameSite=None cookie must also use Secure.");
  }

  return {
    passed: issues.length === 0,
    checks,
    issues,
  };
}

module.exports = {
  sanitizeAuthPayload,
  auditCredentialSecurity,
};