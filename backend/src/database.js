import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export async function createAccountWithSpotify(email, spotifyId, displayName, refreshToken) {
    const user = await prisma.user.create({
        data: {
            email: email,
            spotifyId: spotifyId,
            name: displayName,
            refresh_token: refreshToken
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