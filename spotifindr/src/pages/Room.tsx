import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react";
import { listOutline, shuffleOutline, heartOutline, addCircleOutline, searchOutline } from 'ionicons/icons';
import axios from 'axios';

import socket from '../websocket';

import './Room.css';
import { FollowUserProps, UserDataProps } from '../type';

import { useParams } from 'react-router';

const Home: React.FC = () => {
    
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({});
    const [following, setFollowing] = useState<FollowUserProps[]>([]);
    const [profile, setProfile] = useState<UserDataProps>();
    const [isLoading, setIsLoading] = useState(false);
  
    const { roomId } : { roomId : string } = useParams()

    const sendGreet = () => {
        socket.emit('greet', 'Hello from the client side')
    }

    useEffect(() => {
        socket.connect()


        socket.on('greet', (data) => console.log(data))
        socket.emit('join', { room: roomId })

        return () => {
            socket.disconnect()
        }
    }, [])

    return(
        <IonPage>
            <IonContent fullscreen className='background'>
                <div>
                    <IonIcon icon={listOutline} className="room-icon"/>
                    <IonIcon icon={searchOutline} className="search-icon"/>
                </div>
 
                <div className="room">
                        {/*<IonIcon icon={} className="room-icon"/>*/}
                        <p>Room</p>
                </div>
                <div className='cover-artist'>
                    <img  style={{width: "70%", borderRadius: "8%", maxWidth: "600px"}} src={ currentPlaying.item?.album.images[0].url } alt="" />
                    <p style={{fontSize:"20px"}}>Song</p>
                    <p style={{fontSize:"15px"}}>Artist</p>
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