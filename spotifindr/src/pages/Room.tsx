import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react";
import { listOutline, shuffleOutline, heartOutline, addCircleOutline, searchOutline, radioOutline } from 'ionicons/icons';
import axios from 'axios';

import './Room.css';
import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil';


const Home: React.FC = () => {
  
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({});
    const [following, setFollowing] = useState<FollowUserProps[]>([]);
    const [profile, setProfile] = useState<UserDataProps>();
    const [isLoading, setIsLoading] = useState(false);
  
     useEffect(() => {
        // Function to retrieve follower songs
        const getFollowerSongs = async () => {
            const followerSongsData = [];
            for (const follower of following) {
                // Retrieve currently playing track for each follower
                const response = await axios.get(`http://localhost:3000/api/playing/`);
                followerSongsData.push(response.data);
            }
            setCurrentPlaying(followerSongsData);
        };

        // Fetch followers from your backend or other source
        const fetchFollowers = async () => {
            // Fetch followers from your backend or other source
            const response = await axios.get('http://localhost:3000/api/currentFollow');
            setFollowing(response.data);
        };

        // Fetch followers and their currently playing songs
        fetchFollowers();
        getFollowerSongs();
    }, []);
    return(
        <IonPage>
            <IonContent fullscreen className='background'>
                <div className="header-icon">
                    <IonIcon icon={listOutline} className="list-icon"/>
                    <IonIcon icon={searchOutline} className="search-icon"/>
                </div>
 
                <div className="room">
                        <div className='room-name'>
                        <IonIcon icon={radioOutline} className="room-icon"/>
                        <p style={{padding:"3px"}}>Friend's Room</p>
                        </div>
                </div>
                <div className='cover-artist'>
                    {currentPlaying.item && (
                        <>
                            <img style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src="{currentPlaying.item.album.images[0].url}" alt="" />
                            <p className="title">{currentPlaying.item.name}</p>
                            <p style={{fontSize: "0.7rem"}}>
                                {currentPlaying.item.artists.map((artist: any, index: number) => (
                                    `${artist.name}${index === currentPlaying.item.artists.length - 1 ? "" : ", "}`
                                ))}
                            </p>
                        </>
                    )}
                </div>


                <div className="playing-icons">
                    <IonIcon icon={shuffleOutline} className="shuffle-icon"/>
                    <IonIcon icon={heartOutline} className="heart-icon"/>
                    <IonIcon icon={addCircleOutline} className="add-icon"/> 
                </div>
                <div className="queue-album">

                </div>
            </IonContent>
        </IonPage>
    );
};
export default Home;