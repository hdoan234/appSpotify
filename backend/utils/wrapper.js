import { getAccessTokenWithRefreshToken } from "../src/spotifyAPI.js";
import { PrismaClient } from "@prisma/client";

const validating = async (func, user, ...rest) => {
    try {
        return await func(user.access_token, ...rest);
    } catch (e) {
        const prisma = new PrismaClient();
        console.log(e)
        const newToken = await getAccessTokenWithRefreshToken(user.refresh_token);
        user.access_token = newToken.access_token;

        await prisma.user.update({
            where: {
                spotifyId: user.spotifyId
            },
            data: {
                access_token: newToken.access_token,
                refresh_token: newToken.refresh_token
            }
        })

        return await func(user.access_token, ...rest);
    }
}

export default validating;