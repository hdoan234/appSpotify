import { PrismaClient } from '@prisma/client'

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

    console.log(user)

    return user
}


export async function getAccountById(id) {
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })

    console.log(user)

    return user
}

export async function getFollowing(spotifyId) {
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            spotifyId: spotifyId
        }, include: {
            following: true,
            followers: true
        }
    })

    return user
}