import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonIcon } from '@ionic/react';

import { useState, useEffect } from "react"

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

    const spotAuthHandler = async () : Promise<void> => {

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (!code) {
            const response = await axios.get("http://localhost:3000/getAuth")
            localStorage.setItem("verifier", response.data.verifier);    
            document.location = response.data.spotURL
        } else {
            
            
            const verifier = localStorage.getItem("verifier");


                
            const params = new URLSearchParams();
            params.append("client_id", "bc9f189f3fcc42e1934d09886c74aa1e");
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", "http://localhost:3000/callback");
            params.append("code_verifier", verifier!);

            const result = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            });

            const { access_token } = await result.json();


            const profile = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", 
                headers: { Authorization: `Bearer ${access_token}` 
            }


            });

            console.log(await profile.json())
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
                    login == "register" ?
                    (
                    <div className="input-container">
                        <div className='icon-container'>
                            <IonIcon icon={lockClosedOutline} />    
                        </div>   
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
                
                
                <input type="submit" value={login == "login" ? "Login" : "Sign up"}/> 
            </form>
                {
                    login == "login" ?
                    (
                        <button id="spotify" onClick={spotAuthHandler}>Login with <i className="fa fa-spotify" id="logo"></i></button>
                    )
                    : ""
                }
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
