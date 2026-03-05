
## 1\. System Architecture Overview

To successfully bypass CORS restrictions while maintaining a smooth user experience, the application uses a decoupled frontend-backend architecture hosted entirely on Vercel.

  * **Frontend (ReactJS):** Handles the user interface, parses the target event URL, performs the cryptographic hashing (`simpleHash`), calculates the precise Hong Kong sale timestamp (`getHkDateMill`), manages the countdown timer, and redirects the user once the URL is acquired.
  * **Backend (Vercel Serverless Function):** Acts purely as a CORS proxy. Because the frontend cannot fetch the Cityline JSON file directly due to browser security policies, it passes the generated JSON URL to the Vercel backend. The backend fetches the file from Cityline and returns the payload to the frontend.

-----

## 2\. Backend Specification: Vercel CORS Proxy

This serverless function intercepts the frontend request and fetches the target `.json` file from Cityline's servers.

**File Location:** `api/proxy.js`
*(Note: This file must be placed inside an `api` folder at the root of your project repository, next to `package.json`.)*

```javascript
// api/proxy.js
export default async function handler(req, res) {
  // 1. Configure CORS headers to allow requests from the React frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Can be locked down to your specific Vercel domain later
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Ensure only POST requests are processed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const targetUrl = req.body.url; 
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing target "url" in request body.' });
    }

    // 4. Fetch the JSON file from Cityline (Bypasses Browser CORS)
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Upstream server responded with status: ${response.status}`);
    }

    // 5. Parse and return the payload to the React app
    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Proxy Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch the requested URL.' });
  }
}
```

-----

## 3\. Frontend Specification: React Application

The frontend manages the heavy lifting of reverse-engineering Cityline's URL generation. I have updated the URL parsing logic to use the native browser `URL` API instead of Regex, which makes it much more robust against extra URL parameters (like `?actionType=5`).

**File Location:** `src/App.jsx` (or your preferred component structure)

```jsx
import React, { useState } from 'react';

const CitylineBot = () => {
  // State Management
  const [eventUrl, setEventUrl] = useState('https://shows.cityline.com/tc/2026/mixerhk2026.html?actionType=5&lang=TW');
  const [onSaleTime, setOnSaleTime] = useState('2026/03/05 10:00:00');
  const [status, setStatus] = useState('Idle. Waiting for input.');
  const [isRunning, setIsRunning] = useState(false);

  // --- 1. Core Algorithms (Reverse-Engineered from Cityline) ---
  
  // Normalizes the target time to Hong Kong timezone (UTC+8)
  const getHkDateMill = (dateString) => {
    const dateObj = dateString ? new Date(dateString) : new Date();
    const localOffsetMinutes = dateObj.getTimezoneOffset();
    const hkOffsetMinutes = -8 * 60; // UTC+8
    return dateObj.getTime() + (hkOffsetMinutes - localOffsetMinutes) * 60 * 1000;
  };

  // Hashes the event parameters into the required 5-character string
  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + charCode;
      hash &= hash; // Force 32-bit integer
    }
    return new Uint32Array([hash])[0].toString(36);
  };

  // --- 2. Execution Logic ---

  // Fetches the final queue URL via the Vercel API proxy
  const fetchPurchaseUrl = async (jsonUrl) => {
    try {
      setStatus('Fetching checkout payload via proxy...');
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jsonUrl })
      });

      if (!response.ok) throw new Error('Proxy failed to fetch data.');
      
      const data = await response.json();

      if (data.url) {
        setStatus(`Success! Redirecting to: ${data.url}`);
        // Redirect to checkout, appending the language preference
        window.location.href = `${data.url}?lang=TW`;
      } else {
        setStatus('Error: Upstream JSON did not contain a valid URL.');
        setIsRunning(false);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Initializes the bot sequence
  const handleStartBot = () => {
    setIsRunning(true);
    setStatus('Parsing parameters...');

    try {
      // Step A: Robustly parse Year and Event ID using the URL API
      const urlObj = new URL(eventUrl);
      const pathParts = urlObj.pathname.split('/'); 
      // Expected pathParts: ['', 'tc', '2026', 'mixerhk2026.html']
      const eventYear = pathParts[2];
      const eventId = pathParts[3].replace('.html', '');
      const draftEnd = ""; 

      if (!eventYear || !eventId) throw new Error("Could not parse Year or Event ID from URL.");

      // Step B: Calculate target timestamp
      const targetTimeMs = getHkDateMill(onSaleTime);
      
      // Step C: Generate cryptographic hash
      const hashInput = eventId + draftEnd + targetTimeMs + "CiTy1ine";
      const hash = simpleHash(hashInput);

      // Step D: Construct JSON URL
      const jsonUrl = `https://shows.cityline.com/url/${eventYear}/${eventId}${draftEnd}.${targetTimeMs}.${hash}.json`;
      console.log("Generated Target URL:", jsonUrl);

      // Step E: Non-blocking Countdown Timer
      const checkTimeInterval = setInterval(() => {
        const currentTimeMs = getHkDateMill();
        const timeRemaining = targetTimeMs - currentTimeMs;

        if (timeRemaining <= 0) {
          clearInterval(checkTimeInterval);
          setStatus("Time reached! Firing payload request...");
          fetchPurchaseUrl(jsonUrl);
        } else {
          setStatus(`Waiting for sale... ${(timeRemaining / 1000).toFixed(1)}s remaining`);
        }
      }, 100);

    } catch (error) {
      setStatus(`Configuration Error: ${error.message}`);
      setIsRunning(false);
    }
  };

  // --- 3. UI Rendering ---
  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>🎫 Cityline URL Generator</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>Event URL:</label>
        <input 
          type="text" 
          value={eventUrl} 
          onChange={(e) => setEventUrl(e.target.value)}
          disabled={isRunning}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold' }}>On-Sale Time (HKT):</label>
        <input 
          type="text" 
          value={onSaleTime} 
          onChange={(e) => setOnSaleTime(e.target.value)}
          disabled={isRunning}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '5px' }}
        />
        <small style={{ color: '#666' }}>Format: YYYY/MM/DD HH:MM:SS</small>
      </div>

      <button 
        onClick={handleStartBot} 
        disabled={isRunning}
        style={{ width: '100%', padding: '12px', backgroundColor: isRunning ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: isRunning ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
      >
        {isRunning ? 'Bot is Running...' : 'Start Generator'}
      </button>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', borderLeft: '4px solid #28a745' }}>
