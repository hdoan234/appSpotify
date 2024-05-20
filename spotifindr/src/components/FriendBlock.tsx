import React from "react";
import { useState, useEffect } from "react"

import "./FriendBlock.css";



const FriendBlock = ({children, url, key, currentPlaying} : any) : any => {
    const sliderProgress = (parseInt(currentPlaying?.progress_ms) /  parseInt(currentPlaying?.item?.duration_ms) * 100).toFixed()
    
    const [progress, setProgress] = useState(currentPlaying?.progress_ms)

    useEffect(() => {
        setProgress(currentPlaying?.progress_ms)
        const interval = setInterval(() => {
            setProgress(progress + 1000)
            console.log(progress)
        }, 1000)
        return () => clearInterval(interval)
    }, [progress])

    const timeFormatter = (time: string) : string => {
      return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
    }

    return (
        
        <div key={key} className="friend">
            <div className="friend-content">
                <img className="friend-ava" src={url} alt="avatar" />
                <div className="friend-name">{children}</div>
            </div>
            {/* TODO: Add design to each friend block */}
            {
                currentPlaying && currentPlaying?.is_playing ?
                <div className="friend-playing">
                    <div className="progress-slider">
                        <p className="time-friend">
                            {timeFormatter(progress + "") }
                        </p>
                        <input className='slider-friend' style={{ width: "100%", background: `linear-gradient(90deg, #04AA6D ${sliderProgress}%, white ${sliderProgress}%)`}} readOnly type="range" min="1" max="100" value={ sliderProgress} /> 
                        <p className="time-friend">
                            { timeFormatter(currentPlaying?.item?.duration_ms) }
                        </p>
                    </div>
                    <p className="song-friend"> 
                        <p className="song"> {currentPlaying.item.name} </p>
                        <p className="artist"> {currentPlaying?.item?.album.artists.map((artist : any, index: number) => index != currentPlaying.item.album.artists.length - 1 ? artist.name + ", " : artist.name)} </p>
                    </p>

                        <button type="button" className="join-button">Join</button>
                
                </div>
                : <div className="friend-playing">Not currently playing</div>
            }
        </div>
        
    );
};

export default FriendBlock;