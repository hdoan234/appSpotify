import crypto from "crypto"
const clientId = "bc9f189f3fcc42e1934d09886c74aa1e"
const clientSecret = "ef343bf5d97245e581abbfbabae45c68"

import axios from "axios"

import { PrismaClient } from "@prisma/client"

export const redirectToAuth = async () => {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:3000/callback");
    params.append("scope", "user-read-private user-read-email user-read-playback-state user-read-currently-playing user-modify-playback-state");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    return {
        "spotURL": `https://accounts.spotify.com/authorize?${params.toString()}`,
        "verifier": verifier,
    };
}
export function generateCodeVerifier(length) {
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

export const getAccessToken = async (verifier, code) => {
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000/callback");
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    return await result.json();
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