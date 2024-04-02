import express from 'express';
import cors from 'cors';

import axios from 'axios';

import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';

import { redirectToAuth, getAccessToken } from "./src/spotifyAPI.js"

const app = express();

app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true,
}));

app.use(cookieParser());
app.use(bodyParser.json())

app.post('/', (req, res) => {
  const data = req.body
  console.log(data)
  if (data["username"] == 'hung' && data['password'] == "123") res.send('Login succesful')

  res.send('Login Failed');
});

app.get('/api/getAuth', async (req, res) => {
  
  if (req.cookies.access_token) {
    res.send({
      "message": "Already logged in",
    })
    return
  }

  const auth = await redirectToAuth()

  res.cookie('verifier', auth.verifier, { httpOnly: true, maxAge: 1000 * 60 * 15 })

  res.send(auth)
})

app.get("/callback", async (req, res) => {
  
  const verifier = req.cookies.verifier
  const code = req.query.code

  const { access_token } = await getAccessToken(verifier, code)

  res.cookie('spot_access_token', access_token, { 
    httpOnly: true,
    maxAge: 1000 * 60 * 60
  })
  res.redirect("http://localhost:8100/")
})

app.get('/api/profile', async (req, res) => {
  if (!req.cookies.spot_access_token) {
    res.send({
      "ok": false,
      "message": "Not logged in",
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