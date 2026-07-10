import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PublicClientApplication, EventType } from '@azure/msal-browser'
import { MsalProvider } from '@azure/msal-react'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "dummy_microsoft_client_id",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance (required in MSAL v3)
msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy_google_client_id"}>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </GoogleOAuthProvider>
    </React.StrictMode>,
  )
});
