import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState, useEffect } from "react"

import * as auth from '../utils/auth';
import './Matching.css';
import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil'; 


const Matching = () => {
    const [profile, setProfile] = useState<UserDataProps>();
    
    useEffect(() => {
        userUtil.getUser()
        .then((data) => {
            if (!data) {
                document.location = "/"
            }
            setProfile(data)
        }).catch((error) => {
            console.log(error)
            document.location = "/"
        })
    }, [])
    return (
        <IonContent fullscreen className="background">
            {/* <div className="back"></div>
             */}
                <p className='found'> Found your match!</p>
            <div className="profiles">
                <img className="user1" src="https://i.pinimg.com/564x/bd/27/4f/bd274fa82f0ee8609278b1c30e3d204e.jpg" alt="" />
                <div className="heart"></div>
                <img className="user2" src={profile?.images[1].url}  alt="avatar" /> 
            </div>
            <button className="explore">See Hazel's Taste! </button>
            <button className="chat">Chat Now</button>

        </IonContent>   
    )
}
export default Matching;