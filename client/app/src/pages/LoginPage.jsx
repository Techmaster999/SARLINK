/* SARLINK IST & Admin sign-in page */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./LoginPage.css";

// Update these to match your backend
const LOGIN_ENDPOINT = "/api/auth/login";
const SUCCESS_REDIRECT = "/hub";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M47.532 24.552c0-1.636-.146-3.2-.418-4.698H24.48v8.882h12.982c-.56 3.016-2.26 5.573-4.816 7.29v6.054h7.796c4.558-4.198 7.09-10.386 7.09-17.528z"
        fill="#4285F4"
      />
      <path
        d="M24.48 48c6.52 0 11.988-2.164 15.984-5.858l-7.796-6.054c-2.162 1.45-4.928 2.306-8.188 2.306-6.3 0-11.634-4.254-13.538-9.972H2.874v6.246C6.854 42.692 15.09 48 24.48 48z"
        fill="#34A853"
      />
      <path
        d="M10.942 28.422A14.41 14.41 0 0 1 10.2 24c0-1.534.264-3.026.742-4.422v-6.246H2.874A23.988 23.988 0 0 0 .48 24c0 3.87.928 7.532 2.394 10.668l8.068-6.246z"
        fill="#FBBC05"
      />
      <path
        d="M24.48 9.604c3.554 0 6.74 1.222 9.252 3.622l6.94-6.94C36.462 2.396 30.998 0 24.48 0 15.09 0 6.854 5.308 2.874 13.332l8.068 6.246c1.904-5.718 7.238-9.974 13.538-9.974z"
        fill="#EA4335"
      />
    </svg>
  );
}

// SARLINK brand mark (same hexagon used in the app header)
function BrandMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M15 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0" />
    </svg>
  );
}

// Design-system Input: label, field and inline error
function Input({ id, label, error, ...rest }) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input
        className="field-input"
        id={id}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

// Returns an object of field -> message; empty object means valid
function validateCredentials(email, password) {
  const errors = {};
  if (!email) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

function getErrorMessage(error) {
  if (error.code === "ECONNABORTED") return "The request timed out. Please try again.";
  if (!error.response) return "Unable to reach the server. Check your connection and try again.";
  if (error.response.status === 401 || error.response.status === 403) {
    return "Invalid email or password.";
  }
  if (error.response.status === 429) return "Too many attempts. Please wait and try again.";
  return error.response.data?.message || "Something went wrong. Please try again.";
}

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef(null);

  // Cancel any in-flight request if the page unmounts
  useEffect(() => () => controllerRef.current?.abort(), []);

  function closeModal() {
    if (isLoading) return;
    setShowModal(false);
    setEmail("");
    setPassword("");
    setFieldErrors({});
    setFormError("");
  }

  function clearFieldError(name) {
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  }
  // acceptance criteria: subitting login triggers authentication request
  async function handleLoginSubmit(event) {
    event.preventDefault();
    if (isLoading) return;

    const trimmedEmail = email.trim();
    const errors = validateCredentials(trimmedEmail, password);
    setFieldErrors(errors);
    setFormError("");
    if (Object.keys(errors).length > 0) return; // block empty / malformed input

    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoading(true);

    try {
      await axios.post(
        LOGIN_ENDPOINT,
        { email: trimmedEmail, password },
        { signal: controller.signal, withCredentials: true, timeout: 15000 }
      );
      // Keep the loading state visible while the browser redirects
      window.location.href = SUCCESS_REDIRECT;
    } catch (error) {
      if (axios.isCancel(error)) return;
      setFormError(getErrorMessage(error));
      setIsLoading(false);
    }
  }
  // acceptance criteria: form is rendered inside the sign-in.
  function renderLoginForm() {
    // The form is rendered inside the sign-in modal.
    return (
      <form onSubmit={handleLoginSubmit} noValidate aria-busy={isLoading}>
        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        <fieldset className="form-fields" disabled={isLoading}>
          <Input
            id="login-email"
            label="Email"
            type="email"
            autoComplete="username"
            placeholder="you@organization.com"
            value={email}
            error={fieldErrors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError("email");
            }}
            autoFocus
          />
          <Input
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            error={fieldErrors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              clearFieldError("password");
            }}
          />
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </form>
    );
  }

  return (
    <main className="login-page">
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in with Google"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <GoogleIcon />
              <div>
                <p className="modal-title">Sign in</p>
                <p className="modal-subtitle">with your Google Account</p>
              </div>
            </div>

            {renderLoginForm()}
          </div>
        </div>
      )}

      <section className="sign-in-card">
        <div className="brand">
          <span className="brand-mark">
            <BrandMark />
          </span>
          <span className="brand-name">SARLINK</span>
          <span className="brand-tag">EDSAR</span>
        </div>

        <h1 className="card-title">SARLINK IST &amp; Admin Sign In</h1>

        <p className="card-description">
          Authorized personnel only. Sign in with your organization Google account.
        </p>

        <hr className="divider divider-lg" />

        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => setShowModal(true)}>
          <GoogleIcon />
          Sign in with Google
        </button>

        <hr className="divider divider-md" />

        <div className="card-footer">
          <p className="card-footer-text">Not an admin?</p>
          <a className="link" href="/check-in">
            Go to Incident Response Check-In Page
          </a>
        </div>
      </section>

      <p className="page-note">Access is restricted to authorized organization members only.</p>
    </main>
  );
}