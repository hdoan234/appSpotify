import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react"
import { useInterval } from 'usehooks-ts';
import { peopleOutline } from 'ionicons/icons';
import axios from 'axios';

import './Profile.css';
import { time } from 'ionicons/icons';

import { io } from "socket.io-client";
const socket = io("ws://localhost:3001");

import { UserDataProps } from '../type';

const Home: React.FC = () => {
    const [userData, setUserData] = useState<UserDataProps>()
    const [delay, setDelay] = useState<number>(1000)
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({})
    const [deviceList, setDeviceList] = useState<any>([])
    const [sliderProgress, setSliderProgress] = useState<string>("0")

    const timeFormatter = (time: string) : string => {
        return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
    }

    useEffect(() => {
        if (!document.getElementById("spotify-script")) {
            const script = document.createElement('script');
            script.id = "spotify-script";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            document.body.appendChild(script);
        }

        axios.get("http://localhost:3000/api/profile", {
            withCredentials: true,
        })
        .then((response) => {
            if (!response.data.ok) {
                document.location = "/"
            }

            setUserData(response.data.data)
        }).catch((error) => {
            console.log(error)
            document.location = "/"
        })

    }, [])

    useInterval(() => {
        axios.get("http://localhost:3000/api/playing", {
            withCredentials: true,
        }).then(response => {
            setDeviceList(response.data["devices"])
            if (!response.data.playing && response.data.ok) {
                setDelay(10000)
            } else {
                setCurrentPlaying(response.data["playing"])
                setSliderProgress((parseInt(currentPlaying.progress_ms) /  parseInt(currentPlaying.item?.duration_ms) * 100).toFixed())
                setDelay(500)
            }
        })
    }, delay)

    
    return (
        <IonPage>
        
            <IonContent fullscreen className="background">
                {/* TODO: Add styling to these dynamic fields */}
                
                <div>
                    <div  style={{ color: "white" }}  className='name-block'>
                        <a href={userData?.uri}> 
                            <img src={userData?.images[1]?.url} className="ava" alt="avatar" /> 
                        </a>
                        <div className="info">
                            <a style={{ width: "100%", display: "flex", justifyContent: "left" }} href={userData?.uri}>
                                <span style={{ color: "white" }}className="username" >
                                    { userData?.display_name }
                                </span>
                            </a>
                            <div className='more-info'>
                                <IonIcon icon={peopleOutline} color="white" style={{ fontSize: "1.25rem", marginRight: "5px" }}></IonIcon>
                                <span>Followers: { userData?.followers.total }</span>
                            </div>
                        </div>
                    </div>
                </div>
                {
                currentPlaying ?
                <div>
                    <div className="album-image"> 
                        <img  style={{width: "70%", borderRadius: "8%", maxWidth: "600px"}} src={ currentPlaying.item?.album.images[0].url } alt="" />
                        <p className="title">{currentPlaying.item?.name } </p>
                        <p style={{fontSize:"0.7rem"}}>{ currentPlaying.item?.artists.map((artist: any, index : number) => `${artist.name}${index === currentPlaying.item?.artists.length - 1 ? "" : ", "}`) }
                        </p>
                        <div className="slide-container">
                            
                            <p className="time">
                                {timeFormatter(currentPlaying.progress_ms) }
                            </p>
                            <input className='slider' style={{width: "40%", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" min="1" max="100" value={ sliderProgress} /> 

                             <p className="time">
                                   { timeFormatter(currentPlaying.item?.duration_ms) }
                            </p>
                        </div>
                    </div>
                </div>
                : ""
                }
                
                

                <select className='devices'>
                    <option value="">Select a device</option>
                    { deviceList.map((device: any) => {
                        return <option key={device.id} value={device.id}>{ device.name } - { device.type }</option>
                    })}
                </select>
            </IonContent>
        </IonPage>
    )

}

export default Home;