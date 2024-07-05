import wrapper from '../utils/wrapper.js';
import utils from '../utils/spotifyUtils.js';

const scoring = async (user1, user2) => {
    try {

        const user1Song= (await wrapper(utils.getTopListen, user1)).items;
        const user2Song= (await wrapper(utils.getTopListen, user2)).items;

        const user1TrackId= user1Song.map((song) => song.uri.split(':')[2]);
        const user2TrackId= user2Song.map((song) => song.uri.split(':')[2]);

        const similarTrackName = user1Song.filter((track) => user2TrackId.includes(track.uri.split(':')[2])).map((track) => track.name);
        const simlarTrackRankingUser1 = similarTrackName.map((track) => user1Song.map((song) => song.name).indexOf(track));
        const simlarTrackRankingUser2 = similarTrackName.map((track) => user2Song.map((song) => song.name).indexOf(track));

        if (user1TrackId == 0 || user2TrackId.length == 0) {
            console.log(user2.name);

            return 999;
        }

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

        user1TrackFeature.audio_features.forEach((track, index) => {
            for (let key in user1AverageFeature) {
                user1AverageFeature[key] += track[key] * (user1TrackId.length - index);
            }
        })

        for (let key in user1AverageFeature) {
            user1AverageFeature[key] /= user1TrackId.length * (user1TrackId.length + 1) / 2;
        }

        
        const user2TrackFeature =await wrapper(utils.getTrackFeature, user2, user2TrackId);
        user2TrackFeature.audio_features.forEach((track, index) => {
            for (let key in user2AverageFeature) {
                user2AverageFeature[key]+= track[key] * (user2TrackId.length - index);
            }
        })


        for (let key in user2AverageFeature) {
            user2AverageFeature[key]/=user2TrackId.length * (user1TrackId.length + 1) / 2;
        }

        let score= 0;
        for (let key in user1AverageFeature) {
            score+= (user1AverageFeature[key]-user2AverageFeature[key])**2;
        }

        console.log("--------------------")
        console.log(similarTrackName.join(', '))
        console.log(`${user1.name} ranking: ${simlarTrackRankingUser1}`)
        console.log(`${user2.name} ranking: ${simlarTrackRankingUser2}`)
        console.log("--------------------")


        return score
    } catch (e) {
        console.log(e.message);
        return 999;
    }
}

export default scoring;

