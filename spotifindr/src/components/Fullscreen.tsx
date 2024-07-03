import './Fullscreen.css'

const fullscreen = ({messages, onSubmit, onChange, userSpot, txt, roomId } : any) => {


    return (
        <div className='chatbox-container'>
            <div className="chatbox fullscreen">
                <div className="chat-container">
                    <div className="chat-header">
                        <div className="user-info">
                            <span className="username">{ roomId }</span>
                        </div>
                        
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((message : any, index: number) => (
                        <div key={index} className={`${userSpot != message.userId && (index > 0 ? message.imageUrl != messages[index - 1].imageUrl : true) ? "has-image" : ""} message ${userSpot == message.userId ? "user" : "other" }`}>
                            { userSpot != message.userId && (index > 0 ? message.imageUrl != messages[index - 1].imageUrl : true) && 
                                <div className="current-info">
                                    <img className="message-image" src={message.imageUrl} /> 
                                    <span className="username">{message.userName}</span>
                                </div>
                            }
                            <div className="message-content">{message.message}</div>
                        </div>
                        ))}
                    </div>
                    
                    <form className="chat-input" onSubmit={(e) => {
                        onSubmit(e);
                        e.preventDefault();
                            
                    }}>
                        <input type="text" value={txt} onChange={onChange} placeholder="Aa" />
                        <input type="submit" className="sending-button" value="➤" />
                    </form>
                    </div>
        </div>
        </div>
);

   
}
export default fullscreen;