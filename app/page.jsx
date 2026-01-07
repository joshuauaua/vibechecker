'use client';
import { useState } from 'react';

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

// Map numerical key to pitch class notation
const KEYS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error('Analysis failed. check URL.');

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const PieChart = ({ label, value }) => {
    const percentage = Math.round(value * 100);
    const circumference = 2 * Math.PI * 40; // r=40
    const offset = circumference - (value * circumference);

    // Green theme for charts to match screenshot vibe
    let color = '#22c55e'; // green-500

    return (
      <div className="flex flex-col items-center p-4 bg-[#111625] border border-gray-800 rounded-lg">
        <div className="relative w-24 h-24 mb-3">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48" cy="48" r="40"
              stroke="#1f2937" strokeWidth="8" // gray-800
              fill="transparent"
            />
            <circle
              cx="48" cy="48" r="40"
              stroke={color} strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-white">
            {percentage}%
          </div>
        </div>
        <span className="font-medium text-gray-400 text-sm">{label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 font-sans selection:bg-green-500 selection:text-white">

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white tracking-tight">
          VibeChecker
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Artists</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>
        <a href="#analyze" className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-4 rounded transition-colors text-sm">
          Track a Song
        </a>
      </nav>

      <main className="flex flex-col items-center justify-start pt-20 pb-20 px-4">

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-6 mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium tracking-wide uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Tracking millions of songs daily
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Free Spotify <br />
            <span className="text-green-500">Stream Counter</span>
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track any song's streaming performance with daily updates. Get historical data, charts, and insights to understand your music's journey.
          </p>
        </div>

        {/* Search Input */}
        <div id="analyze" className="w-full max-w-2xl">
          <form onSubmit={analyze} className="flex flex-col sm:flex-row gap-3 bg-[#111625] p-2 rounded-xl border border-gray-800 shadow-2xl">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter track name, Spotify link, or URI..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 focus:outline-none px-4 py-3 text-lg w-full"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap text-lg shadow-lg shadow-green-900/20"
            >
              {loading ? 'Analyzing...' : 'Track Streams'}
            </button>
          </form>

          <div className="flex justify-center flex-wrap gap-x-8 gap-y-2 mt-6 text-sm text-gray-400">
            <div className="flex items-center"><CheckIcon /> 100% Free</div>
            <div className="flex items-center"><CheckIcon /> Daily Updates</div>
            <div className="flex items-center"><CheckIcon /> Historical Data</div>
          </div>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Results section - Only shows when data is present */}
        {data && !loading && (
          <div className="w-full max-w-5xl mt-20 animate-in fade-in slide-in-from-bottom-10 duration-700">

            {/* Track Info Header */}
            <div className="bg-[#111625] border border-gray-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-xl">
              {data.albumArt && (
                <div className="relative group">
                  <img src={data.albumArt} alt="Album Art" className="w-48 h-48 rounded-lg shadow-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <a href={data.externalUrl} target="_blank" rel="noreferrer" className="bg-green-500 text-black rounded-full p-3 hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </a>
                  </div>
                </div>
              )}
              <div className="flex-1 text-center md:text-left space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold text-white">{data.name}</h2>
                <p className="text-xl md:text-2xl text-gray-400">{data.artists}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                  <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 border border-gray-700">
                    Key: <span className="text-white font-bold">{KEYS[data.key] || '?'}</span>
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 border border-gray-700">
                    Mode: <span className="text-white font-bold">{data.mode === 1 ? 'Major' : 'Minor'}</span>
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 border border-gray-700">
                    Tempo: <span className="text-white font-bold">{Math.round(data.tempo)} BPM</span>
                  </span>
                  <span className="px-3 py-1 bg-gray-800 rounded text-sm text-gray-300 border border-gray-700">
                    Sig: <span className="text-white font-bold">{data.time_signature}/4</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <PieChart label="Danceability" value={data.danceability} />
              <PieChart label="Energy" value={data.energy} />
              <PieChart label="Acousticness" value={data.acousticness} />
              <PieChart label="Instrumental" value={data.instrumentalness} />
              <PieChart label="Speechiness" value={data.speechiness} />
            </div>

            {data.analysis_url && (
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500 truncate max-w-lg mx-auto">
                  Full Analysis: {data.analysis_url}
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-gray-900 py-8 text-center text-gray-600 text-sm mt-auto">
        &copy; {new Date().getFullYear()} VibeChecker. All rights reserved.
      </footer>
    </div>
  );
}
