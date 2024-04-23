import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import React, { useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { IonSearchbar } from '@ionic/react';

import FriendBlock from '../components/FriendBlock';

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

  useInterval(() => {
    user.getCurrentFollow().then((data) => {
      setFollowing(data.following)
      console.log(data.following)
    })
  }, 5000)

  return (
    <IonPage>
      <IonContent fullscreen className="container" >
      {
        // TODO: Add design to the loading screen, maybe a spinner component since we are going to reuse it
        !isLoading ? <h1>Loading...</h1> :
        <>
        <div className="search-container" >
          <IonSearchbar className="search-bar" ></IonSearchbar>

          <a href="/profile">
            <img src={profile?.images[1].url} className="user" alt="avatar" /> 
          </a>
        </div>
        {
          // TODO: Add more styling to no following
          following.length == 0 ? <h1 style={{textAlign: "center"}}>Oof... You're not following anyone</h1> :
          <div className="friend-container">
          { following?.map((follow) => <FriendBlock url={follow.userInfo.imageUrl} currentPlaying={follow.playing} key={follow.userInfo.spotifyId} >{follow.userInfo.name}</FriendBlock> )}
          </div>
        }
        </>
      }
   
      </IonContent>
    </IonPage>
  );
};

export default Home;
