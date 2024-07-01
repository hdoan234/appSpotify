import { useState } from "react";
import {animated, useSpring} from '@react-spring/web';
import { IonSpinner } from '@ionic/react';

const LoadingSpinner = (htmlprops:any):any => {
    
     const [props, api] = useSpring(() => ({ 
        from: {opacity: htmlprops.isLoading ? 1 : 0},
        to: {opacity: 0},}))
   
    return (
        <animated.div className='loading-background' style={props}> 
            <IonSpinner name="crescent" style={{ color: "white" }} />
            </animated.div>
    )
}

export default LoadingSpinner;