import * as db from "./database.js" 

import { PrismaClient } from "@prisma/client"

async function test() {
    const prisma = new PrismaClient()

    await prisma.follows.create({
        data: {
            followerId: "66280a60483c9b90ff5b665e",
            followingId: "6627fd21daf760e992725c52"
        }
    })
}

async function print() {
    console.log(await db.getFollowing("onhtthkqrf7den59fgzz57z5h"))
}


test()