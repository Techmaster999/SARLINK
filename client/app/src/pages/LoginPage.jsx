/* SARLINK IST & Admin sign-in page (React + axios, email + password) */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./LoginPage.css";

// Update these to match your backend
const LOGIN_ENDPOINT = "/api/auth/login";
const SUCCESS_REDIRECT = "/home";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const controllerRef = useRef(null);

  // Cancel any in-flight request if the page unmounts
  useEffect(() => () => controllerRef.current?.abort(), []);

  function clearFieldError(name) {
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
    setFormError("");
  }

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

  function renderLoginForm() {
    return (
      <form className="login-form" onSubmit={handleLoginSubmit} noValidate aria-busy={isLoading}>
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

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="btn-spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    );
  }

  return (
    <main className="login-page">
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
          Authorized personnel only. Sign in with your organization email and password.
        </p>

        <hr className="divider divider-lg" />

        {renderLoginForm()}

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