import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react";
import { listOutline, shuffleOutline, heartOutline, addCircleOutline, searchOutline, radioOutline } from 'ionicons/icons';
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
                        <p style={{padding:"3px"}}>Room Name</p>
                        </div>
                </div>
                {
                    !currentPlaying || !currentPlaying.is_playing ? <h1>Owner is not playing anything</h1> :
                    <div>
                    <div className='cover-artist'>
                        <img style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src={currentPlaying?.item?.album?.images[0]?.url} alt="" />
                            <p className="title">Song</p>
                                <p> Artist </p>
                            
                    </div>


                    <div className="playing-icons">
                        <IonIcon icon={shuffleOutline} onClick={() => play()} className="shuffle-icon"/>
                        <IonIcon icon={heartOutline} onClick={() => pause()} className="heart-icon"/>
                        <IonIcon icon={addCircleOutline} className="add-icon"/> 
                    </div>
                    <input type="text" onChange={(e) => setMsg(e.target.value)} />
                    <button onClick={sendMessage}>Send</button>
                    <div className="queue-album">

                    </div>
                </div>
                }
            </IonContent>
        </IonPage>
    );
};
export default Home;