
/**
 * Standard SARLink navigation items configuration
 * DT-40 Acceptance Criteria:
 * - The sidebar includes a link to Forms.
 * - The sidebar includes a link to Admin if the user is logged in as an admin.
 */
export const DEFAULT_NAV_ITEMS = [
  {
    id: 'incidents',
    label: 'Incident Hub',
    path: '/incidents',
    icon: 'fire',
    requiresAdmin: false,
    description: 'Overview of ongoing and resolved incidents'
  },
  {
    id: 'forms',
    label: 'Forms',
    path: '/forms',
    icon: 'document',
    requiresAdmin: false,
    description: 'Operational forms, incident logs, and field reports'
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: 'shield',
    requiresAdmin: true,
    badge: 'Admin',
    description: 'System administration, user access, and team configuration'
  }
];

export const INCIDENT_NAV_ITEMS = [
  {
    id: 'incidents',
    label: 'Incidents',
    path: '/incident-hub',
    icon: 'fire',
    requiresAdmin: false,
    description: 'Overview of ongoing and resolved incidents'
  },
  {
    id: 'map',
    label: 'Area Map',
    path: '/incident-hub/map',
    icon: 'map',
    requiresAdmin: false,
    description: 'View the incident area map'
  },
  {
    id: 'forms',
    label: 'Forms',
    path: '/incident-hub/forms',
    icon: 'document',
    requiresAdmin: false,
    description: 'Operational forms and field reports'
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/incident-hub/admin',
    icon: 'shield',
    requiresAdmin: false,
    description: 'System administration'
  },
  {
    id: 'new-incident',
    label: 'New Incident',
    path: '/incident-creation',
    icon: 'plus',
    requiresAdmin: false,
    description: 'Create a new incident'
  }
];

/**
 * Subtask Function: checkAdminRole
 * 
 * Determines whether the given user object holds administrative permissions.
 * Supports multiple common user schemas (role string, isAdmin boolean, nested roles).
 * 
 * @param {Object|boolean|string|null} user - The user object to inspect
 * @returns {boolean} True if user is an administrator, false otherwise
 */
export function checkAdminRole(user) {
  if (!user) return false;
  if (typeof user === 'boolean') return user;
  if (typeof user === 'string') return user.trim().toLowerCase() === 'admin';

  return Boolean(
    user.isAdmin === true ||
    (typeof user.role === 'string' && user.role.trim().toLowerCase() === 'admin') ||
    (Array.isArray(user.roles) && user.roles.some((r) => String(r).trim().toLowerCase() === 'admin'))
  );
}

// Backward-compatible alias
export const isUserAdmin = checkAdminRole;

/**
 * Subtask Function: renderSidebarLinks
 * 
 * Generates and filters the sidebar navigation links adapting to user roles and permissions.
 * Guarantees:
 * 1. The sidebar includes a link to Forms.
 * 2. The sidebar includes a link to Admin if the user is logged in as an admin.
 * 
 * @param {Object|null} user - The current user object
 * @param {Array} [navItems=DEFAULT_NAV_ITEMS] - Optional nav items configuration
 * @returns {Array} List of authorized navigation link definitions
 */
export function renderSidebarLinks(user, navItems = DEFAULT_NAV_ITEMS) {
  const isAdmin = checkAdminRole(user);

  return navItems.filter((item) => {
    // If the link requires admin, only include it if checkAdminRole returns true
    if (item.requiresAdmin) {
      return isAdmin;
    }
    return true;
  });
}

// Backward-compatible alias
export const getVisibleNavItems = renderSidebarLinks;
