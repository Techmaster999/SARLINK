import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'

import {GoogleOAuthProvider} from '@react-oauth/google'
import LoginPage from './LoginPage'
import HomePage from './HomePage'

const IncidentHub = lazy(() => import('./IncidentHub'))
const IncidentCreationLayout = lazy(() => import('./IncidentCreation'))
const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const isIncidentHubPath =
  pathname === '/incident-hub' || pathname.startsWith('/incident-hub/')
const page =
  pathname === '/home'
    ? <HomePage />
    : isIncidentHubPath
      ? <IncidentHub />
    : pathname === '/switchboard--callout'
    ? <IncidentCreationLayout />
    : <LoginPage />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Suspense fallback={<main aria-busy="true" />}>{page}</Suspense>
    </GoogleOAuthProvider>
  </React.StrictMode>
);