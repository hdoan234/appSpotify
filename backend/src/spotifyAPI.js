import crypto from "crypto"
const clientId = "bc9f189f3fcc42e1934d09886c74aa1e"
const clientSecret = "ef343bf5d97245e581abbfbabae45c68"

import axios from "axios"

import { PrismaClient } from "@prisma/client"

import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

export const redirectToAuth = async () => {

    const state = generateState(16);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "https://scale-emily-und-spending.trycloudflare.com/callback");
    params.append("scope", "streaming app-remote-control user-read-private user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state");
    params.append("state", state);

    return {
        "spotURL": `https://accounts.spotify.com/authorize?${params.toString()}`,
    };
}
export function generateState(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.createHash("sha256");
    hash.update(data)
    const digest = await hash.digest();
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export const getAccessToken = async (state, code) => {
    const form = {
        code: code,
        redirect_uri: "https://scale-emily-und-spending.trycloudflare.com/callback",
        grant_type: "authorization_code",
    }
    const headers = {
        'Authorization': 'Basic ' + (Buffer.from(clientId + ':' + clientSecret).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    const result = await axios.post("https://accounts.spotify.com/api/token", form, { headers: headers }, { json: true });

    return await result.data;
}

export const getAccessTokenWithRefreshToken = async (refreshToken) => {

    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + new Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    }

    const form = {
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
    }

    const body = await axios.post(url, form, { headers: headers, json: true});

    return body.data;
}