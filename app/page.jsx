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

import Balatro from './components/Balatro/Balatro';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <div className="relative min-h-screen overflow-hidden text-gray-100 font-sans selection:bg-green-500 selection:text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Balatro
          isRotate={false}
          mouseInteraction
          pixelFilter={745}
          color1="#DE443B"
          color2="#006BB4"
          color3="#162325"
        />
      </div>

      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-50">
        <div className="text-2xl font-bold text-white tracking-tight z-50">
          VibeChecker
        </div>

        {/* Hamburger Icon */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="z-50 p-2 text-white hover:text-green-500 transition-colors focus:outline-none"
        >
          {isMenuOpen ? (
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Fullscreen Menu Overlay */}
        <div className={`fixed inset-0 bg-[#020617]/95 backdrop-blur-3xl z-40 flex flex-col items-center justify-center transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col space-y-8 text-center text-2xl font-bold">
            <a href="#" className="hover:text-green-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#" className="hover:text-green-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Artists</a>
            <a href="#" className="hover:text-green-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Blog</a>
            <a href="#" className="hover:text-green-500 transition-colors" onClick={() => setIsMenuOpen(false)}>API</a>
            <a href="#analyze" className="text-green-500 hover:text-green-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Track a Song</a>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-start pt-20 pb-20 px-4">

        {/* Simplified Input Section */}
        <div id="analyze" className="w-full max-w-xl z-10 flex flex-col gap-4 items-center justify-center min-h-[50vh]">
          <p className="text-white/60 text-lg font-medium tracking-wide">drop in the spotify link</p>
          
          <form onSubmit={analyze} className="w-full flex flex-col gap-4">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-white/30 focus:border-white/30 focus:outline-none px-6 py-4 rounded-xl text-xl backdrop-blur-md transition-all text-center"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 px-8 rounded-xl transition-all disabled:opacity-50 text-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? 'vibing...' : 'vibe check'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg backdrop-blur-sm">
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
      <footer className="w-full mt-auto py-10 flex flex-col items-center justify-end overflow-hidden pointer-events-none select-none">
         <h1 className="text-[15vw] leading-[0.8] font-black text-white/10 tracking-tighter">
            VIBECHECKER
         </h1>
      </footer>
    </div>
  );
}
