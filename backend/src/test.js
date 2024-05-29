import * as db from "./database.js" 

import { PrismaClient } from "@prisma/client"

async function test() {
    const prisma = new PrismaClient()

    await prisma.user.create({
        data: {
            spotifyId: "devin",
        }
    })
}

async function print() {
    console.log(await db.getFollowing("onhtthkqrf7den59fgzz57z5h"))
}


test()