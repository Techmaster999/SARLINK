import React from 'react'
import ReactDOM from 'react-dom/client'

import {GoogleOAuthProvider} from '@react-oauth/google'
import {BrowserRouter} from 'react-router-dom'
import LoginPage from './LoginPage'
import HomePage from './HomePage'
import IncidentHub from './IncidentHub'
import IncidentCreationLayout from './IncidentCreation'


const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID
const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const isIncidentHubPath =
  pathname === '/incident-hub' || pathname.startsWith('/incident-hub/')
const page =
  pathname === '/home'
    ? <HomePage />
    : isIncidentHubPath
      ? <BrowserRouter><IncidentHub /></BrowserRouter>
    : pathname === '/switchboard--callout'
    ? <IncidentCreationLayout />
    : <LoginPage />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {page}
    </GoogleOAuthProvider>
  </React.StrictMode>
);