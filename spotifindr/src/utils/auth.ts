import axios from 'axios';

axios.defaults.withCredentials = true;

export const checkAuth = async () : Promise<boolean> => {
    const res = await axios.get('http://localhost:3000/api/getAuth');
    return !res.data.ok;
};

export const login = async (username: string, password: string) : Promise<boolean> => {
    const res = await axios.post('http://localhost:3000/api/credAuth', {username, password, "type": "login"});
    return res.data.ok;
};

export const loginWithSpotify = async () : Promise<void> => {
    const res = await axios.get('http://localhost:3000/api/getAuth');
    
    if (res.data.ok) {
        window.location.href = res.data.spotURL;
    } else {
        throw new Error('Already logged in');
    }
}