require('dotenv').config()
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: process.env.ASSEMBLYAI_API_KEY,
    "content-type": "application/json",
  },
});

app.post('/audioURL', async (req, res) => {
  const path = req.body.audioPath;
  
  fs.readFile(path, async (err, file) => {
    if (err) {
      return console.log(err);
    }

    assembly.post('/upload', file, {
      headers: { "transfer-encoding": "chunked" }
    })
    .then(response => {
      const { data } = response;
      res.json(data); // data.upload_url
      console.log('Audio file uploaded successfully\n');
    })
    .catch(error => {
      const {response: {status, data}} = error;
      res.status(status).json(data);
      console.log('Error Occured: ' + data.error + '\n')
    });
  });
});

app.post('/audioID', async (req, res) => {
  const data = {
    "audio_url": req.body.audioUrl,
    "auto_chapters": true,
  };

  assembly.post('/transcript', data)
  .then(response => {
    const { data } = response;
    res.json(data); // data.id
    console.log('File ID fetched successfully\n');
  })
  .catch(error => {
    const {response: {status, data}} = error;
    res.status(status).json(data);
    console.log('Error Occured: ' + data.error + '\n')
  });
});

app.get('/transcript', async (req, res) => {
  const id = req.query.audioId;
  
  assembly.get(`/transcript/${id}`)
  .then(response => {
    const { data } = response;
    res.json(data); // data.text
    console.log('Transcripting fetched successfully\n');
  })
  .catch(error => {
    const {response: {status, data}} = error;
    res.status(status).json(data);
    console.log('Error Occured: ' + data.error + '\n')
  });
});

app.set('port', 8000);
const server = app.listen(app.get('port'), () => {
  console.log(`Server is running on port ${server.address().port}`);
});
