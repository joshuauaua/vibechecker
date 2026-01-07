const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
    try {
        const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
            }),
            cache: 'no-store' // Ensure we don't cache the token request improperly
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to fetch access token", response.status, errorText);
            throw new Error(`Failed to fetch access token: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("Error in getAccessToken:", error);
        throw error;
    }
};

export const getTrackInfo = async (trackId) => {
    const { access_token } = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (!response.ok) {
         throw new Error('Failed to fetch track info');
    }

    return response.json();
};

export const getTrackAudioFeatures = async (trackId) => {
    const { access_token } = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch audio features');
    }

    return response.json();
};

export const getTrackAnalysis = async (trackId) => {
    // Note: Analysis endpoint often provides very detailed segments, sections, etc.
    // For VibeChecker, audio-features (danceability etc) is usually what users want for "0-1" scales.
    // But the user requested "analysis_url" which is in audio-features, and specific fields.
    // Some fields like "Key" and "Mode" are in audio-features.
    // We already have audio-features covering most of user request.
    // If we strictly need the full analysis JSON from the analysis_url, we can fetch it,
    // but typically audio-features + track info covers:
    // Key, Mode, Acousticness, Danceability, Energy, Instrumentalness, Speechiness.
    // The "analysis_url" itself returns a huge JSON.
    // We will stick to features + track info unless deep analysis is needed.
    return getTrackAudioFeatures(trackId);
};
