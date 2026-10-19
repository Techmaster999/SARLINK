import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';

/**
 * Interactive Demo for DT-40 Acceptance Criteria Verification
 * 
 * Allows toggling between Admin and Regular User to observe
 * conditional rendering of the Admin link and navigation to Forms.
 */
export function SidebarDemo() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPath, setCurrentPath] = useState('/incidents');
  const [toastMessage, setToastMessage] = useState(null);

  const currentUser = {
    name: isAdmin ? 'Alex Mercer (Commander)' : 'Taylor Reed (Responder)',
    email: isAdmin ? 'alex.mercer@sarlink.org' : 'taylor.reed@sarlink.org',
    role: isAdmin ? 'admin' : 'user',
    isAdmin: isAdmin,
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    if (path === '/forms') {
      setToastMessage('Navigated to: /forms (Forms page placeholder)');
    } else if (path === '/admin') {
      setToastMessage('Navigated to: /admin (Admin console placeholder - Admin only)');
    } else {
      setToastMessage(`Navigated to: ${path}`);
    }

    // Auto-clear toast
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0b1120', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Sidebar Under Test */}
      <Sidebar
        user={currentUser}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '36px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid #1e293b', paddingBottom: '18px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
              Incident Hub
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
              Subtask DT-40: Sidebar Links & Role-Based Admin Access
            </p>
          </div>

          {/* User Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#1e293b', padding: '8px 14px', borderRadius: '8px' }}>
            <span style={{ fontSize: '13px', color: '#cbd5e1' }}>Simulated Role:</span>
            <button
              type="button"
              onClick={() => setIsAdmin(!isAdmin)}
              style={{
                backgroundColor: isAdmin ? '#f59e0b' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {isAdmin ? '👑 Logged In as Admin' : '👤 Logged In as Responder'}
            </button>
          </div>
        </header>

        {/* Toast / Route Feedback for Links Under Construction */}
        {toastMessage && (
          <div style={{
            background: 'rgba(2, 132, 199, 0.2)',
            border: '1px solid #0284c7',
            color: '#38bdf8',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            ℹ️ {toastMessage}
          </div>
        )}

        {/* Status Verification Card */}
        <section style={{ background: '#131d31', border: '1px solid #1e293b', borderRadius: '10px', padding: '24px', maxWidth: '640px' }}>
          <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', color: '#38bdf8' }}>
            DT-40 Acceptance Criteria Status
          </h2>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#cbd5e1', fontSize: '14px' }}>
            <li>
              <strong>Link to Forms:</strong> ✅ Always visible in the sidebar navigation (points to <code>/forms</code>).
            </li>
            <li>
              <strong>Link to Admin:</strong>{' '}
              {isAdmin ? (
                <span style={{ color: '#4ade80' }}>
                  ✅ <strong>VISIBLE</strong> because user is currently logged in as <strong>Admin</strong>.
                </span>
              ) : (
                <span style={{ color: '#f87171' }}>
                  🔒 <strong>HIDDEN</strong> because user is logged in as <strong>Responder</strong>. Click button above to switch!
                </span>
              )}
            </li>
            <li>
              <strong>Current Active Route:</strong> <code>{currentPath}</code>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default SidebarDemo;
