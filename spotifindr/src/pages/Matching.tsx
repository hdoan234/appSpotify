import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState, useEffect } from "react"
import './Matching.css';
import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil'; 

const Matching = () => {
    const [profile, setProfile] = useState<UserDataProps>();
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [matchArray, setMatchArray] = useState<any[]>([])
    const [matchStarted, setMatchStarted] = useState(false)

    const handleClick = () => {
        setIsLoading(true)
        setMatchStarted(true)

        new Promise(async (resolve) => {
            const response = await userUtil.findMatch()
            setMatchArray(response.matches)
            
            console.log(response.matches)
            setTimeout(() => {
                resolve("done")
            }, 5000)
        })
        .then(() => {
            setIsLoading(false)
            setShow(true)
        })
        
        
    }

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
            <p style={show ? { opacity: 1 } : {}} className='found'>Found your match!</p>
            <div className="profiles">
                <img className="user1" style={matchStarted ? { left: '50%', transform: "translateX(100%)", opacity: show ? 0 : 1 } : {}} src={"https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg"} alt="" />
                <img className="user2" style={show ? {left: "59%", opacity: "1" } : {left: "59%", opacity: 0 }} src={show ? matchArray[0].user.imageUrl : "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg"} alt="" />
                <div className="heart"></div>
                <img className="user2" style={matchStarted ? { transform: "translateX(-100%)" } : {}} src={profile?.images[1]?.url} alt="avatar" /> 
            </div>
            <button onClick={() => handleClick()} className="explore">{  isLoading ? "Finding..." : show ? `See ${matchArray[0].user.displayName}'s Taste` : "Start Matching!" }</button>
            { show && <button className="chat">Message {matchArray[0].user.displayName}</button> }
            <button className="chat" onClick={() => document.location = "/home" }> Return to Home</button>

        </IonContent>   
    )
}
export default Matching;