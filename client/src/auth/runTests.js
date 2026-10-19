/**
 * Acceptance Criteria Verification Runner for Subtask DT-112
 * 
 * Tests:
 * 1. User-facing error messages clearly indicate invalid credentials.
 * 2. User-facing error messages clearly indicate account lockouts.
 * 3. User-facing error messages clearly indicate network issues and timeouts.
 * 4. Google Workspace identity provider errors are properly handled.
 * 5. Authentication exceptions do NOT crash the client application or expose stack traces.
 */

import { handleAuthError, AuthErrorType } from './handleAuthError.js';
import { displayAuthFeedback } from './displayAuthFeedback.js';

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
console.log('SARLINK JIRA DT-112: AUTH ERROR HANDLING TEST SUITE');
console.log('======================================================\n');

// Test 1: Invalid Credentials (HTTP 401)
console.log('--- Criterion 1: Invalid Credentials ---');
const error401 = {
  isAxiosError: true,
  response: {
    status: 401,
    data: { message: 'Unauthorized' }
  }
};
const feedback401 = handleAuthError(error401);
assert(
  feedback401.type === AuthErrorType.INVALID_CREDENTIALS,
  'Correctly categorizes HTTP 401 as INVALID_CREDENTIALS'
);
assert(
  /invalid|incorrect/i.test(feedback401.message),
  'User message clearly indicates invalid email/password'
);
assert(
  !JSON.stringify(feedback401).includes('stack'),
  'Does not expose stack traces for 401 errors'
);

// Test 2: Account Lockout (HTTP 423 / Code)
console.log('\n--- Criterion 2: Account Lockout ---');
const error423 = {
  isAxiosError: true,
  response: {
    status: 423,
    data: { code: 'ACCOUNT_LOCKED', message: 'Account locked due to excessive failed attempts' }
  }
};
const feedback423 = handleAuthError(error423);
assert(
  feedback423.type === AuthErrorType.ACCOUNT_LOCKED,
  'Correctly categorizes HTTP 423 as ACCOUNT_LOCKED'
);
assert(
  /lock/i.test(feedback423.message) && /wait|admin/i.test(feedback423.actionableTip),
  'User message clearly indicates lockout and provides recovery action'
);
assert(
  feedback423.canRetry === false,
  'Sets canRetry to false for locked accounts'
);

// Test 3: Network Issues and Timeouts
console.log('\n--- Criterion 3: Network Issues & Timeouts ---');
const timeoutError = {
  isAxiosError: true,
  code: 'ECONNABORTED',
  message: 'timeout of 8000ms exceeded'
};
const feedbackTimeout = handleAuthError(timeoutError);
assert(
  feedbackTimeout.type === AuthErrorType.NETWORK_ERROR,
  'Correctly categorizes ECONNABORTED as NETWORK_ERROR'
);
assert(
  /timeout|connection/i.test(feedbackTimeout.message) || /timed out/i.test(feedbackTimeout.title),
  'User message clearly explains timeout and connection issue'
);

const offlineError = {
  isAxiosError: true,
  code: 'ERR_NETWORK',
  request: {}
};
const feedbackOffline = handleAuthError(offlineError);
assert(
  feedbackOffline.type === AuthErrorType.NETWORK_ERROR,
  'Correctly categorizes ERR_NETWORK as NETWORK_ERROR'
);

// Test 4: Google Workspace Identity Provider Errors
console.log('\n--- Criterion 4: Google Workspace IdP Handling ---');
const googleDenied = {
  error: 'access_denied',
  error_description: 'Domain not allowed'
};
const feedbackGoogle = handleAuthError(googleDenied);
assert(
  feedbackGoogle.type === AuthErrorType.GOOGLE_WORKSPACE_ERROR,
  'Correctly categorizes Google Workspace access denial'
);
assert(
  /Google/i.test(feedbackGoogle.title) && /organizational|authorized/i.test(feedbackGoogle.message + feedbackGoogle.actionableTip),
  'Explains organizational email requirement for Google Workspace'
);

// Test 5: Exceptions do NOT crash the client or leak stack traces
console.log('\n--- Criterion 5: Zero-Crash & Masked Stack Traces ---');
const serverCrashWithInternalSql = {
  isAxiosError: true,
  response: {
    status: 500,
    data: {
      error: 'SequelizeDatabaseError: select * from users where syntax error at line 4',
      stack: 'Error: SequelizeDatabaseError\n    at Query.run (/app/node_modules/pg/lib/query.js:142:15)'
    }
  }
};
const feedback500 = handleAuthError(serverCrashWithInternalSql);
assert(
  !JSON.stringify(feedback500).includes('SequelizeDatabaseError'),
  'Masks sensitive database error messages from users'
);
assert(
  !JSON.stringify(feedback500).includes('node_modules'),
  'Masks server internal file paths from users'
);

// Malformed / throwing error passed to displayAuthFeedback
let stateUpdated = false;
let testState = null;
const badException = new TypeError('Cannot read property of undefined in client rendering');
badException.stack = 'TypeError: Cannot read properties of undefined\n    at render (app.js:23:45)';

try {
  displayAuthFeedback(badException, (val) => {
    stateUpdated = true;
    testState = val;
  });
  assert(true, 'Failsafe catches runtime exceptions without throwing');
  assert(stateUpdated === true, 'Successfully updates feedback state even on bad exception');
  assert(!JSON.stringify(testState).includes('render (app.js'), 'Never exposes client stack traces');
} catch (e) {
  assert(false, 'Exception crashed the application!');
}

console.log('\n======================================================');
console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed.`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
