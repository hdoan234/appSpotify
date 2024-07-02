import express from 'express';
import cors from 'cors';

import axios from 'axios';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import { redirectToAuth, getAccessToken, getAccessTokenWithRefreshToken } from "./src/spotifyAPI.js"
import { createAccountWithSpotify, getAccount, getFollowing, getAccountById, sendFollow } from './src/database.js';

import scoring from "./src/scoring.js"
import { Server } from 'socket.io';
import { createServer, get } from 'http';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';

import spotifyUtils from './utils/spotifyUtils.js';

import dotenv from "dotenv"


dotenv.config({ path: ['./.env'] })

const app = express();

const sessionMiddleware = session({
  proxy: true,
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: !!process.env.CLOUDFLARE_API_URL,
    sameSite: !!process.env.CLOUDFLARE_API_URL ? 'none' : 'lax',
  }
})


app
  .set('trust proxy', 1)
  .use(cors({
    origin: ['http://localhost:8100', 'https://mullet-pleased-centrally.ngrok-free.app', process.env.REACT_APP_API_URL],
    credentials: true,
  }))
  .use(cookieParser())
  .use(bodyParser.json())
  .use(sessionMiddleware)


const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8100', 'https://mullet-pleased-centrally.ngrok-free.app'],
    credentials: true
  }
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next)
})

