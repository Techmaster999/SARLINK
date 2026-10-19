import React from 'react';
import {
  DEFAULT_NAV_ITEMS,
  checkAdminRole,
  renderSidebarLinks,
} from './sidebarNavData.js';
import './sidebar.css';

/**
 * Returns an SVG icon for a given icon key
 */
function renderNavIcon(iconKey) {
  const iconProps = {
    className: 'sarlink-nav-icon',
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: '2',
  };

  switch (iconKey) {
    case 'document':
      // Forms icon
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'shield':
      // Admin icon
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'fire':
    default:
      // Incident Hub icon
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
  }
}

/**
 * Component to render the adaptive navigation link items
 * Uses renderSidebarLinks and checkAdminRole
 */
export function SidebarLinks({
  user,
  currentPath = '/incidents',
  onNavigate = null,
  navItems = DEFAULT_NAV_ITEMS,
  linkComponent: CustomLink = null,
}) {
  // Subtask Function: renderSidebarLinks
  const authorizedLinks = renderSidebarLinks(user, navItems);

  return (
    <>
      {authorizedLinks.map((item) => {
        const isActive = currentPath === item.path;

        const handleClick = (e) => {
          if (onNavigate) {
            e.preventDefault();
            onNavigate(item.path);
          }
        };

        const linkContent = (
          <>
            {renderNavIcon(item.icon)}
            <span className="sarlink-nav-label">{item.label}</span>
            {item.badge && (
              <span className="sarlink-badge sarlink-admin-badge">
                {item.badge}
              </span>
            )}
          </>
        );

        // If team passes react-router-dom Link / NavLink component
        if (CustomLink) {
          return (
            <CustomLink
              key={item.id}
              to={item.path}
              id={`nav-link-${item.id}`}
              className={`sarlink-nav-item ${isActive ? 'active' : ''}`}
              onClick={handleClick}
              aria-current={isActive ? 'page' : undefined}
              title={item.description || item.label}
            >
              {linkContent}
            </CustomLink>
          );
        }

        // Standard semantic navigation link
        return (
          <a
            key={item.id}
            href={item.path}
            id={`nav-link-${item.id}`}
            className={`sarlink-nav-item ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            aria-current={isActive ? 'page' : undefined}
            title={item.description || item.label}
          >
            {linkContent}
          </a>
        );
      })}
    </>
  );
}

/**
 * SARLink Sidebar Navigation Component
 * 
 * Jira Subtask DT-40:
 * - "Sidebar should include links to Forms, and Admin (if logged in as an admin) page"
 * 
 * Required Functions implemented:
 * - checkAdminRole
 * - renderSidebarLinks
 * 
 * @param {Object} props
 * @param {Object|null} [props.user] - Current authenticated user
 * @param {string} [props.currentPath='/incidents'] - Currently active route
 * @param {Function} [props.onNavigate] - Navigation handler callback (path) => void
 * @param {Array} [props.navItems] - Optional navigation items override
 * @param {React.Component} [props.linkComponent] - Optional react-router-dom Link / NavLink
 */
export function Sidebar({
  user = null,
  currentPath = '/incidents',
  onNavigate = null,
  navItems = DEFAULT_NAV_ITEMS,
  linkComponent = null,
}) {
  // Subtask Function: checkAdminRole
  const isAdmin = checkAdminRole(user);

  // User details formatting
  const userName = user?.name || (isAdmin ? 'Incident Commander' : 'SAR Responder');
  const userRoleDisplay = isAdmin ? 'Administrator' : 'Responder';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'SR';

  return (
    <aside className="sarlink-sidebar" aria-label="SARLink Navigation Sidebar">
      {/* Brand Header */}
      <div className="sarlink-sidebar-brand">
        <div className="sarlink-sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="sarlink-sidebar-title-group">
          <span className="sarlink-sidebar-app-name">SARLINK</span>
          <span className="sarlink-sidebar-app-tag">Incident Hub</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sarlink-sidebar-nav" aria-label="Main Navigation">
        <div className="sarlink-nav-section-label">Operations</div>
        <SidebarLinks
          user={user}
          currentPath={currentPath}
          onNavigate={onNavigate}
          navItems={navItems}
          linkComponent={linkComponent}
        />
      </nav>

      {/* User Profile Footer */}
      <div className="sarlink-sidebar-footer">
        <div className="sarlink-user-avatar" title={userName}>
          {userInitials}
        </div>
        <div className="sarlink-user-details">
          <span className="sarlink-user-name">{userName}</span>
          <span className={`sarlink-user-role ${isAdmin ? 'admin' : ''}`}>
            {isAdmin ? '🛡️ ' : ''}{userRoleDisplay}
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
