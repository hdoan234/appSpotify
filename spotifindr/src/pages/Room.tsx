import { IonButtons, IonContent, IonHeader, IonSpinner, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react";
import { listOutline, playOutline, playSkipBackOutline, playSkipForwardOutline, searchOutline, radioOutline, image, send } from 'ionicons/icons';
import axios from 'axios';
import socket from '../websocket';
import './Room.css';
import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil';
import { useParams } from 'react-router';
import FullScreen from '../components/Fullscreen'; 

const Home: React.FC = () => {
    
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({});
    const [profile, setProfile] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [sliderProgress, setSliderProgress] = useState<string>("0");
    const [messageArray, setMessageArray]= useState<any[]>([])
    const [chatFullscreen, setChatFullscreen] = useState<boolean>(false)
    const [text, setText] = useState('')
    const [roomName, setRoomName] = useState<string>('');

    const { roomId } : { roomId : string } = useParams()

    const sendMessage = (currentMessage : string) => {
        console.log()
        socket.emit('sendMessage', { room: roomId, message: currentMessage, userId: profile?.id, imageUrl: profile?.images[0].url, userName: profile?.display_name })
    }

    const play = () => {
        socket.emit('ownerPlay', { room: roomId })
    }

    const pause = () => {
        socket.emit('ownerPause', { room: roomId })
    }
    const fetchRoomDetails = async (roomId: string) => {
        try {
            const response = await axios.get(`/localhost:8100/rooms/${roomId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching room details:", error);
            return null;
        }
    };    

    useEffect(() => {
        socket.connect()

        userUtil.getUser().then((data) => { setProfile(data); console.log(data) })

        socket.emit('join', { room: roomId })

        fetchRoomDetails(roomId).then((roomDetails) => {
            if (roomDetails) {
                setRoomName(roomDetails.name); 
            }
        });

        // TODO: Add error handling
        socket.on('unauthorized', (error) => alert(error))

        socket.on('greet', (data) => console.log(data))

        socket.on('newMessage', (data) => {
            setMessageArray(data)
            scrollToBottom()
            scrollToBottom()
            scrollToBottom()
            scrollToBottom()

        })

        socket.on('update', (data) => {
            console.log(data)
            setCurrentPlaying(data.roomState)
            setMessageArray(data.roomMessages)
        })

        socket.on('roomDeleted', () => {
            alert('Room has been deleted');
            window.location.href = '/';
        })


        return () => {
            socket.disconnect()
        }
    }, [roomId])
    useEffect(() => {
        if (!currentPlaying?.is_playing || !currentPlaying?.item) return;

        const interval = setInterval(() => {
            setCurrentPlaying((prevPlaying:any) => {
                if (!prevPlaying) return prevPlaying;

                const newProgress = prevPlaying.progress_ms + 100;
                const newSliderProgress = (newProgress / prevPlaying.item.duration_ms) * 100;
                setSliderProgress(newSliderProgress.toFixed(2));

                return { ...prevPlaying, progress_ms: newProgress };
            });
        }, 100);

        return () => clearInterval(interval);
    }, [currentPlaying]);

    const scrollToBottom = () => {
        setTimeout(() => {
            var objDiv = document.querySelector(".chat-messages");
            if (objDiv) {
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        }, 100)
    }

    document.addEventListener('click', (event) => {
        const excludedSelector = '.chatbox-container';
        if (event.target instanceof HTMLElement && !event.target.closest(excludedSelector)) {
            setChatFullscreen(false)
        }
    });
    

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
                        <span className="room-name">{ roomId }</span>
                        </div>
                </div>
                {
                    !currentPlaying || !currentPlaying.is_playing ? <h1 style={{textAlign:"center"}}>Owner is not playing anything</h1> :
                    <div>
                    <div className='cover-artist'>
                        <img style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src={currentPlaying?.item?.album?.images[0]?.url} alt="" />
                            <p style={{fontSize:"1.2rem", marginTop:"20px"}}>{currentPlaying.item?.name }</p>
                                <p style={{fontSize:"0.8rem",paddingBottom:"10px"}}>{currentPlaying.item?.artists.map((artist: any, index : number) => `${artist.name}${index === currentPlaying.item?.artists.length - 1 ? "" : ", "}`) } </p>
                                <input className='slider' style={{width: "60%", height:"0.5vh", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" step="0.1" min="1" max="100" value={sliderProgress} /> 
                            
                    </div>


                    <div className="playing-icons">
                        <IonIcon icon={playSkipBackOutline} onClick={() => play()} className="back-icon room-button"/>
                        <IonIcon icon={playOutline} onClick={() => pause()} className="play-icon room-button"/>
                        <IonIcon icon={playSkipForwardOutline} className="skip-icon room-button"/> 
                    </div>
                    
                    
                </div>
                }
                <div className='chatbox-container' >
                    <div className="chatbox" onClick={
                        () => {
                            scrollToBottom()
                            setChatFullscreen(true)
                        }
                    }>
                        
                    </div>
                    { chatFullscreen && <FullScreen roomId={roomId} txt={text} userSpot={profile?.id} messages={messageArray} onSubmit={() => { sendMessage(text); setText(""); }} onChange={(e : any) => {
                        setText(e.target.value);
                    }} /> } 
                </div>
                
            </IonContent>
        </IonPage>
    );
};
export default Home; 