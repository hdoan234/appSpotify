import express from 'express';
import cors from 'cors';

import axios from 'axios';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import { redirectToAuth, getAccessToken } from "./src/spotifyAPI.js"
import { createAccount, getAccount } from './src/database.js';

import { Server } from 'socket.io';
import { createServer } from 'http';


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

app.post('/', (req, res) => {
  const data = req.body
  console.log(data)
  if (data["username"] == 'hung' && data['password'] == "123") res.send('Login succesful')

  res.send('Login Failed');
});

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

app.get("/callback", async (req, res) => {
  
  const verifier = req.cookies.verifier
  const code = req.query.code

  const { access_token } = await getAccessToken(verifier, code)

  res.cookie('spot_access_token', access_token, { 
    httpOnly: true,
  })

  const result = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
  })

  const account = getAccount(result.data.id)
  if (!account) createAccount(result.data.email, result.data.id, result.data.display_name)

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
      "data": result.data
    })
  } catch (e) {
    res.send({
      "ok": true,
      "message": JSON.stringify(e),
    })
    return
  }

})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});