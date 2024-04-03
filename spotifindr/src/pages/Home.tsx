import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react"
import { useInterval } from 'usehooks-ts';

import axios from 'axios';

import './Home.css';
import { time } from 'ionicons/icons';

import { io } from "socket.io-client";
const socket = io("ws://localhost:3001");

type ImageProps = {
    url: string
    height: number
    width: number
}

class UserDataProps {

    constructor(data: any = {}) {
        this.country = data.country || "";
        this.display_name = data.display_name || "";
        this.explicit_content = data.explicit_content || {
            filter_enabled: false,
            filter_locked: false
        };
        this.external_urls = data.external_urls || {
            spotify: ""
        };
        this.followers = data.followers || {
            href: "",
            total: 0
        };
        this.href = data.href || "";
        this.id = data.id || "";
        this.images = data.images || [];
        this.product = data.product || "";
        this.type = data.type || "";
        this.uri = data.uri || "";
    }

    country: string = "";
    display_name: string = "";
    explicit_content : {
        filter_enabled: boolean,
        filter_locked: boolean
    } = {
        filter_enabled: false,
        filter_locked: false
    };
    external_urls: {
        spotify: string
    } = {
        spotify: ""
    };
    followers: {
        href: string,
        total: number
    } = {
        href: "",
        total: 0
    };
    href: string = "";
    id: string = "";
    images: ImageProps[] = [];
    product: string = "";
    type: string = "";
    uri: string = "";
}



const Home: React.FC = () => {
    const [userData, setUserData] = useState<UserDataProps>(new UserDataProps())
    const [delay, setDelay] = useState<number>(1000)
    const [currentPlaying, setCurrentPlaying] = useState<any>({})
    const [deviceList, setDeviceList] = useState<any>([])


    const timeFormatter = (time: string) : string => {
        return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
    }

    useEffect(() => {
        const script = document.createElement('script');

        script.src = "https://sdk.scdn.co/spotify-player.js";

        document.body.appendChild(script);

        socket.on("greet", (greet) => {
            console.log(greet)
        })
        console.log(delay)

        axios.get("http://localhost:3000/api/profile", {
            withCredentials: true,
        })
        .then((response) => {
            if (!response.data.ok) {
                document.location = "/"
            }

            setUserData(new UserDataProps(response.data.data))
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
                setDelay(200)
            }
        })
    }, delay)

    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonMenuButton />
                    </IonButtons>
                    <IonTitle>Home</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                {/* TODO: Add styling to these dynamic fields */}
                <div>Name: { userData.display_name }</div>
                <img src={userData.images[0]?.url} alt="avatar" />
                <div>Country: { userData.country }</div>
                <div>Followers: { userData.followers.total }</div>
                <div>Spotify Profile: <a href={userData.uri}>{ userData.uri }</a></div>
            

                <img style={{width: "15%"}} src={ currentPlaying.item?.album.images[0].url } alt="" />
                <div>Currently Playing: { currentPlaying.item?.name } - By { currentPlaying.item?.artists.map((artist: any, index : number) => `${artist.name}${index === currentPlaying.item?.artists.length - 1 ? "" : ","}`) }</div>
                <input style={{width: "40%"}} readOnly type="range" step="0.001" min="1" max="100" value={ (parseInt(currentPlaying.progress_ms) /  parseInt(currentPlaying.item?.duration_ms) * 100).toFixed(3) } /> 
                
                <div>
                    { timeFormatter(currentPlaying.progress_ms) } / { timeFormatter(currentPlaying.item?.duration_ms) }
                </div>

                <select>
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