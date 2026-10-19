import React from 'react'
import ReactDOM from 'react-dom/client'

import {GoogleOAuthProvider} from '@react-oauth/google'
import LoginPage from './LoginPage'
import HomePage from './HomePage'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {window.location.pathname === '/home' ? <HomePage /> : <LoginPage />}
    </GoogleOAuthProvider>
  </React.StrictMode>
);