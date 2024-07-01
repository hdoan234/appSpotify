import { getAccessTokenWithRefreshToken } from "../src/spotifyAPI.js";

const validating = async (func, user, ...rest) => {
    try {
        return func(user.access_token, ...rest);
    } catch (e) {
        const { access_token } = await getAccessTokenWithRefreshToken(user.refreshToken);

        return func(access_token, ...rest);
    }
}

export default validating;