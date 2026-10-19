export const DEFAULT_CALLOUT_PATH = '/switchboard--callout';

/**
 * Jira DT-152 required function.
 * Opens the New Callout page using the callback supplied by the application,
 * or React Router's navigate function when no callback has been supplied.
 */
export function handleCreateCalloutClick({
  navigate,
  onCreateCallout,
  path = DEFAULT_CALLOUT_PATH,
} = {}) {
  if (typeof onCreateCallout === 'function') {
    return onCreateCallout(path);
  }

  if (typeof navigate !== 'function') {
    throw new TypeError('A navigation function is required to create a callout.');
  }

  return navigate(path);
}

/**
 * Jira DT-152 required placeholder function.
 * The authentication developer can supply the real logout behavior later.
 */
export function handleUserSignOut({ onSignOut } = {}) {
  if (typeof onSignOut === 'function') {
    return onSignOut();
  }

  return undefined;
}
