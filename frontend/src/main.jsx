import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'
import { supabase } from './supabase'

// Axios interceptor to dynamically route requests to the backend service in production
// and automatically attach the Supabase session token for user-based rate limiting.
axios.interceptors.request.use(async (config) => {
  // 1. Dynamic Routing for Production
  const isProd = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
  if (isProd && config.url && config.url.startsWith('http://localhost:8000')) {
    const backendUrl = import.meta.env.VITE_API_URL || 'https://nyayasetu-backend-akaf.onrender.com';
    config.url = config.url.replace('http://localhost:8000', backendUrl);
  }

  // 2. Attach JWT Access Token if user is logged in
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error("Failed to attach auth token to request headers:", error);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
