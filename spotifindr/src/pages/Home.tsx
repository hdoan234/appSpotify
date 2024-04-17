import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import React, { useEffect, useState } from 'react';
import { IonSearchbar } from '@ionic/react';


import FriendBlock from '../components/FriendBlock';

import axios from 'axios';
import { FollowUserProps, UserDataProps } from '../type';

const Home: React.FC = () => {
  const [following, setFollowing] = useState<FollowUserProps[]>([]);
  const [profile, setProfile] = useState<UserDataProps>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState<any | null>({})

  const timeFormatter = (time: string) : string => {
    return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
}
  
  const fetchData = async() => {
      const follow = await axios.get("http://localhost:3000/api/currentFollow", {
        withCredentials: true,
      })
      const profile = await axios.get("http://localhost:3000/api/profile", {
        withCredentials: true,
      })
    
  

    return { "follow": follow, "profile": profile };
  }

  useEffect(() => {
    fetchData().then((data) => {
      setFollowing(data.follow.data.following)
      setProfile(data.profile.data.data)
    }).then(() => setIsLoading(true))
  }, [])


  return (
    <IonPage>
      <IonContent fullscreen className="container" >
      <div className="search-container" >
        <IonSearchbar className="search-bar" ></IonSearchbar>
        <a className='user-ava-container' href="/profile"> 
            <img src={profile?.images[0].url} className="user" alt="avatar" /> 
        </a>
      </div>
      {
        !isLoading ? 
          <div style={{color: "white"}}>Loading...</div>
        : <div className="friend-container">
        { following?.map((follow) => <FriendBlock url={follow.imageUrl} key={follow.spotifyId} >{follow.name}</FriendBlock> )}
        </div>
   
      }

        
      </IonContent>
    </IonPage>
  );
};

export default Home;
