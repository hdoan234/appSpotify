import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Room from './pages/Room';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { useEffect, useState } from 'react';
import axios from 'axios';

setupIonicReact();

import { checkAuth } from './utils/auth';

const App: React.FC = () => {

  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth().then((response) => {
      setAuthenticated(response)
    })
  }, [])

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <IonRouterOutlet id="main">
            <Route path="/" exact={true} render={() => authenticated ? <Profile /> : <Login />} />
            <Route path="/home" exact={true} render={() => authenticated ? <Home /> : <Login />} />
            <Route path="/profile" exact={true} render={() => authenticated ? <Profile /> : <Login />} />
            <Route path="/room/:roomId" exact={true} render={() => authenticated ? <Room /> : <Login />} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
