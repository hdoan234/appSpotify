import { IonButtons, IonContent, IonHeader, IonSpinner, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import React, { useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { IonSearchbar } from '@ionic/react';
import { useSpring, animated } from '@react-spring/web';

import FriendBlock from '../components/FriendBlock';

import { FollowUserProps, UserDataProps } from '../type';
import * as userUtil from '../utils/userUtil';
import { search } from 'ionicons/icons';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const [following, setFollowing] = useState<FollowUserProps[]>([]);
  const [fetchedSearch, setFetchedSearch] = useState<any[]>([])
  const [searchData, setSearchData] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserDataProps>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [props, api] = useSpring(() => ({ 
    from: {opacity: isLoading ? 1 : 0},
    to: {opacity: 0},}))
    
  const fetchData = async() => {
      const follow = userUtil.getCurrentFollow();
      const profile = userUtil.getUser();
      const search = userUtil.getAllUsers();

    return { "follow": await follow, "profile": await profile, search: await search};
  }

  const searchHandler = (e: any) => {
    const searchEntry = e.target.value.toLowerCase();

    if (searchEntry === "") {
      setSearchData([])
      return
    }

    setSearchData(fetchedSearch.filter((user) => {
      return user.name.toLowerCase().includes(searchEntry) || user.email.includes(searchEntry)
    }))
    console.log(searchData.map((user) => user.name))
  }

  useEffect(() => {
    fetchData().then((data) => {
      setFollowing(data.follow.following)
      setProfile(data.profile)
      setFetchedSearch(data.search)
    }).then(() => setIsLoading(true))
  }, [])

  useInterval(() => {
    userUtil.getCurrentFollow().then((data) => {
      setFollowing(data.following)
    })
  }, 5000)
  



  return (
    <IonPage>
      <IonContent fullscreen className="container" >
      {        
        !isLoading ? <LoadingSpinner isLoading={isLoading} /> :
        <>
        <div className="search-container" >
          <div className="search-bar-component">
            <IonSearchbar className="search-bar" onIonInput={searchHandler} onIonFocus={() => setSearchFocus(true)} onIonBlur={() => setSearchFocus(false)}></IonSearchbar>
            <div onFocus={() => setSearchFocus(true)} className="result-list" style={{ display: `${searchFocus ? "inline" : "none"}` }}>
              {
                searchData.map((user) => 
                <div key={user.spotifyId} className="search-result">
                  <span style={{padding:"5px"}}>
                    {user.name}
                  </span>
                  {
                    user.spotifyId !== profile?.id &&
                    <button onClick={() => userUtil.followUser(user.spotifyId)} className='follow'>{following.some((follow) => follow.userInfo.spotifyId === user.spotifyId) ? "Followed" : "Follow"}</button>
                  }
                </div>)
              }
            </div>
          </div>
          <a href="/profile">
            <img src={profile?.images[1].url} className="user" alt="avatar" /> 
          </a>
        </div>
        <button className="find-match-button">Find your match</button>
        {
          following.length == 0 ? <h1 style={{textAlign: "center"}}>Oof... You're not following anyone</h1> :
          <div className="friend-container">
          { following?.map((follow) => <>
            <FriendBlock url={follow.userInfo.imageUrl} currentPlaying={follow.ok ? follow.playing : null} key={follow.userInfo.spotifyId} >{follow.userInfo.name}</FriendBlock> 
            <FriendBlock url={follow.userInfo.imageUrl} currentPlaying={follow.ok ? follow.playing : null} key={follow.userInfo.spotifyId} >{follow.userInfo.name}</FriendBlock> 
            <FriendBlock url={follow.userInfo.imageUrl} currentPlaying={follow.ok ? follow.playing : null} key={follow.userInfo.spotifyId} >{follow.userInfo.name}</FriendBlock> 
          </>)
}
          </div>
        }
        </>
      }
   
      </IonContent>
    </IonPage>
  );
};

export default Home;
