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

    const play = () => {
        socket.emit('ownerPlay', { room: roomId })
    }

    const pause = () => {
        socket.emit('ownerPause', { room: roomId })
    }

    useEffect(() => {
        socket.connect()

        socket.emit('join', { room: roomId })

        // TODO: Add error handling
        socket.on('unauthorized', (error) => alert(error))

        socket.on('greet', (data) => console.log(data))

        socket.on('newMessage', (data) => console.log(data))
        
        socket.on('update', (data) => {
            console.log(data)
            setCurrentPlaying(data)
        })

        socket.on('roomDeleted', () => {
            alert('Room has been deleted');
            window.location.href = '/';
        })


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
                {
                    !currentPlaying || !currentPlaying.is_playing ? <h1 style={{textAlign:"center"}}>Owner is not playing anything</h1> :
                    <div>
                    <div className='cover-artist'>
                        <img style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src={currentPlaying?.item?.album?.images[0]?.url} alt="" />
                            <p style={{fontSize:"1.2rem"}}>Song</p>
                                <p style={{fontSize:"0.8rem"}}> Artist </p>
                                <input className='slider' style={{width: "60%", height:"0.5vh", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" step="0.1" min="1" max="100" value={ sliderProgress} /> 
                            
                    </div>


                    <div className="playing-icons">
                        <IonIcon icon={playSkipBackOutline} onClick={() => play()} className="back-icon room-button"/>
                        <IonIcon icon={playOutline} onClick={() => pause()} className="play-icon room-button"/>
                        <IonIcon icon={playSkipForwardOutline} className="skip-icon room-button"/> 
                    </div>
                    
                    
                </div>
                }
                <div className='chatbox-container'>
                    <div className="chatbox"></div>
                </div>
                
            </IonContent>
        </IonPage>
    );
};
export default Home; 