import React from "react";
import { useState, useEffect } from "react"

import "./FriendBlock.css";


const FriendBlock = ({children, url, key} : any) : any => {
    const [currentPlaying, setCurrentPlaying] = useState<any | null>({})
    const [deviceList, setDeviceList] = useState<any>([])
    const [sliderProgress, setSliderProgress] = useState<string>("0")

  
    const timeFormatter = (time: string) : string => {
      return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
  }
    return (
        
        <div key={key} className="friend">
            <div className="friend-content">
                <img className="friend-ava" src={url} alt="avatar" />
                <div className="friend-name">{children}</div>
            </div>
            
            <div className="friend-playing">
                <div className="progress-slider">
                    <p className="time-friend">
                        {timeFormatter(currentPlaying.progress_ms) }
                    </p>
                    <input className='slider-friend' style={{width: "40%", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" min="1" max="100" value={ sliderProgress} /> 
                    <p className="time-friend">
                        { timeFormatter(currentPlaying.item?.duration_ms) }
                    </p>
                </div>
                <p className="song-friend"> 
                    <p>Song </p>
                        <p className="artist">Artist </p>
                </p>

                    <button type="button" className="join-button">Join</button>
              
            </div>
        </div>
        
    );
};

export default FriendBlock;