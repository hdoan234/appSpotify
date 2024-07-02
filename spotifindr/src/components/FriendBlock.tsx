import React from "react";
import { useState, useEffect } from "react"

import "./FriendBlock.css";

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E";

const FriendBlock = ({children, url, currentPlaying, ...props} : any) : any => {
    
    const [progress, setProgress] = useState(currentPlaying?.progress_ms)

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev : number) => {
                if (prev >= parseInt(currentPlaying?.item?.duration_ms)) {
                    return prev
                }
                return prev + 100
            })
            
            console.log(progress)

        }, 100)
        return () => clearInterval(interval)
    }, [currentPlaying])

    const timeFormatter = (time: string) : string => {
      return `${Math.floor(parseInt(time) / 1000 / 60) }:${ (Math.floor(parseInt(time) / 1000 % 60) + "").padStart(2, "0") }`
    }

    return (
        
        <div key={props.key} className="friend">
            <div className="friend-content">
                <img className="friend-ava" src={url || defaultAvatar} alt="avatar" />
                <div className="friend-name">{children}</div>
            </div>
            {
                currentPlaying && currentPlaying?.item ?
                <div className="friend-playing">
                    <div className="progress-slider">
                        <p className="time-friend">
                            {timeFormatter(progress + "") }
                        </p>
                        <input className='slider-friend' style={{ width: "100%", background: `linear-gradient(90deg, #04AA6D ${(parseInt(progress) /  parseInt(currentPlaying?.item?.duration_ms) * 100).toFixed(2)}%, white ${(parseInt(progress) /  parseInt(currentPlaying?.item?.duration_ms) * 100).toFixed(2)}%)`}} readOnly type="range" step="0.01" min="1" max="100" value={ (parseInt(progress) /  parseInt(currentPlaying?.item?.duration_ms) * 100).toFixed(2)} /> 
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