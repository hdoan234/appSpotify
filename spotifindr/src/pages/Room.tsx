import { IonButtons, IonContent, IonHeader, IonSpinner, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react";
import { listOutline, playOutline, playSkipBackOutline, playSkipForwardOutline, searchOutline, radioOutline } from 'ionicons/icons';
import axios from 'axios';

import socket from '../websocket';

import './Room.css';
import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil';


import { useParams } from 'react-router';

const Home: React.FC = () => {
    
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({});
    const [following, setFollowing] = useState<FollowUserProps[]>([]);
    const [profile, setProfile] = useState<UserDataProps>();
    const [isLoading, setIsLoading] = useState(false);
    const [player, setPlayer] = useState<any | null>(null);
    const [sliderProgress, setSliderProgress] = useState<string>("0");


    const [msg, setMsg] = useState('');

    const { roomId } : { roomId : string } = useParams()

    const sendMessage = () => {
        console.log(msg)
        socket.emit('sendMessage', { room: roomId, message: msg })
    }

    useEffect(() => {
        socket.connect()

        socket.on('greet', (data) => console.log(data))
        socket.on('newMessage', (data) => console.log(data))
        socket.emit('join', { room: roomId })

        return () => {
            socket.disconnect()
        }
    }, [])


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
                        <p>Room Name</p>
                        </div>
                </div>
                <div className='cover-artist'>
                    <img style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src="https://i.scdn.co/image/ab67616d0000b273dc1081776f364f65b7d1b845" alt="" />
                        <p style={{fontSize:"1.2rem"}}>Song</p>
                            <p style={{fontSize:"0.8rem",  padding:"5px"}}> Artist </p>
                            <input className='slider' style={{width: "60%", height:"0.7vh", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" step="0.1" min="1" max="100" value={ sliderProgress} />
                            <p style={{margin:"5px"}}></p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>

                <div className="playing-icons">
                    <IonIcon icon={playSkipBackOutline} className="back-icon room-button"/> 
                    <IonIcon icon={playOutline} className="play-icon room-button"/> 
                    <IonIcon icon={playSkipForwardOutline} className="skip-icon room-button"/>
                </div>
                
                <div className="queue-album">

                </div>
                </div>
            </IonContent>
        </IonPage>
    );
};
export default Home;