import React from 'react';

// Types based on the JSON structure provided
interface MetaData {
  analyzer_version: string;
  platform: string;
  detailed_status: string;
  status_code: number;
  timestamp: number;
  analysis_time: number;
  input_process: string;
}

interface TrackData {
  num_samples: number;
  duration: number;
  sample_md5: string;
  offset_seconds: number;
  window_seconds: number;
  analysis_sample_rate: number;
  analysis_channels: number;
  end_of_fade_in: number;
  start_of_fade_out: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  codestring: string;
  code_version: number;
  echoprintstring: string;
  echoprint_version: number;
  synchstring: string;
  synch_version: number;
  rhythmstring: string;
  rhythm_version: number;
}

interface TimeInterval {
  start: number;
  duration: number;
  confidence: number;
}

interface Section extends TimeInterval {
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

interface Segment extends TimeInterval {
  loudness_start: number;
  loudness_max: number;
  loudness_max_time: number;
  loudness_end: number;
  pitches: number[];
  timbre: number[];
}

export interface AudioAnalysisData {
  meta: MetaData;
  track: TrackData;
  bars: TimeInterval[];
  beats: TimeInterval[];
  tatums: TimeInterval[];
  sections: Section[];
  segments: Segment[];
  track_info?: {
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; height: number; width: number }[];
    };
    external_urls: { spotify: string };
  };
}

interface Props {
  data: AudioAnalysisData;
}

