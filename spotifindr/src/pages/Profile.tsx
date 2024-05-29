import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon, IonSpinner } from '@ionic/react';
import { useState, useEffect, useRef,  useTransition } from "react"
import { useInterval } from 'usehooks-ts';
import { peopleOutline } from 'ionicons/icons';
import { useSpring, animated } from '@react-spring/web';
import './Profile.css';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import * as userUtil from '../utils/userUtil'; 
import { UserDataProps } from '../type';

const Home: React.FC = () => {
    const [userData, setUserData] = useState<UserDataProps>()
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({})
    const [deviceList, setDeviceList] = useState<any>([])
    const [sliderProgress, setSliderProgress] = useState<string>("0")
    const [progress, setProgress] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [show, setShow] = useState<boolean>(false)
    const [props, api] = useSpring(() => ({ 
        from: {opacity: isLoading ? 1 : 0},
        to: {opacity: 0},}))
    const [animation, setAnimation] = useSpring(() => ({
        from: {opacity: isLoading ? 0 : 1},
        to: {opacity: 1},}))

    const timeFormatter = (time: string) : string => {
        return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
    }

    const nodeRef = useRef(null);

    useEffect(() => {
        if (!document.getElementById("spotify-script")) {
            const script = document.createElement('script');
            script.id = "spotify-script";
            script.src = "https://sdk.scdn.co/spotify-player.js";
            document.body.appendChild(script);
        }

        userUtil.getUser()
        .then((data) => {
            if (!data) {
                document.location = "/"
            }
            setUserData(data)
        }).catch((error) => {
            console.log(error)
            document.location = "/"
        })

        userUtil.userPlayingState()
        .then(response => {
            console.log(response);

            setDeviceList(response.devices)
            setCurrentPlaying(response.playing)
            setProgress(parseInt(response.playing.progress_ms))
            setSliderProgress((progress /  parseInt(currentPlaying.item?.duration_ms) * 100).toFixed(2))
            setTimeout(() => {
                setIsLoading(false)
            }, 1000)
                        
        })

    }, [])

    useInterval(() => {
        userUtil.userPlayingState()
        .then(response => {
            console.log(response);
            setDeviceList(response.devices)
            setCurrentPlaying(response.playing)
            setProgress(parseInt(response.playing.progress_ms))
            setSliderProgress((progress /  parseInt(currentPlaying.item?.duration_ms) * 100).toFixed(2))

            
            
        })
        .catch((error) => {
            console.log(error)
        })
    }, 10000)

    useEffect(() => {
        if (!currentPlaying?.is_playing || progress >= parseInt(currentPlaying.item?.duration_ms)) {
            return
        }
        const interval = setInterval(() => {
            setProgress(progress + 100)
            setSliderProgress((progress /  parseInt(currentPlaying.item?.duration_ms) * 100).toFixed(2))
            
        }, 100)

        return () => clearInterval(interval)
    }, [progress, currentPlaying])

    // TODO: Loading spinner
    if (isLoading) {
        return <animated.div className='loading-background' style={props}> 
            <IonSpinner name="crescent" style={{ color: "white" }} />
            </animated.div>
    }
    

    return (
        
            <IonPage>
            
                <IonContent fullscreen className="background">
                    <animated.div style={animation} >
                        { currentPlaying && currentPlaying.item.album.images[1].url &&
                        <TransitionGroup>
                            <CSSTransition
                                key={currentPlaying.item.album.images[1].url}
                                timeout={5000}
                                classNames="bg-css-group"
                                onEnter={() => console.log("enter")}
                                onExit={() => console.log("exit")}
                                onEntered={() => console.log("entered")}
                                onExited={() => console.log("exited")}
                                unmountOnExit
                                appear
                            >
                                <div id="bg-pic">
                                    <img id="bg-overlay" src={currentPlaying.item.album.images[1].url} />
                                </div>
                            </CSSTransition>
                        </TransitionGroup>
                    }
                    <div>
                        <div style={{ color: "white" }}  className='name-block'>
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
                    currentPlaying &&
                    <div>
                        <div className="album-image"> 
                            <img  style={{width: "70%", borderRadius: "8%", maxWidth: "400px"}} src={ currentPlaying.item?.album.images[0].url } alt="" />
                            <p className="title">{currentPlaying.item?.name } </p>
                            <p style={{fontSize:"0.7rem"}}>{ currentPlaying.item?.artists.map((artist: any, index : number) => `${artist.name}${index === currentPlaying.item?.artists.length - 1 ? "" : ", "}`) }
                            </p>
                            <div className="slide-container">
                                
                                <p className="time">
                                    {timeFormatter(progress + "") }
                                </p>
                                <input className='slider' style={{width: "40%", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" step="0.1" min="1" max="100" value={ sliderProgress} /> 

                                <p className="time">
                                    { timeFormatter(currentPlaying.item?.duration_ms) }
                                </p>
                            </div>
                        </div>
                    </div>
                    }

                    <select className='devices'>
                        <option value="">Select a device</option>
                        { deviceList.map((device: any) => {
                            return <option key={device.id} value={device.id}>{ device.name } - { device.type }</option>
                        })}
                        
                    </select>
                    </animated.div>
                 </IonContent>
            </IonPage>
   
    )
}

export default Home;