const authMiddleware = (req, res, next) => {
  if (isAuthenticated(req)) {
    next()
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

const roomMap = new Map()
const socketIdToRoom = new Map()

io.on('connection', async (socket) => {
  if (!socket.request.session.user) {
    socket.emit('unauthorized', 'Unauthorized')
    socket.disconnect()
  }

  const roomDataUpdate = async (ownerId) => {
    const ownerUser = await getAccount(ownerId)
    const access_token = ownerUser.access_token
    
    try {

      const roomState = await spotifyUtils.getListeningState(access_token)

      return roomState


    } catch (e) {

      const new_access_token = await refreshLogin(ownerUser.refresh_token, ownerUser.spotifyId)
      const roomState = await spotifyUtils.getListeningState(new_access_token)
      
      return roomState

    }
  }

  socket.on('join', async (data) => {
    socket.join(data.room)
    if (socketIdToRoom.has(socket.id)) {
      socketIdToRoom.get(socketId).add(data.room)
    } else {
      socketIdToRoom.set(socket.id, new Set([data.room]))
    }

    const socketId = socket.id;
    const spotifyId = socket.request.session.user.spotifyId

    console.log(roomMap.get(data.room))

    if (!roomMap.has(data.room)) {

      const IdToUsersMapping = new Map()
      const UsersToIdMapping = new Map()

      IdToUsersMapping.set(socketId, spotifyId)
      UsersToIdMapping.set(spotifyId, socketId)

      roomMap.set(data.room, {
        "owner": spotifyId,
        "IdToUsersMapping": IdToUsersMapping,
        "UsersToIdMapping": UsersToIdMapping
      })

    } else if (roomMap.get(data.room)["UsersToIdMapping"].has(spotifyId)) {

      const oldSocketId = roomMap.get(data.room)["UsersToIdMapping"].get(spotifyId)

      roomMap.get(data.room)["IdToUsersMapping"].delete(oldSocketId)

      roomMap.get(data.room)["IdToUsersMapping"].set(socketId,spotifyId);
      roomMap.get(data.room)["UsersToIdMapping"].set(spotifyId, socketId);

    } else {
      roomMap.get(data.room)["IdToUsersMapping"].set(socketId, spotifyId);
      roomMap.get(data.room)["UsersToIdMapping"].set(spotifyId, socketId);
    }

    const ownerId = roomMap.get(data.room)["owner"]

    
    const roomState = await roomDataUpdate(ownerId)
    io.to(data.room).emit('update', roomState)

    console.log(spotifyId + " joined " + data.room)

  })

  socket.on('ownerPlay', async (data) => {
    console.log("Owner Play Requested " + data.room)

    if (roomMap.get(data.room)["IdToUsersMapping"].get(socket.id) != roomMap.get(data.room)["owner"]) {
      socket.emit('unauthorized', 'Unauthorized')
      return
    }
    
    const ownerUser = await getAccount(roomMap.get(data.room)["owner"])

    let ownerCurrentState;

    try {
      ownerCurrentState = await spotifyUtils.getListeningState(ownerUser.access_token)
    } catch (e) {
      const newToken = refreshLogin(ownerUser.refresh_token, ownerUser.spotifyId)
      ownerCurrentState = await spotifyUtils.getListeningState(newToken.access_token)
    }
    const uri = ownerCurrentState.item.album.uri;
    const timeFrame = ownerCurrentState.progress_ms;
    const albumPosition = ownerCurrentState.item.track_number - 1;

    for (let [socketId, spotifyId] of roomMap.get(data.room)["IdToUsersMapping"]) {
      getAccount(spotifyId).then((user) => {
        const access_token = user.access_token
        try {
          spotifyUtils.playAlbumByURI(uri, access_token, albumPosition, timeFrame)
        } catch (e) {
          const newToken = refreshLogin(user.refresh_token, user.spotifyId)
          spotifyUtils.playAlbumByURI(uri, newToken.access_token, albumPosition, timeFrame)
        }
      })
    }

    socket.to(data.room).emit('update', ownerCurrentState)
  })

  socket.on('ownerPause', (data) => {
    console.log("Owner Pause Requested " + data.room)

    if (roomMap.get(data.room)["IdToUsersMapping"].get(socket.id) != roomMap.get(data.room)["owner"]) {
      socket.emit('unauthorized', 'Unauthorized')
      return
    }

    for (let [socketId, spotifyId] of roomMap.get(data.room)["IdToUsersMapping"]) {
      getAccount(spotifyId).then(async (user) => {
        const access_token = user.access_token
        try {
          spotifyUtils.pause(access_token)
        } catch (e) {
          const newToken = await refreshLogin(user.refresh_token, user.spotifyId)
          spotifyUtils.pause(newToken.access_token)
        }
      })
    }

    socket.to(data.room).emit('update', { "is_playing": false })
  })

  socket.on('sendMessage', (data) => {
    console.log(data)
    io.to(data.room).emit('newMessage', { userImage: data.userImage, userId: data.userId, message: data.message, userName: data.userName})
  })

  socket.on('disconnect', () => {
    const id = socket.id

    const userRooms = socketIdToRoom.get(id)

    if (userRooms) userRooms.forEach((room) => {
      if (!roomMap.get(room)) return

      if (roomMap.get(room)["owner"] == roomMap.get(room)["IdToUsersMapping"].get(id)){
        roomMap.delete(room)
        io.to(room).emit('roomDeleted', 'Room Deleted')
      } else {
        io.to(room).emit('userLeft', { userID: roomMap.get(room)["IdToUsersMapping"].get(id) })
  
        roomMap.get(room)["UsersToIdMapping"].delete(roomMap.get(room)["IdToUsersMapping"].get(id))
        roomMap.get(room)["IdToUsersMapping"].delete(id)
        
      }
      console.log(socket.request.session.user.spotifyId + " left " + room)
    })
  })
})

const prisma = new PrismaClient()

const isAuthenticated = (req) => {
  return Boolean(req.session.user)
}

const refreshLogin = async (refresh_token, id) => {

  try {
    const newToken = await getAccessTokenWithRefreshToken(refresh_token)
    await prisma.user.update({
      where: {
        spotifyId: id
      },
      data: {
        refresh_token: newToken.refresh_token,
        access_token: newToken.access_token
      }
    })
  
    return newToken
  } catch (e) {
    throw new Error(e.message)
  }

}

app.get('/api/getAuth', async (req, res) => {

  if (isAuthenticated(req)) {
    res.send({
      "ok": false,
      "message": "Already authenticated"
    })
    return
  }

  const { spotURL } = await redirectToAuth()


  res.send({
    ok: true,
    spotURL: spotURL
  })
})

app.post('/api/credAuth', async (req, res) => {
  if (isAuthenticated(req)) {
    res.send({
      "ok": false,
      "message": "Already authenticated"
    })
    return
  }

  const { username, password, type } = req.body


  if (!username || !password || !type) {
    res.send({
      "ok": false,
      "message": "Missing fields"
    })
    return
  }

  if (type == 'login') {
    const account = await prisma.user.findUnique({
      where: {
        email: username
      }
    })

    if (!account) {
      res.send({
        "ok": false,
        "message": "Account not found"
      })
      return
    }


    req.session.user = {
      "spotifyId": account.spotifyId,
    }


    res.send({
      "ok": true,
      "message": "Logged in"
    })


  }
})

app.get("/callback", async (req, res) => {
  
  const state = req.query.state
  const code = req.query.code

  const tokenObj = await getAccessToken(state, code)


  const access_token = tokenObj.access_token
  const refresh_token = tokenObj.refresh_token

  const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
  })

  const account = await getAccount(result.data.id)
  
  req.session.user = {
    "spotifyId": result.data.id,
  }

  console.log(result.data.id)

  if (!account) await createAccountWithSpotify(result.data.email, result.data.id, result.data.display_name, refresh_token, access_token, result.data?.images[1]?.url)
  else {
    await prisma.user.update({
      where: {
        spotifyId: result.data.id
      },
      data: {
        refresh_token: refresh_token,
        access_token: access_token
      }
    })
  }

  req.session.save(err => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect(process.env.REACT_APP_API_URL || 'http://localhost:8100')
    }
  })

})


