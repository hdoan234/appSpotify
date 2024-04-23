import express from 'express';
import cors from 'cors';

import axios from 'axios';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import { redirectToAuth, getAccessToken, getAccessTokenWithRefreshToken } from "./src/spotifyAPI.js"
import { createAccountWithSpotify, getAccount, getFollowing, getAccountById, sendFollow } from './src/database.js';

import { Server } from 'socket.io';
import { createServer, get } from 'http';

import { PrismaClient } from '@prisma/client';

const app = express();

app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json())

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8100",
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on('connection', (socket) => {
  socket.emit("greet", "Hello from server")
})

httpServer.listen(3001, () => {
  console.log('Websocket is running on port 3001');
})

const isAuthenticated = (req) => {
  return Boolean(req.cookies.spot_access_token)
}

app.get('/api/getAuth', async (req, res) => {

  if (isAuthenticated(req)) {
    res.send({
      "ok": false,
      "message": "Already authenticated"
    })
    return
  }

  const { verifier, spotURL } = await redirectToAuth()

  res.cookie('verifier', verifier, { httpOnly: true, maxAge: 1000 * 60 * 60 })

  res.send({
    ok: true,
    spotURL: spotURL
  })
})

app.post('/api/credAuth', async (req, res) => {
  const { username, password, type } = req.body

  const prisma = new PrismaClient()

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

    const newToken = await getAccessTokenWithRefreshToken(account.refresh_token)

  
    res.cookie('spot_access_token', newToken.access_token, {
      httpOnly: true
    })
    res.cookie('spot_refresh_token', newToken.refresh_token, {
      httpOnly: true
    })
    res.cookie('spot_user_id', account.spotifyId, {
      httpOnly: true
    })

    await prisma.user.update({
      where: {
        email: username
      },
      data: {
        refresh_token: newToken.refresh_token
      }
    
    })

    res.send({
      "ok": true,
      "message": "Logged in"
    })


  }
})

app.get("/callback", async (req, res) => {
  
  const verifier = req.cookies.verifier
  const code = req.query.code

  const tokenObj = await getAccessToken(verifier, code)


  const access_token = tokenObj.access_token
  const refresh_token = tokenObj.refresh_token

  res.cookie('spot_access_token', access_token, { 
    httpOnly: true,
  })

  res.cookie('spot_refresh_token', refresh_token, {
    httpOnly: true
  })

  const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
  })

  const account = await getAccount(result.data.id)
  
  res.cookie('spot_user_id', result.data.id, {
    httpOnly: true
  })
  
  const prisma = new PrismaClient()

  if (!account) await createAccountWithSpotify(result.data.email, result.data.id, result.data.display_name, refresh_token)
  else {
    await prisma.user.update({
      where: {
        spotifyId: result.data.id
      },
      data: {
        refresh_token: refresh_token
      }
    })
  }

  res.redirect("http://localhost:8100/")

})

app.get('/api/playing', async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).send({
      "ok": false,
      "message": "Not authenticated"
    })
    return
  }

  const profileRes = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: {
      'Authorization': `Bearer ${req.cookies.spot_access_token}`
    }
  })

  const devicesRes = await axios.get("https://api.spotify.com/v1/me/player/devices", {
    headers: {
      'Authorization': `Bearer ${req.cookies.spot_access_token}`
    }
  })

  res.send({
    "ok": true,
    "playing": profileRes.data,
    "devices": devicesRes.data.devices
  })
})

app.get('/api/profile', async (req, res) => {

  if (!isAuthenticated(req)) {
    res.status(401).send({
      "ok": false,
      "message": "Not authenticated"
    })
    return
  }

  try {
    const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${req.cookies.spot_access_token}`
      }
    })
    res.send({
      "ok": true,
      "user": result.data
    })
  } catch (e) {
    res.send({
      "ok": true,
      "message": JSON.stringify(e),
    })
    return
  }

})

app.get('/api/currentFollow', async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).send({
      "ok": false,
      "message": "Not authenticated"
    })
    return
  }

  const user = await getFollowing(req.cookies.spot_user_id)

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
    followerObj.push(account)
  }

  res.send({
    "ok": true,
    "following": userObj,
    "followers": followerObj
  })

})

app.get("/api/sendFollow", async (req, res) => {
  if (!isAuthenticated(req)) {
    res.status(401).send({
      "ok": false,
      "message": "Not authenticated"
    })
    return
  }

  const { toId } = req.query

  const followingUser = await getFollowing(req.cookies.spot_user_id)

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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});