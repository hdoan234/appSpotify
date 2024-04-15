import { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

export async function createAccountWithSpotify(email, spotifyId, displayName, refreshToken) {
    const prisma = new PrismaClient()
    
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
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            spotifyId: spotifyId
        }
    })


    return user
}


export async function getAccountById(id) {
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })


    return user
}

export async function getFollowing(spotifyId) {
    const prisma = new PrismaClient()

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
    const prisma = new PrismaClient()

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