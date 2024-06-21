import { getAccessTokenWithRefreshToken } from "../src/spotifyAPI";

const validating = (func, user) => {
    try {
        return func(user);
    } catch (e) {
        const { access_token } = getAccessTokenWithRefreshToken(user.refreshToken);

        return func(access_token);
    }
}