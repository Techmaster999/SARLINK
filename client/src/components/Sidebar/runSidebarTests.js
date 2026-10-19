/**
 * Acceptance Criteria Verification Runner for Subtask DT-40
 * 
 * Subtask:
 * "Sidebar should include links to Forms, and Admin (if logged in as an admin) page"
 * 
 * Required Functions:
 * - renderSidebarLinks
 * - checkAdminRole
 * 
 * Required Libraries:
 * - react, react-router-dom
 * 
 * Tests:
 * 1. The sidebar includes a link to Forms.
 * 2. The sidebar includes a link to Admin if the user is logged in as an admin.
 * 3. The sidebar excludes the Admin link if the user is not an admin.
 * 4. checkAdminRole safely and accurately verifies administrative privileges.
 */

import {
  DEFAULT_NAV_ITEMS,
  renderSidebarLinks,
  checkAdminRole
} from './sidebarNavData.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName} ${details ? `(${details})` : ''}`);
  }
}

console.log('\n======================================================');
console.log('SARLINK JIRA DT-40: SIDEBAR LINKS TEST SUITE');
console.log('======================================================\n');

// Test 1: Forms link is always included
console.log('--- Criterion 1: Link to Forms ---');
const defaultItems = renderSidebarLinks(null);
const formsItem = defaultItems.find((item) => item.id === 'forms');
assert(
  Boolean(formsItem),
  'Sidebar contains Forms link via renderSidebarLinks'
);
assert(
  formsItem?.path === '/forms',
  'Forms link points to /forms'
);

// Test 2: Admin link is hidden for non-admin users
console.log('\n--- Criterion 2: Admin link hidden for non-admin ---');
const regularUser = { name: 'Jane Doe', role: 'user', isAdmin: false };
const regularItems = renderSidebarLinks(regularUser);
const adminLinkForUser = regularItems.find((item) => item.id === 'admin');
assert(
  adminLinkForUser === undefined,
  'Admin link is NOT visible for regular user (role: "user")'
);

const anonymousItems = renderSidebarLinks(null);
assert(
  anonymousItems.find((item) => item.id === 'admin') === undefined,
  'Admin link is NOT visible when user is null / unauthenticated'
);

// Test 3: Admin link is visible for admin users
console.log('\n--- Criterion 3: Admin link visible for admin users ---');
const adminUserByRole = { name: 'Chief Commander', role: 'admin' };
const adminItems1 = renderSidebarLinks(adminUserByRole);
const adminLink1 = adminItems1.find((item) => item.id === 'admin');
assert(
  Boolean(adminLink1),
  'Admin link IS visible when user.role === "admin"'
);
assert(
  adminLink1?.path === '/admin',
  'Admin link points to /admin'
);

const adminUserByFlag = { name: 'Ops Admin', isAdmin: true };
const adminItems2 = renderSidebarLinks(adminUserByFlag);
assert(
  Boolean(adminItems2.find((item) => item.id === 'admin')),
  'Admin link IS visible when user.isAdmin === true'
);

const adminUserByRolesArray = { name: 'Team Lead', roles: ['responder', 'admin'] };
const adminItems3 = renderSidebarLinks(adminUserByRolesArray);
assert(
  Boolean(adminItems3.find((item) => item.id === 'admin')),
  'Admin link IS visible when user.roles includes "admin"'
);

// Test 4: Role evaluation function checkAdminRole
console.log('\n--- Criterion 4: checkAdminRole implementation ---');
assert(typeof checkAdminRole === 'function', 'checkAdminRole is exported as a function');
assert(checkAdminRole({ role: 'admin' }) === true, 'checkAdminRole detects { role: "admin" }');
assert(checkAdminRole({ role: 'ADMIN' }) === true, 'checkAdminRole is case insensitive for "ADMIN"');
assert(checkAdminRole({ isAdmin: true }) === true, 'checkAdminRole detects { isAdmin: true }');
assert(checkAdminRole(true) === true, 'checkAdminRole detects boolean true');
assert(checkAdminRole({ role: 'user' }) === false, 'checkAdminRole rejects regular user role');
assert(checkAdminRole(null) === false, 'checkAdminRole safely rejects null');
assert(checkAdminRole(undefined) === false, 'checkAdminRole safely rejects undefined');

console.log('\n======================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed.`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
