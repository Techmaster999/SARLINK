import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_CALLOUT_PATH,
  handleCreateCalloutClick,
  handleUserSignOut,
} from './headerActions.js';
import './header.css';

function SarLinkLogo() {
  return (
    <svg
      className="sarlink-header-logo-mark"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5v11A1.5 1.5 0 0 0 4.5 17H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="m13 6 4 4-4 4M17 10H7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * SARLink application header.
 *
 * Jira DT-152 acceptance criteria:
 * - Includes an option to create a new callout.
 * - Includes an option to sign out of the current login session.
 *
 * The Sign Out button only exposes a callback hook. Session-ending behavior is
 * intentionally left for the authentication implementation.
 */
export function Header({
  onCreateCallout = null,
  onSignOut = null,
  calloutPath = DEFAULT_CALLOUT_PATH,
  className = '',
}) {
  const navigate = useNavigate();

  const createCallout = () => {
    handleCreateCalloutClick({
      navigate,
      onCreateCallout,
      path: calloutPath,
    });
  };

  const signOut = () => {
    handleUserSignOut({ onSignOut });
  };

  return (
    <header className={`sarlink-header ${className}`.trim()}>
      <div className="sarlink-header-brand" aria-label="SARLINK EDSAR">
        <span className="sarlink-header-logo">
          <SarLinkLogo />
        </span>
        <span className="sarlink-header-name">SARLINK</span>
        <span className="sarlink-header-agency">EDSAR</span>
      </div>

      <div className="sarlink-header-actions">
        <button
          type="button"
          className="sarlink-header-button sarlink-header-button-primary"
          onClick={createCallout}
          aria-label="Create new callout"
        >
          <span className="sarlink-header-button-icon"><PlusIcon /></span>
          <span className="sarlink-header-button-label">New Callout</span>
        </button>

        <span className="sarlink-header-divider" aria-hidden="true" />

        <button
          type="button"
          className="sarlink-header-button sarlink-header-button-secondary"
          onClick={signOut}
          aria-label="Sign out"
        >
          <span className="sarlink-header-button-icon"><SignOutIcon /></span>
          <span className="sarlink-header-button-label">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