const AudioAnalysisTable: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-gray-800 last:border-0 hover:bg-white/5 px-2 transition-colors">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-gray-100 font-mono text-sm max-w-[60%] truncate" title={String(value)}>
        {value}
      </span>
    </div>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-xl font-bold text-green-500 mt-8 mb-4 border-b border-green-500/30 pb-2">
      {title}
    </h3>
  );

  // Helper to render array tables
  const renderTable = (items: any[], columns: string[], title: string, maxRows = 10) => (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <h4 className="text-lg font-semibold text-gray-200">{title}</h4>
        <span className="text-xs text-gray-500">
          Showing {Math.min(items.length, maxRows)} of {items.length}
        </span>
      </div>
      <div className="overflow-x-auto bg-[#111625] border border-gray-800 rounded-lg">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-200 uppercase bg-gray-800/50">
            <tr>
              {columns.map((col) => (
                <th key={col} scope="col" className="px-4 py-3 border-b border-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, maxRows).map((item, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-700/20 transition-colors">
                {columns.map((col) => (
                  <td key={`${idx}-${col}`} className="px-4 py-2 font-mono whitespace-nowrap">
                    {typeof item[col.toLowerCase()] === 'number'
                      ? item[col.toLowerCase()].toFixed(5)
                      : JSON.stringify(item[col.toLowerCase()] || '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length > maxRows && (
        <div className="text-center text-xs text-gray-500 mt-2 italic">
          ... {items.length - maxRows} more rows hidden
        </div>
      )}
    </div>
  );

  // Specific renderer for Segments because they are complex
  const renderSegments = (segments: Segment[]) => (
    <div className="w-full mt-6">
      <div className="flex justify-between items-end mb-2">
        <h4 className="text-lg font-semibold text-gray-200">Segments</h4>
        <span className="text-xs text-gray-500">
          Showing {Math.min(segments.length, 20)} of {segments.length}
        </span>
      </div>
      <div className="overflow-x-auto bg-[#111625] border border-gray-800 rounded-lg max-h-[500px]">
        <table className="w-full text-sm text-left text-gray-400 relative">
          <thead className="text-xs text-gray-200 uppercase bg-gray-800/90 sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-4 py-3">Start</th>
              <th scope="col" className="px-4 py-3">Duration</th>
              <th scope="col" className="px-4 py-3">Confidence</th>
              <th scope="col" className="px-4 py-3">Loudness (Max)</th>
              <th scope="col" className="px-4 py-3">Pitches (First 3)</th>
              <th scope="col" className="px-4 py-3">Timbre (First 3)</th>
            </tr>
          </thead>
          <tbody>
            {segments.slice(0, 20).map((seg, idx) => (
              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-2 font-mono">{seg.start.toFixed(3)}</td>
                <td className="px-4 py-2 font-mono">{seg.duration.toFixed(3)}</td>
                <td className="px-4 py-2 font-mono">{seg.confidence.toFixed(3)}</td>
                <td className="px-4 py-2 font-mono">{seg.loudness_max.toFixed(2)}</td>
                <td className="px-4 py-2 font-mono text-xs" title={JSON.stringify(seg.pitches)}>
                  {seg.pitches.slice(0, 3).map(p => p.toFixed(2)).join(', ')}...
                </td>
                <td className="px-4 py-2 font-mono text-xs" title={JSON.stringify(seg.timbre)}>
                  {seg.timbre.slice(0, 3).map(t => t.toFixed(2)).join(', ')}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="w-full text-white animate-in fade-in duration-500">

      {/* Header with Track Info */}
      {data.track_info && (
        <div className="bg-[#111625] border border-gray-800 rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 mb-8 shadow-xl">
          {data.track_info.album.images[0] && (
            <div className="relative group shrink-0">
              <img
                src={data.track_info.album.images[0].url}
                alt="Album Art"
                className="w-48 h-48 rounded-lg shadow-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <a href={data.track_info.external_urls.spotify} target="_blank" rel="noreferrer" className="bg-green-500 text-black rounded-full p-3 hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                </a>
              </div>
            </div>
          )}
          <div className="flex-1 text-center md:text-left space-y-3">
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">{data.track_info.name}</h2>
            <p className="text-xl md:text-2xl text-gray-400 font-medium">
              {data.track_info.artists.map(a => a.name).join(', ')}
            </p>
            <p className="text-sm text-gray-500">{data.track_info.album.name}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

        {/* Meta Data Card */}
        <div className="bg-[#111625]/50 border border-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <h3 className="text-xl font-bold text-green-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Meta Data
          </h3>
          <div className="flex flex-col">
            <DetailRow label="Analyzer Version" value={data.meta.analyzer_version} />
            <DetailRow label="Platform" value={data.meta.platform} />
            <DetailRow label="Detailed Status" value={data.meta.detailed_status} />
            <DetailRow label="Status Code" value={data.meta.status_code} />
            <DetailRow label="Timestamp" value={new Date(data.meta.timestamp * 1000).toLocaleString()} />
            <DetailRow label="Analysis Time" value={`${data.meta.analysis_time.toFixed(4)}s`} />
            <DetailRow label="Input Process" value={data.meta.input_process} />
          </div>
        </div>

        {/* Track Data Card */}
        <div className="bg-[#111625]/50 border border-gray-800 rounded-2xl p-6 shadow-lg backdrop-blur-md">
          <h3 className="text-xl font-bold text-green-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Track Data
          </h3>
          <div className="flex flex-col h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <DetailRow label="Num Samples" value={data.track.num_samples} />
            <DetailRow label="Duration" value={`${data.track.duration.toFixed(2)}s`} />
            <DetailRow label="Sample MD5" value={data.track.sample_md5} />
            <DetailRow label="Offset" value={`${data.track.offset_seconds}s`} />
            <DetailRow label="Analysis Rate" value={`${data.track.analysis_sample_rate} Hz`} />
            <DetailRow label="Channels" value={data.track.analysis_channels} />
            <DetailRow label="Loudness" value={`${data.track.loudness} dB`} />
            <DetailRow label="Tempo" value={`${data.track.tempo.toFixed(2)} BPM (${data.track.tempo_confidence.toFixed(2)})`} />
            <DetailRow label="Time Sig" value={`${data.track.time_signature}/4 (${data.track.time_signature_confidence.toFixed(2)})`} />
            <DetailRow label="Key" value={`${data.track.key} (${data.track.key_confidence.toFixed(2)})`} />
            <DetailRow label="Mode" value={`${data.track.mode === 1 ? 'Major' : 'Minor'} (${data.track.mode_confidence.toFixed(2)})`} />
            <DetailRow label="Code Ver" value={data.track.code_version} />
          </div>
        </div>
      </div>

      <SectionHeader title="Structural Analysis" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {renderTable(data.bars, ['Start', 'Duration', 'Confidence'], 'Bars', 5)}
          {renderTable(data.beats, ['Start', 'Duration', 'Confidence'], 'Beats', 5)}
          {renderTable(data.tatums, ['Start', 'Duration', 'Confidence'], 'Tatums', 5)}
        </div>

        <div className="space-y-8">
          {renderTable(data.sections, ['Start', 'Duration', 'Confidence', 'Loudness', 'Tempo', 'Key', 'Mode'], 'Sections', 5)}
          <div className="bg-[#111625] p-4 rounded-lg border border-gray-800">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Section Distribution</h4>
            {/* Simple visualizer for sections */}
            <div className="flex w-full h-8 rounded overflow-hidden">
              {data.sections.map((sec, i) => (
                <div
                  key={i}
                  className="h-full border-r border-black/50 hover:opacity-80 transition-opacity"
                  style={{
                    width: `${(sec.duration / data.track.duration) * 100}%`,
                    backgroundColor: `hsl(${140 + (i * 20)}, 70%, 50%)`
                  }}
                  title={`Section ${i + 1}: ${sec.duration.toFixed(1)}s, ${sec.tempo.toFixed(0)} BPM`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span>{Math.floor(data.track.duration / 60)}:{Math.floor(data.track.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Detailed Segments" />
      {renderSegments(data.segments)}

    </div>
  );
};

export default AudioAnalysisTable;
