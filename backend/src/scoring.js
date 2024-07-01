import wrapper from '../utils/wrapper.js';
import utils from '../utils/spotifyUtils.js';

const scoring = async (user1, user2) => {

    const user1Song= (await wrapper(utils.getTopListen, user1)).items;
    const user2Song= (await wrapper(utils.getTopListen, user2)).items;

    const user1TrackId= user1Song.map((song) => song.uri.split(':')[2]);
    const user2TrackId= user2Song.map((song) => song.uri.split(':')[2]);
    
    const user1AverageFeature= {
        danceability: 0,
        energy: 0,
        loudness: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
        tempo: 0,
    };
    
    const user2AverageFeature= {
        danceability: 0,
        energy: 0,
        loudness: 0,
        speechiness: 0,
        acousticness: 0,
        instrumentalness: 0,
        liveness: 0,
        valence: 0,
        tempo: 0,
    };

    const user1TrackFeature =await wrapper(utils.getTrackFeature, user1, user1TrackId);

    user1TrackFeature.audio_features.forEach((track) => {
        for (let key in user1AverageFeature) {
            user1AverageFeature[key]+= track[key];
        }
    })

    for (let key in user1AverageFeature) {
        user1AverageFeature[key]/=user1TrackId.length;
    }

    
    const user2TrackFeature =await wrapper(utils.getTrackFeature, user2, user2TrackId);
    user2TrackFeature.audio_features.forEach((track) => {
        for (let key in user2AverageFeature) {
            user2AverageFeature[key]+= track[key];
        }
    })


    for (let key in user2AverageFeature) {
        user2AverageFeature[key]/=user2TrackId.length;
    }

    let score= 0;
    for (let key in user1AverageFeature) {
        score+= (user1AverageFeature[key]-user2AverageFeature[key])**2;
    }


    return Math.sqrt(score);
}

export default scoring;

