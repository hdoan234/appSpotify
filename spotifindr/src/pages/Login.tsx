import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState } from "react"

import { lockClosedOutline, personOutline } from 'ionicons/icons';
import ExploreContainer from '../components/ExploreContainer';
import './Login.css';

import axios from 'axios';

const Page: React.FC = () => {

    const [login, setLogin] = useState("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e : any) : Promise<void> => {
        e.preventDefault()

        const response = await axios.post("http://localhost:3000", {
            "username": username,
            "password": password
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        })



        console.log(response.data)
    }
  return (
    <IonPage>
      <IonContent fullscreen className="container">
        
        <div className="circle cir1"></div>
        <div className="circle cir3"></div>

        <div className="form-container">


            <h1 className="header">SpotiFind</h1>
            <form className='login-form' onSubmit={handleSubmit}>
                <div className="input-container">
                    <IonIcon icon={personOutline} />
                    <input className="input-field" type="text" name="username" value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)}/>
                </div>

                <div className="input-container">
                    <IonIcon icon={lockClosedOutline} />    
                    <input className="input-field" type="password" name="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
                </div>  

                {
                    login == "register" ?
                    (
                    <div className="input-container">
                        <IonIcon icon={lockClosedOutline} />    
                        <input className="input-field" type="password" name="confirm_password" placeholder='Confirm Password'/>
                    </div>
                    )
                    : ""
                }
                {
                    login == "login" ?
                    (
                        <a className="forgot-password" href="#">Forgot password?</a>
                    )
                    : ""
                }
                
                
                <input type="submit" value={login == "login" ? "login" : "Sign up"}/> 
            </form>
        </div>
        {
        login == "login" ?  
            <div id="changeState">
                Don't have an account - <a onClick={() => setLogin("register")}>Create account</a>
            </div>
        :   <div id="changeState">
                Already have an account - <a onClick={() => setLogin("login")}>Log in</a>
            </div>
        }
      </IonContent>
    </IonPage>
  );
};

export default Page;
