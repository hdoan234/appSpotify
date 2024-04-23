import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState } from "react"

import { lockClosedOutline, personOutline } from 'ionicons/icons';
import * as auth from '../utils/auth';

import './Login.css';


const Page: React.FC = () => {

    const [login, setLogin] = useState("login")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e : any) : Promise<void> => {
        e.preventDefault()

        const success = await auth.login(username, password)

        if (success) {
            document.location = "/home"
        } else {
            alert("Invalid username or password")
        }
    }

  return (
    <IonPage>
      <IonContent fullscreen className="container">
        
        <div className="circle cir1"></div>
        <div className="circle cir3"></div>

        <div id="slogan">Tune In to Love: Where Music Meets Romance!</div>

        <div className="form-container">


            <h1 className="header">SpotiFind</h1>
            <form className='login-form' onSubmit={handleSubmit}>
                <div className="input-container">
                    <div className='icon-container'>
                        <IonIcon icon={personOutline} />
                    </div>
                    <input className="input-field" type="text" name="username" value={username} placeholder='Username' onChange={(e) => setUsername(e.target.value)}/>
                </div>

                <div className="input-container">
                    <div className='icon-container'>
                        <IonIcon icon={lockClosedOutline} />    
                    </div>
                    <input className="input-field" type="password" name="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)}/>
                </div>  

                {
                    login == "register" &&
                    <div className="input-container">
                        <div className='icon-container'>
                            <IonIcon icon={lockClosedOutline} />    
                        </div>   
                        <input className="input-field" type="password" name="confirm_password" placeholder='Confirm Password'/>
                    </div>
                }
                {
                    login == "login" &&
                        <a className="forgot-password" href="#">Forgot password?</a>
                }
                
                
                <input type="submit" value={login == "login" ? "Login" : "Sign up"}/> 
            </form>
                {
                    login == "login" &&
                        <button id="spotify" onClick={auth.loginWithSpotify}>Login with <i className="fa fa-spotify" id="logo"></i></button>
                }
        </div>
        <div id="changeState">
        {
        login == "login" ?  
                <>Don't have an account - <a onClick={() => setLogin("register")}>Create account</a></>
                : <>Already have an account - <a onClick={() => setLogin("login")}>Log in</a></>
        }
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Page;
