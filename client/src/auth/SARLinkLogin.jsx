import React, { useState } from 'react';
import axios from 'axios';
import { handleAuthError } from './handleAuthError.js';
import { displayAuthFeedback } from './displayAuthFeedback.js';
import { AuthFeedback } from './AuthFeedback.jsx';
import './login.css';

/**
 * SARLink Login Component
 * 
 * Supports:
 * - Google Workspace Single Sign-On (Client Identity Provider)
 * - Standard Client Credentials authentication
 * - Robust error handling & user feedback via handleAuthError and displayAuthFeedback
 * - Loading and disabled states to prevent double-submissions
 */
export function SARLinkLogin({ apiBaseUrl = '/api/auth' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  /**
   * Clears active feedback notifications
   */
  const clearFeedback = () => setFeedback(null);

  /**
   * Handle Google Workspace Single Sign-On
   */
  const handleGoogleWorkspaceSignIn = async () => {
    setIsLoading(true);
    clearFeedback();

    try {
      // Initiate Google Workspace OAuth flow via Axios / IdP endpoint
      const response = await axios.post(`${apiBaseUrl}/google-workspace`, {}, {
        timeout: 10000,
      });

      // Seamless redirect if auth URL is returned
      if (response?.data?.authUrl) {
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      // Use handleAuthError and displayAuthFeedback without crashing or leaking traces
      displayAuthFeedback(error, setFeedback);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Standard Credentials Submission
   */
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    // Client-side quick check
    if (!email || !password) {
      displayAuthFeedback({
        response: {
          status: 400,
          data: { message: 'Please enter both your email and password.' }
        }
      }, setFeedback);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/google`, {
        email,
        password,
      }, {
        timeout: 8000, // 8-second timeout for testing timeout scenarios
      });

      // Handle successful authentication
      if (response?.data?.token) {
        // Redirect or notify success
        window.location.href = '/dashboard';
      }
    } catch (error) {
      // Subtask Requirement: handleAuthError & displayAuthFeedback
      displayAuthFeedback(error, setFeedback);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Testing helpers to simulate acceptance criteria scenarios
   * (Allows teammates and reviewers to instantly test all edge cases)
   */
  const simulateError = (type) => {
    setIsLoading(false);
    switch (type) {
      case 'INVALID_CREDENTIALS':
        displayAuthFeedback({
          isAxiosError: true,
          response: { status: 401, data: { message: 'Unauthorized' } }
        }, setFeedback);
        break;

      case 'ACCOUNT_LOCKED':
        displayAuthFeedback({
          isAxiosError: true,
          response: {
            status: 423,
            data: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to 5 failed attempts' }
          }
        }, setFeedback);
        break;

      case 'NETWORK_TIMEOUT':
        displayAuthFeedback({
          isAxiosError: true,
          code: 'ECONNABORTED',
          message: 'timeout of 8000ms exceeded'
        }, setFeedback);
        break;

      case 'GOOGLE_WORKSPACE_DENIED':
        displayAuthFeedback({
          error: 'access_denied',
          error_description: 'Organization domain not permitted'
        }, setFeedback);
        break;

      case 'SERVER_ERROR':
        displayAuthFeedback({
          isAxiosError: true,
          response: {
            status: 500,
            data: { error: 'Database connection failed at pg_connect (/var/internal/pg.js:142)' }
          }
        }, setFeedback);
        break;

      case 'EXCEPTION_SAFETY_TEST':
        // Simulates an unpredictable or throwing error to prove it never crashes
        displayAuthFeedback(new TypeError('Uncaught client side malformed state'), setFeedback);
        break;

      default:
        clearFeedback();
    }
  };

  return (
    <div className="sarlink-login-wrapper">
      <div className="sarlink-login-card">
        {/* Brand Header */}
        <div className="sarlink-brand-header">
          <div className="sarlink-logo-badge">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>SARLINK</span>
          </div>
          <h1 className="sarlink-brand-title">Sign In to SARLink</h1>
          <p className="sarlink-brand-subtitle">
            Secure client credential access & Google Workspace identity
          </p>
        </div>

        {/* User-Facing Feedback Banner */}
        <AuthFeedback
          feedback={feedback}
          onDismiss={clearFeedback}
          onRetry={handleCredentialsSubmit}
        />

        {/* Primary IdP: Google Workspace SSO */}
        <button
          type="button"
          className="sarlink-google-btn"
          onClick={handleGoogleWorkspaceSignIn}
          disabled={isLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign in with Google Workspace</span>
        </button>

        {/* Divider */}
        <div className="sarlink-auth-divider">
          <span>Or sign in with email</span>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleCredentialsSubmit}>
          <div className="sarlink-form-group">
            <label className="sarlink-form-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="sarlink-form-input"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="sarlink-form-group">
            <label className="sarlink-form-label" htmlFor="password-input">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              className="sarlink-form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            className="sarlink-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Acceptance Criteria Simulator (For Jira Testing / Demo) */}
        <details className="sarlink-test-panel">
          <summary>⚙️ Jira DT-112 Verification Controls</summary>
          <div className="sarlink-test-grid">
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('INVALID_CREDENTIALS')}
            >
              ⚠️ Test Invalid (401)
            </button>
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('ACCOUNT_LOCKED')}
            >
              🔒 Test Lockout (423)
            </button>
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('NETWORK_TIMEOUT')}
            >
              ⏱️ Test Timeout / Network
            </button>
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('GOOGLE_WORKSPACE_DENIED')}
            >
              🏢 Test Google IdP Denied
            </button>
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('SERVER_ERROR')}
            >
              💥 Test Server 500 (Masked)
            </button>
            <button
              type="button"
              className="sarlink-test-btn"
              onClick={() => simulateError('EXCEPTION_SAFETY_TEST')}
            >
              🛡️ Test Crash Protection
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}

export default SARLinkLogin;
