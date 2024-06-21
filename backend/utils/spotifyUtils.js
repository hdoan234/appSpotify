import axios from 'axios'
import { response } from 'express';

const getListeningState = async (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/player/currently-playing';
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    const result = await axios.get(url, {
        headers: headers
    });

    return result.data;
}

const playAlbumByURI = (uri, accessToken, albumPosition, timeFrame) => {
    const url = 'https://api.spotify.com/v1/me/player/play';
    
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const body = {
        context_uri: uri,
        offset: {
            position: albumPosition
        },
        position_ms: timeFrame
    };

    axios.put(url, body, { headers: headers });

}

const pause = (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/player/pause';
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    axios.put(url, {}, { headers: headers });

}

const getTopListen = async (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/top/tracks?limit=50';
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    
    response = await axios.get(url, { headers: headers });
    

    return response.data;
}

const getTrackFeature = async (accessToken, trackId) => {
    const url = `https://api.spotify.com/v1/audio-features/${trackId}`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    response = await axios.get(url, { headers: headers });

    return response.data;
}

export default { getListeningState, playAlbumByURI, pause, getTopListen, getTrackFeature};