import express from 'express';
import cors from 'cors';

import axios from 'axios';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import { redirectToAuth, getAccessToken, getAccessTokenWithRefreshToken } from "./src/spotifyAPI.js"
import { createAccountWithSpotify, getAccount, getFollowing, getAccountById, sendFollow } from './src/database.js';

import { Server } from 'socket.io';
import { createServer, get } from 'http';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';

const app = express();

app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json())

app.use(
  session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false,
  })
)

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
  
  socket.on('join', (data) => {
    console.log(data)
  })

})

httpServer.listen(3001, () => {
  console.log('Websocket is running on port 3001');
})

const prisma = new PrismaClient()

const isAuthenticated = (req) => {
  return Boolean(req.session.user)
}

const authMiddleware = (req, res, next) => {
  if (isAuthenticated(req)) {
    // User is authenticated, proceed to the next middleware or route handler
    next()
  } else {
    // User is not authenticated, respond with an error
    res.status(401).json({ error: 'Unauthorized' })
  }
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

  const { verifier, spotURL } = await redirectToAuth()

  res.cookie('verifier', verifier, { httpOnly: true })

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
  
  const verifier = req.cookies.verifier
  const code = req.query.code

  const tokenObj = await getAccessToken(verifier, code)


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
  
  if (!account) await createAccountWithSpotify(result.data.email, result.data.id, result.data.display_name, refresh_token, access_token, result.data.images[1].url)
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

  res.redirect("http://localhost:8100/")

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
    followerObj.push(account)
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

    try {
      const profileRes = await getData(user.access_token)
  
      return {
        "ok": true,
        "userInfo": user,
        "playing": profileRes.data,
      }
    } catch (e) {
      
      try {
        const newToken = await refreshLogin(user.refresh_token, user.spotifyId)
        const profileRes = await getData(newToken.access_token)
    
        return {
          "ok": true,
          "userInfo": user,
          "playing": profileRes.data,
        }
      } catch (err) {
        return {
          "ok": false,
          "userInfo": user,
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


app.get('/api/logout', async (req, res) => {})
app.get('/api/allUsers', async (req, res) => {
  const users = await prisma.user.findMany()

  res.send(users)
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});