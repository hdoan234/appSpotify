import express from 'express';
import cors from 'cors';

import bodyParser from 'body-parser'

import { redirectToAuth } from "./src/spotifyAPI.js"

const app = express();

app.use(cors());

app.use(bodyParser.json())

app.post('/', (req, res) => {
  const data = req.body
  console.log(data)
  if (data["username"] == 'hung' && data['password'] == "123") res.send('Login succesful')

  res.send('Login Failed');
});

app.get('/getAuth', async (req, res) => {
  
  res.send(await redirectToAuth())
})

app.get("/callback", async (req, res) => {
  
  console.log(req.query)

  res.redirect("http://localhost:8100/?code=" + req.query["code"])
})

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});