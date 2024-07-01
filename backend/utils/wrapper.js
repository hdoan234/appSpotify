import { getAccessTokenWithRefreshToken } from "../src/spotifyAPI";

const validating = (func, ...rest) => {
    try {
        return func(user.access_token, rest);
    } catch (e) {
        const { access_token } = getAccessTokenWithRefreshToken(user.refreshToken);

        return func(access_token);
    }
}

export default validating;