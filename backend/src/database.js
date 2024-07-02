import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function createAccountWithSpotify(email, spotifyId, displayName, refreshToken, accessToken, imageUrl) {
    imageUrl = imageUrl ? imageUrl : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' /%3E%3C/svg%3E`;

    const user = await prisma.user.create({
        data: {
            email: email,
            spotifyId: spotifyId,
            name: displayName,
            imageUrl: imageUrl,
            refresh_token: refreshToken,
            access_token: accessToken
        }
    })
}

export async function getAccount(spotifyId) {
    const user = await prisma.user.findUnique({
        where: {
            spotifyId: spotifyId
        }
    })


    return user
}


export async function getAccountById(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })


    return user
}

export async function getFollowing(spotifyId) {
    if (!spotifyId) throw new Error('No spotifyId provided')

    const user = await prisma.user.findUnique({
        where: {
            spotifyId: spotifyId
        }, 
        include: {
            following: true,
            followers: true
        }
    })

    return user
}

export async function sendFollow(fromId, toId) {
    try {
        await prisma.follows.create({
            data: {
                follower: { connect: { spotifyId: fromId } },
                following: { connect: { spotifyId: toId } }
            }
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                console.log('Already following')
                throw new Error('Already following')
            }
        }
    }
}