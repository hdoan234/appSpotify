import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import React, { useEffect, useState } from 'react';
import { IonSearchbar } from '@ionic/react';

import FriendBlock from '../components/FriendBlock';

import axios from 'axios';
import { FollowUserProps, UserDataProps } from '../type';
import * as user from '../utils/user';

const Home: React.FC = () => {
  const [following, setFollowing] = useState<FollowUserProps[]>([]);
  const [profile, setProfile] = useState<UserDataProps>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async() => {
      const follow = user.getCurrentFollow();
      const profile = user.getUser();
    

    return { "follow": await follow, "profile": await profile };
  }

  useEffect(() => {
    fetchData().then((data) => {
      setFollowing(data.follow.following)
      setProfile(data.profile)

    }).then(() => setIsLoading(true))
  }, [])


  return (
    <IonPage>
      <IonContent fullscreen className="container" >
      <div className="search-container" >
        <IonSearchbar className="search-bar" ></IonSearchbar>
        <img src={profile?.images[1].url} className="user" alt="avatar" /> 
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
