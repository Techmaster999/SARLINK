import React from 'react'
import ReactDOM from 'react-dom/client'

import {GoogleOAuthProvider} from '@react-oauth/google'
import LoginPage from './LoginPage'
import HomePage from './HomePage'
import IncidentHub from './IncidentHub'
import IncidentCreation from './IncidentCreation'


const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const isIncidentHubPath =
  pathname === '/incident-hub' || pathname.startsWith('/incident-hub/')
const isIncidentCreationPath = pathname === '/incident-creation'
const page =
  pathname === '/home'
    ? <HomePage />
    : isIncidentHubPath
      ? <IncidentHub />
      : isIncidentCreationPath
        ? <IncidentCreation />
        : <LoginPage />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {page}
    </GoogleOAuthProvider>
  </React.StrictMode>
);