import { PrismaClient } from '@prisma/client'

export async function createAccount(email, spotifyId, displayName) {
    const prisma = new PrismaClient()
    
    const user = await prisma.user.create({
        data: {
            email: email,
            spotifyId: spotifyId,
            name: displayName
        }
    })

    console.log(user)
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