app.get('/api/playing', authMiddleware, async (req, res) => {

  const user = await getAccount(req.session.user.spotifyId)

  if (!user) {
    res.status(401).send({
      "ok": false,
      "message": "User not found"
    })
    return
  }
  

  const getData = async (access_token) => {
    try {
      const profileRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      const devicesRes = await axios.get("https://api.spotify.com/v1/me/player/devices", {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      return { profileRes, devicesRes }

    } catch (e) {
      throw new Error(e.message)
    }
  }

  try {
    const { profileRes, devicesRes } = await getData(user.access_token)

    res.send({
      "ok": true,
      "playing": profileRes.data,
      "devices": devicesRes.data.devices
    })
  } catch (e) {
    
    try {
      const newToken = await refreshLogin(user.refresh_token, user.spotifyId)
      const { profileRes, devicesRes } = await getData(newToken.access_token)
  
      res.send({
        "ok": true,
        "playing": profileRes.data,
        "devices": devicesRes.data.devices
      })
    } catch (err) {
      console.log(err.message)
      req.session.destroy()
      res.send({
        "ok": false,
        "message": err.message
      })
    }


  }


})

app.get('/api/profile', authMiddleware, async (req, res) => {

  const user = await getAccount(req.session.user.spotifyId)

  try {
    const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${user.access_token}`
      }
    })
    res.send({
      "ok": true,
      "user": result.data
    })
  } catch (e) {
    console.log("Token Refreshed for " + user.name)
    const newToken = await refreshLogin(user.refresh_token, user.spotifyId)

    const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${newToken.access_token}`
      }
    })

    res.send({
      "ok": true,
      "user": result.data
    })
  }

})

app.get('/api/currentFollow', authMiddleware, async (req, res) => {

  const user = await getFollowing(req.session.user.spotifyId)

  if (!user || !user.following) {
    res.send({
      "ok": false,
      "message": "User not found"
    })
    return
  }

  const userObj = []
  const followerObj = []

  for (let followedUser in user.following) {
    const account = await getAccountById(user.following[followedUser].followingId)
    userObj.push(account)
  }

  for (let followedUser in user.followers) {
    const account = await getAccountById(user.followers[followedUser].followerId)
    followerObj.push({ name: account.name, imageUrl: account.imageUrl, spotifyId: account.spotifyId})
  }

  let playingStates = userObj.map(async (user) => {
    const getData = async (access_token) => {
      try {
        const profileRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })

  
        return profileRes
  
      } catch (e) {
        throw new Error(e.message)
      }
    }

    const userInfo = { name: user.name, imageUrl: user.imageUrl, spotifyId: user.spotifyId}

    try {
      const profileRes = await getData(user.access_token)
      
      return {
        "ok": true,
        "userInfo": userInfo,
        "playing": profileRes.data,
      }
    } catch (e) {
      
      try {
        const newToken = await refreshLogin(user.refresh_token, user.spotifyId)
        const profileRes = await getData(newToken.access_token)
    
        return {
          "ok": true,
          "userInfo": userInfo,
          "playing": profileRes.data,
        }
      } catch (err) {
        return {
          "ok": false,
          "userInfo": userInfo,
          "message": err.message
        }
      }
  
    }
  })

  playingStates = await Promise.all(playingStates)

  res.send({
    "ok": true,
    "following": playingStates,
    "followers": followerObj
  })

})


app.get('/api/logout', authMiddleware, async (req, res) => {

  req.session.destroy()

  res.send({
    "ok": true,
    "message": "Logged out"
  })

})
app.get('/api/allUsers', async (req, res) => {
  const users = await prisma.user.findMany()

  res.send(users.map((user) => { return { "name": user.name, "imageUrl": user.imageUrl, "spotifyId": user.spotifyId} } ))
})

app.get("/api/sendFollow", authMiddleware, async (req, res) => {

  const { toId } = req.query
  if (!toId) {
    res.status(400).send({
      "ok": false,
      "message": "Missing fields"
    })
  }

  if (toId == req.session.user.spotifyId) {
    res.send({
      "ok": false,
      "message": "Can't follow yourself"
    })
    return
  }

  const followingUser = await getFollowing(req.session.user.spotifyId)

  if (!followingUser) {
    res.send({
      "ok": false,
      "message": "User not found"
    })
    return
  }

  try {
    await sendFollow(followingUser.spotifyId, toId)
  } catch(e) {
    res.send({
      "ok": false,
      "message": e.message
    })
  } 

})

app.get("/api/findMatch", authMiddleware, async (req, res) => {
  const currentUser = await getAccount(req.session.user.spotifyId)

  if (!currentUser) {
    res.send({
      "ok": false,
      "message": "User not found"
    })
    return
  }

  const allUsers = await prisma.user.findMany();

  let userScores = allUsers.filter((user) => user.spotifyId != currentUser.spotifyId).map(async (user) => {
    if (user.spotifyId == currentUser.spotifyId) return 0;
      
    const score = await scoring(currentUser, user)
    return {
      "user": { spotifyId: user.spotifyId, displayName: user.name, imageUrl: user.imageUrl },
      "score": score
    }
  })

  userScores = await Promise.all(userScores)
  userScores.sort((a, b) => a.score - b.score)

  res.send({
    "ok": true,
    "matches": userScores
  })

})

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});