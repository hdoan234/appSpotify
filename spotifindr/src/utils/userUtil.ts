
import axios from './setupAxios'

export const getUser = async () : Promise<any> => {
    const res = await axios.get('/api/profile');
    return res.data.user;
};

export const userPlayingState = async () : Promise<any> => {
    console.log(import.meta.env)
    try {
        const res = await axios.get('/api/playing');
        return res.data;
    } catch (e : any) {
        throw new Error('Error getting user playing state');
    }
};

export const getPlayingStateById = async (id : string) : Promise<any> => {
    try {
        const res = await axios.get(`/api/playing/${id}`);
        return res.data;
    } catch (e : any) {
        throw new Error('Error getting user playing state');
    }
};

export const getCurrentFollow = async () : Promise<any> => {
    try {
        const res = await axios.get('/api/currentFollow');
        return res.data;
    } catch (e) {
        throw new Error('Error getting current follow');
    }
};

export const getAllUsers = async () : Promise<any> => {
    try {
        const res = await axios.get('/api/allUsers');
        return res.data;
    } catch (e) {
        throw new Error('Error getting all users');
    }
};

export const followUser = async (id : string) : Promise<any> => {
    try {
        const res = await axios.get('/api/sendFollow?toId=' + id);
        return res.data;
    } catch (e) {
        throw new Error('Error following user');
    }
};

export const findMatch = async () : Promise<any> => {
    try {
        const res = await axios.get('/api/findMatch');
        return res.data;
    } catch (e) {
        throw new Error('Error sending match');
    }
}

export const logout = async () : Promise<void> => {
    await axios.get('/api/logout');
    window.location.href = '/';
}