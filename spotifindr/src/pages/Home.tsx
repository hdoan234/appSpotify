import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';
import { useState, useEffect } from "react"

import axios from 'axios';

import './Home.css';

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
    const [userData, setUserData] = useState(new UserDataProps())

    useEffect(() => {
        axios.get("http://localhost:3000/api/profile", {
            withCredentials: true,
        })
        .then((response) => {
            console.log(response.data)
            if (!response.data.ok) {
                document.location = "/"
            }

            setUserData(new UserDataProps(response.data.data))
        }).catch((error) => {
            console.log(error)
            document.location = "/"
        })

    }, [])
    
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
                <div>Name: { userData.display_name }</div>
                <img src={userData.images[0]?.url} alt="avatar" />
                <div>Country: { userData.country }</div>
            </IonContent>
        </IonPage>
    )

}

export default Home;