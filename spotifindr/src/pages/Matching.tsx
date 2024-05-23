import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState } from "react"

import { lockClosedOutline, personOutline } from 'ionicons/icons';
import * as auth from '../utils/auth';

import './Matching.css';

const Matching = () => {
    return (
        <IonContent fullscreen className="background">
            {/* <div className="back"></div>
             */}
                <p className='found'> Found your match!</p>
            <div className="profiles">
                <img className="user1" src="https://i.pinimg.com/564x/bd/27/4f/bd274fa82f0ee8609278b1c30e3d204e.jpg" alt="" />
                <div className="heart"></div>
                <img className="user2" src="https://i.pinimg.com/564x/fa/33/b0/fa33b04b0b1ddf30a33f5faeba6a6298.jpg" alt="" />
            </div>
            <button className="explore">See Hazel's Taste! </button>
            <button className="chat">Chat Now</button>

        </IonContent>   
    )
}
export default Matching;