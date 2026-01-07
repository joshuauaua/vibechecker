import { NextResponse } from 'next/server';
import { getTrackInfo, getTrackAudioFeatures } from '@/lib/spotify';

export const runtime = 'edge'; // Use Edge Runtime for speed

export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract Track ID from URL
    // Supports:
    // https://open.spotify.com/track/11dFghVXANMlKmJXsNCbNl?si=...
    // spotify:track:11dFghVXANMlKmJXsNCbNl
    // 11dFghVXANMlKmJXsNCbNl
    let trackId = url;
    if (url.includes('spotify.com/track/')) {
      const parts = url.split('track/');
      const querySplit = parts[1].split('?');
      trackId = querySplit[0];
    } else if (url.includes('spotify:track:')) {
      trackId = url.split(':')[2];
    }

    // Parallel fetch
    const [trackInfo, audioFeatures] = await Promise.all([
      getTrackInfo(trackId),
      getTrackAudioFeatures(trackId)
    ]);

    if (!trackInfo || trackInfo.error) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }
    if (!audioFeatures || audioFeatures.error) {
      return NextResponse.json({ error: 'Audio features not found' }, { status: 404 });
    }

    // Combine data
    const analysis = {
      name: trackInfo.name,
      artists: trackInfo.artists.map(a => a.name).join(', '),
      albumArt: trackInfo.album.images[0]?.url,
      previewUrl: trackInfo.preview_url,
      externalUrl: trackInfo.external_urls.spotify,

      // Key & Mode
      key: audioFeatures.key,
      mode: audioFeatures.mode, // 0 = Minor, 1 = Major

      // 0-1 Scales
      acousticness: audioFeatures.acousticness,
      danceability: audioFeatures.danceability,
      energy: audioFeatures.energy,
      instrumentalness: audioFeatures.instrumentalness,
      speechiness: audioFeatures.speechiness,
      valence: audioFeatures.valence,

      // Tech
      tempo: audioFeatures.tempo,
      time_signature: audioFeatures.time_signature,
      analysis_url: audioFeatures.analysis_url // Requested by user
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to analyze track' }, { status: 500 });
  }
}
