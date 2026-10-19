/* SARLINK IST & Admin sign-in page (React + axios, email + password) */
import { GoogleLogin } from "@react-oauth/google";
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
  const [formError, setFormError] = useState("");
  async function handleGoogleSuccess({ credential }) {
    if (!credential) {
      setFormError("Google did not return a credential. Please try again.");
      return;
    }

    setFormError("");
    try {
      await axios.post(
        "/api/auth/google",
        { credential },
        { withCredentials: true, timeout: 15000 }
      );

      window.location.href = "/home";
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setFormError("Unable to sign in with Google. Please try again.");
    }
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

        {formError && (
          <div className="form-alert" role="alert">
            {formError}
          </div>
        )}

        <div className="google-login custom-google-login">
          <button type="button" className="btn btn-primary btn-block btn-lg">
            Sign in
          </button>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setFormError("Google sign-in was cancelled or failed.")}
            useOneTap={false}
            text="signin"
            width="100%"
          />
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