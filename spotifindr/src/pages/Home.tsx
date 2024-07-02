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

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E";

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
  const [dropDownOpen, setDropDownOpen] = useState(false);

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
      return user.name.toLowerCase().includes(searchEntry)
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
            <div onFocus={() => setSearchFocus(true)} className="result-list" style={{ display: `${searchFocus ? "inline" : "none"}`, zIndex: 999 }}>
              {
                searchData.map((user, index) => 
                <div key={index} className="search-result">
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
          <div>
            <button className='profile-button' onClick={() => setDropDownOpen(!dropDownOpen)}>
              <img src={profile?.images[1]?.url} className="user" alt="avatar" /> 
            </button>
            { dropDownOpen && 
              <div className="dropdown">
                <div onClick={() => document.location = "/profile"} className="menu-items">
                  <span>Profile</span>
                  <span className="arrow">&gt;</span>
                </div>
                <div onClick={async () => await userUtil.logout()} className="menu-items">
                  <span>Log Out</span>
                  <span className="arrow">&gt;</span>
                </div>
              </div>
            }
          </div>
        </div>
        <a href="/matching">
          <button className="find-match-button">Find your match</button>
        </a>
        {
          following.length == 0 ? <h1 style={{textAlign: "center"}}>Oof... You're not following anyone</h1> :
          <div className="friend-container">
          { following?.map((follow, index) => <>
            <FriendBlock url={follow.userInfo.imageUrl} currentPlaying={follow.ok ? follow.playing : null} key={index}>{follow.userInfo.name}</FriendBlock> 
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
