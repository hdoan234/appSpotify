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

    const handleClick = async () => {
        setIsLoading(true)

        const response = await userUtil.findMatch()
        
        setMatchArray(response.matches)
        
        console.log(response.matches)

        setTimeout(() => {
            setShow(true)
            setIsLoading(false)
        }, 5000)
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
            {/* <div className="back"></div>
             */}
                <p className='found'>{ show && "Found your match!" }</p>
            <div className="profiles">
                <img className="user2" src={profile?.images[1].url} alt="avatar" /> 
                <div className="heart"></div>
                
                <img className="user1" src={show ? matchArray[0].user.imageUrl : "https://www.svgrepo.com/show/105517/user-icon.svg"} alt="" />
                
            </div>
            <button onClick={() => handleClick()} className="explore">{ show ? `See ${matchArray[0].user.displayName}'s Taste` : "Start Matching!" }</button>
            <button className="chat">{ show ? `Message ${matchArray[0].user.displayName}` : "Return to Home" }</button>

        </IonContent>   
    )
}
export default Matching;