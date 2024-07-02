import { send, text } from 'ionicons/icons';
import './Fullscreen.css'
import React, { useState } from 'react';


const fullscreen = ({ onClick, onChange } : any) => {
    const [messages, setMessages] = useState([
        {id:1 , text: 'Hello!',sender: 'user'},
        {id:2 , text: 'Hi!',sender: 'assistant'}
    ]);
    return (
        <div className='chatbox-container'>
            <div className="chatbox fullscreen">
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="user-info">
                            <div className="avatar"></div>
                            <span className="username">Group</span>
                        </div>
                        
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((message) => (
                        <div key={message.id} className={`message ${message.sender}`}>
                            <div className="message-content">{message.text}</div>
                        </div>
                        ))}
                    </div>
                    
                    <div className="chat-input">
                        <input type="text" onChange={onChange} placeholder="Aa" />
                        <button onClick={onClick} className="sending-button">➤</button>
                    </div>
                    </div>
        </div>
        </div>
);

   
}
export default fullscreen;