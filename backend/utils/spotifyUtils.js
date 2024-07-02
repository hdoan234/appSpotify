import axios from 'axios'

const getListeningState = async (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/player/currently-playing';
    const headers = {
        'Authorization': `Bearer ${accessToken}`
    };

    try {
        const result = await axios.get(url, {
            headers: headers
        });
    
        return result.data;
    } catch (e) {
        throw e;
    }
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

    try {
        axios.put(url, body, { headers: headers });
    } catch (e) {
        throw e;
    }

}

const pause = (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/player/pause';
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    try{
        axios.put(url, {}, { headers: headers });
    } catch (e) {
        throw e;
    }
}

const getTopListen = async (accessToken) => {
    const url = 'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term';
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };
    
    try {

        const response = await axios.get(url, { headers: headers });
        return response.data;
    }catch (e) {
        throw e;
    }
    

}

const getTrackFeature = async (accessToken, trackIds) => {

    const url = `https://api.spotify.com/v1/audio-features?ids=${trackIds.join('%2C')}`;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    try{
        const response = await axios.get(url, { headers: headers });

        return response.data;
    }catch (e) {
        throw e;
    }


}

export default { getListeningState, playAlbumByURI, pause, getTopListen, getTrackFeature };