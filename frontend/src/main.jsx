import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Axios interceptor to dynamically route requests to the backend service in production
axios.interceptors.request.use((config) => {
  const isProd = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
  if (isProd && config.url && config.url.startsWith('http://localhost:8000')) {
    config.url = config.url.replace('http://localhost:8000', `${window.location.origin}/_/backend`);
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
