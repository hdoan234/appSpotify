import axios from 'axios';
import { UserDataProps } from '../type';

axios.defaults.withCredentials = true;

export const getUser = async () : Promise<UserDataProps> => {
    const res = await axios.get('http://localhost:3000/api/profile');
    return res.data.user;
};

export const userPlayingState = async () : Promise<any> => {
    try {
        const res = await axios.get('http://localhost:3000/api/playing');
        return res.data;
    } catch (e : any) {
        throw new Error('Error getting user playing state');
    }
};

export const getPlayingStateById = async (id : string) : Promise<any> => {
    try {
        const res = await axios.get(`http://localhost:3000/api/playing/${id}`);
        return res.data;
    } catch (e : any) {
        throw new Error('Error getting user playing state');
    }
};

export const getCurrentFollow = async () : Promise<any> => {
    try {
        const res = await axios.get('http://localhost:3000/api/currentFollow');
        return res.data;
    } catch (e) {
        throw new Error('Error getting current follow');
    }
};

export const getAllUsers = async () : Promise<any> => {
    try {
        const res = await axios.get('http://localhost:3000/api/allUsers');
        return res.data;
    } catch (e) {
        throw new Error('Error getting all users');
    }
};

export const followUser = async (id : string) : Promise<any> => {
    try {
        const res = await axios.get('http://localhost:3000/api/sendFollow?toId=' + id);
        return res.data;
    } catch (e) {
        throw new Error('Error following user');
    }
};