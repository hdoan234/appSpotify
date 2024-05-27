import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState } from "react"

import { sendOutline } from 'ionicons/icons';
import * as auth from '../utils/auth';

import './Chat.css';

const Chat = () => {
    return (
            <IonContent fullscreen className="background">
                <p className='room-name'> Chat Room</p>
                <div className='line'>
                    
                </div>
                <textarea className='chat-box' placeholder='Type a message...'></textarea>
                <button className='send-button'> <IonIcon icon={sendOutline} className="send-outline"> </IonIcon></button>
            </IonContent>

    )
}

export default Chat;
