import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState } from "react"

import { lockClosedOutline, personOutline } from 'ionicons/icons';
import * as auth from '../utils/auth';

import './Chat.css';

const Chat = () => {
    return (
            <IonContent fullscreen className="background">
                <p className='room-name'> Chat Room</p>
                <div className='line'>
                    
                </div>
            </IonContent>

    )
}

export default Chat;
