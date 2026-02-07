'use client';
import { useState } from 'react';

interface Props {
  onAnalyze: (token: string, trackId: string) => Promise<void>;
  loading: boolean;
}

const SpotifySearch: React.FC<Props> = ({ onAnalyze, loading }) => {
  const [trackId, setTrackId] = useState('');
  // Default token for ease of use - normally this shouldn't be hardcoded but for this "vibechecker" exploring tool it helps the user start quicker if they have one.
  // The user prompt had a partial token, I'll update the placeholder.
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackId) {
      onAnalyze(token, trackId);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Track ID Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            placeholder="Enter Spotify Track ID (e.g., 11dFghVXANMlKmJXsNCbNl)"
            className="w-full bg-[#111625] border border-gray-700 text-white placeholder-gray-500 text-lg rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-lg"
            required
          />
        </div>

        {/* Token Toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="text-xs text-gray-500 hover:text-green-500 underline"
          >
            {showTokenInput ? 'Hide Token Input' : 'Advanced: Custom Token'}
          </button>
        </div>

        {/* Token Input (Collapsible) */}
        {showTokenInput && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <label className="block text-xs text-gray-400 mb-1 ml-1">Spotify Access Token (Optional)</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Leave empty to use server token..."
              className="w-full bg-[#111625]/50 border border-gray-800 text-gray-300 text-sm rounded-lg px-4 py-2 focus:ring-1 focus:ring-green-500 outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !trackId}
          className="w-full bg-green-600 hover:bg-green-500 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/20 active:scale-[0.99]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Track Analysis'
          )}
        </button>
      </form>
    </div>
  );
};

export default SpotifySearch;
