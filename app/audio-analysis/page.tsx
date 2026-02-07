'use client';
import { useState, useEffect } from 'react';
import AudioAnalysisTable, { AudioAnalysisData } from '../components/AudioAnalysisTable';
import SpotifySearch from '../components/SpotifySearch';
import Link from 'next/link';
import { DEMO_DATA } from '../api/demo-data';
import { getAccessToken, redirectToSpotifyAuth } from '../utils/spotify-auth';

export default function AudioAnalysisPage() {
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [autoToken, setAutoToken] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for Auth Code from Spotify Redirect
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Clear code from URL to look nice
      window.history.replaceState({}, document.title, window.location.pathname);

      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
      if (clientId) {
        getAccessToken(clientId, code, window.location.origin + window.location.pathname)
          .then(token => {
            setUserToken(token);
          })
          .catch(err => console.error("PKCE Token Exchange Failed", err));
      }
    }

    // 2. Fetch Server Token (Client Credentials) as backup
    const fetchServerToken = async () => {
      try {
        const res = await fetch('/api/spotify-token');
        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            setAutoToken(data.access_token);
          }
        }
      } catch (e) {
        console.error("Failed to auto-fetch token", e);
      }
    };
    fetchServerToken();
  }, []);

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    if (clientId) {
      redirectToSpotifyAuth(clientId, window.location.origin + window.location.pathname);
    } else {
      alert("Missing Client ID in env");
    }
  };

  const loadDemo = () => {
    setError(null);
    setAnalysisData(DEMO_DATA as any);
  };

  const handleAnalyze = async (manualToken: string, trackId: string) => {
    setLoading(true);
    setError(null);
    setAnalysisData(null);

    // Extract ID if a full URL is pasted
    const cleanId = trackId.split('/').pop()?.split('?')[0] || trackId;

    try {
      let tokenToUse = manualToken || userToken || autoToken;

      // If no token yet, try to fetch one now
      if (!tokenToUse) {
        const res = await fetch('/api/spotify-token');
        if (res.ok) {
          const data = await res.json();
          tokenToUse = data.access_token;
          setAutoToken(tokenToUse);
        }
      }

      if (!tokenToUse) {
        throw new Error("No Access Token available.");
      }

      const [resAnalysis, resTrack] = await Promise.all([
        fetch(`https://api.spotify.com/v1/audio-analysis/${cleanId}`, {
          headers: { 'Authorization': `Bearer ${tokenToUse}` }
        }),
        fetch(`https://api.spotify.com/v1/tracks/${cleanId}`, {
          headers: { 'Authorization': `Bearer ${tokenToUse}` }
        })
      ]);

      if (!resAnalysis.ok) {
        console.error("Spotify Error Response:", resAnalysis.status, resAnalysis.statusText);
        const errBody = await resAnalysis.text();
        console.error("Spotify Error Body:", errBody);

        if (resAnalysis.status === 401) {
          throw new Error("Token expired or invalid (401).");
        }
        if (resAnalysis.status === 403) {
          const err = (
            <span>
              <strong>Access Forbidden (403)</strong>. Server permissions are restricted.
              <br /><br />
              <strong>Solution:</strong>
              <button
                onClick={handleLogin}
                className="mt-2 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full transition-colors text-sm"
              >
                Log in with Spotify
              </button>
              <div className="mt-2 text-xs text-gray-400">
                This grants the app permission to analyze tracks on your behalf.
                <br />
                (Make sure <code>{typeof window !== 'undefined' ? window.location.href : 'this url'}</code> is in your Spotify Redirect URIs)
              </div>
              <br />
              Or <button onClick={loadDemo} className="underline text-green-400 hover:text-green-300">load demo data</button>.
            </span>
          );
          setError(err);
          return;
        }
        if (resAnalysis.status === 404) throw new Error("Track not found (404). Check the ID.");

        throw new Error(`Spotify API Error: ${resAnalysis.status} ${resAnalysis.statusText} - ${errBody}`);
      }

      const data = await resAnalysis.json();

      // If we got track info, add it
      if (resTrack.ok) {
        const trackData = await resTrack.json();
        data.track_info = trackData;
      }

      setAnalysisData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-green-500 selection:text-white pb-20">

      {/* Navigation */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white tracking-tight hover:text-green-500 transition-colors">
          VibeChecker
        </Link>
        <div className="flex items-center gap-4">
          {userToken ? (
            <span className="text-sm text-green-500 font-medium px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
              Authenticated
            </span>
          ) : (
            <button
              onClick={handleLogin}
              className="text-sm text-white hover:text-green-400 transition-colors"
            >
              Log in
            </button>
          )}
          <div className="text-sm text-gray-500 hidden sm:block">Audio Analysis Tool</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 pt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-green-400 to-emerald-600">
            Deep Audio Analysis
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Inspect the raw audio structure of any Spotify track. View bars, beats, tatums, segments, and detailed pitch/timbre analysis.
          </p>
        </div>

        <SpotifySearch onAnalyze={handleAnalyze} loading={loading} />

        {error && (
          <div className="w-full max-w-2xl mx-auto mb-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-xl flex items-center gap-3">
            <div className="text-red-400 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>{error}</div>
          </div>
        )}

        {!analysisData && !loading && !error && (
          <div className="text-center text-gray-600 mt-20">
            <div className="inline-block p-6 rounded-full bg-gray-900 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <p>Enter a Track ID to start analyzing</p>
            {!userToken && (
              <p className="text-xs text-gray-700 mt-2">
                (For best results, <button onClick={handleLogin} className="underline hover:text-green-500">log in</button> to avoid API limits)
              </p>
            )}
          </div>
        )}

        <AudioAnalysisTable data={analysisData!} />

      </main>
    </div>
  );
}
