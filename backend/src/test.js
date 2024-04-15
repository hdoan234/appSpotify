import * as db from "./database.js" 

import { PrismaClient } from "@prisma/client"

async function test() {
    const prisma = new PrismaClient()

    const user = await prisma.user.findUnique({
        where: {
            spotifyId: "onhtthkqrf7den59fgzz57z5h"
        }, include: {
            following: true,
            followers: true
        }
    })
    
    await prisma.follows.create({
        data: {
            follower: { connect: { id: user.id } },
            following: { connect: { spotifyId: "31jok63smduw3muykfnjisywwx4m" } }
        }
    })
}

async function print() {
    console.log(await db.getFollowing("onhtthkqrf7den59fgzz57z5h"))
}


print()