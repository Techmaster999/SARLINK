/* SARLINK IST & Admin sign-in page (Google OAuth) */
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import "./LoginPage.css";

// SARLINK brand mark (same hexagon used in the app header)
function BrandMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M15 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0" />
    </svg>
  );
}

export default function LoginPage() {
  const [formError, setFormError] = useState(
    new URLSearchParams(window.location.search).get("error") === "session_expired"
      ? "Your Google session expired or was revoked. Please sign in again."
      : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const login = useGoogleLogin({
    flow: "auth-code",
    ux_mode: "popup",
    access_type: "offline",
    prompt: "consent",
    onSuccess: async ({ code }) => {
      if (!code || isLoading) return;
      setFormError("");
      setIsLoading(true);
      try {
        await axios.post(
          "/api/auth/google",
          { code },
          { withCredentials: true, timeout: 15000 }
        );

        window.location.replace("/home");
      } catch (error) {
        console.error("Google sign-in failed:", error);
        const code = error.response?.data?.error;
        setFormError(
          code === "google_token_expired"
            ? "Your Google sign-in expired or was revoked. Please sign in again."
            : code === "google_reauth_required"
              ? "Google did not grant a renewable session. Please sign in again and approve access."
              : code === "missing_authorization_code"
                ? "Google did not return a sign-in code. Please try again."
                : error.code === "ECONNABORTED"
                  ? "Sign-in timed out. Check your connection and try again."
                  : "Google sign-in could not be completed. Please try again."
        );
        setIsLoading(false);
      }
    },
    onError: () => setFormError("Google sign-in was cancelled. Please try again when ready."),
  });

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
          Authorized personnel only. Sign in with your organization Google account.
        </p>

        <hr className="divider divider-lg" />

        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        <div className="google-login">
          {isLoading ? (
            <button type="button" className="btn btn-primary btn-block btn-lg" disabled>
              <span className="btn-spinner" aria-hidden="true" />
              Signing in…
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={() => login()}>
              Sign in with Google
            </button>
          )}
        </div>

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