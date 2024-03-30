import express from 'express';
import cors from 'cors';

import bodyParser from 'body-parser'

const app = express();

app.use(cors());

app.use(bodyParser.json())

app.post('/', (req, res) => {
  const data = req.body
  console.log(data)
  if (data["username"] == 'hung' && data['password'] == "123") res.send('Login succesful')

  res.send('Login Failed');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});