import * as db from "./database.js" 

import { PrismaClient } from "@prisma/client"

async function test() {
    const prisma = new PrismaClient()

    await prisma.follows.create({
        data: {
            follower: { connect: { spotifyId: "31jok63smduw3muykfnjisywwx4m" } },
            following: { connect: { spotifyId: "onhtthkqrf7den59fgzz57z5h" } }
        }
    })
}

async function print() {
    console.log(await db.getFollowing("onhtthkqrf7den59fgzz57z5h"))
}


test()