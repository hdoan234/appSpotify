import wrapper from './wrapper';
import { getTopListen, getTrackFeature } from './spotifyUtils';

const scoring = async (user1, user2) => {
    const user1Song= (await getTopListen(user1.accessToken)).items;
    const user2Song= (await getTopListen(user2.accessToken)).items;
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

    for (let i = 0; i < user1TrackId.length; i++) {
        const user1TrackFeature =await getTrackFeature(user1.accessToken, user1TrackId[i]);
        for (let key in user1TrackFeature) {
            user1AverageFeature[key]+=user1TrackFeature[key];
        }
    }
    for (let key in user1AverageFeature) {
        user1AverageFeature[key]/=user1TrackId.length;
    }

    for( let i=0; i<user2TrackId.length; i++) {
        const user2TrackFeature =await getTrackFeature(user2.accessToken, user2TrackId[i]);
        for (let key in user2TrackFeature) {
            user2AverageFeature[key]+=user2TrackFeature[key];
        }
    }
    for (let key in user2AverageFeature) {
        user2AverageFeature[key]/=user2TrackId.length;
    }

    const score= 0;
    for (let key in user1AverageFeature) {
        score+= (user1AverageFeature[key]-user2AverageFeature[key])**2;
    }


    return Math.sqrt(score);
}

export default scoring;

