import React from "react";

import "./FriendBlock.css";

const FriendBlock = ({children, url, key} : any) : any => {
    return (
        <div key={key} className="friend">
            <div className="friend-content">
                <img className="friend-ava" src={url} alt="avatar" />
                <div className="friend-name">{children}</div>
               
            </div>
        </div>
    );
};

export default FriendBlock;