const inputFileEl = document.getElementById('file_upload');
const messageEl = document.getElementById('message');
const statusEl = document.getElementById('status-message');
const transcriptButtonEl = document.getElementById('buttonGetTranscript');
const summarizeButtonEl = document.getElementById('buttonSummarize');
const summaryBoxEl = document.getElementById('summary-box');

const url = 'http://localhost:8000';

let audioURL = '';
let audioURLId = '';
let transcriptRslt = null;
let summaryChapters = null;
let newUpload = false;

statusEl.style.visibility = 'hidden';
messageEl.style.display = 'none';
transcriptButtonEl.disabled = true;
summarizeButtonEl.style.display = 'none';

function getText(data) {
  switch (data.status) {
    case 'queued':
    case 'processing':
      return 'AssemblyAI is still transcripting your audio, please try again in a few minutes!';
    case 'completed':
      return data.text;
    default:
      return `Something went wrong :-( : ${data.status}`;
  }
}

function statusMessage(text, color) {
  statusEl.innerText = text;
  statusEl.style.visibility = 'visible';
  statusEl.style.color = color;
  setTimeout(()=>statusEl.style.visibility = 'hidden', 1500);
}

async function uploadAudio() {
  if (inputFileEl.value.length == 0) {
    return;
  }
  const audioName = inputFileEl.value.split('\\').pop();
  const audioPath = './test_file/' + audioName;

  const response = await fetch(`${url}/audioURL`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioPath: audioPath })
  });
  const data = await response.json();
  
  audioURL = data.upload_url;
}

async function getAudioID() {
  if (audioURL === undefined || audioURL.length == 0) {
    statusMessage('No Audio/Video File Uploaded!', 'crimson');
    return;
  }

  const response = await fetch(`${url}/audioID`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ audioUrl: audioURL })
  });
  const data = await response.json();
  
  audioURLId = data.id;
}

async function upload() {
  await uploadAudio();
  await getAudioID();
  
  statusMessage('Uploaded! Now Transcripting!', 'green');
  transcriptButtonEl.disabled = false;
  summarizeButtonEl.style.display = 'none';
  summarizeButtonEl.disabled = false;
  summaryBoxEl.innerHTML = '';
  messageEl.style.display = 'none';
  newUpload = true;
}

async function getTranscriptText() {
  const response = await fetch(`${url}/transcript?audioId=${audioURLId}`);
  const data = await response.json();

  messageEl.innerText = getText(data);
  messageEl.style.display = '';
  
  if (data.status == 'completed') {
    transcriptRslt = data;
    summaryChapters = data.chapters;
    statusMessage('Transcripted!', 'green');
    transcriptButtonEl.disabled = true;
    summarizeButtonEl.style.display = '';
  }
}

function getSummary() {
  Array.from(summaryChapters).map((chapter, idx) => {
    const title = document.createElement('h1');
    title.innerHTML = `Summary ${idx+1}`;

    const paragraph = document.createElement('p');
    paragraph.classList.add('real-time-interface__message', 'summary');
    paragraph.innerText = chapter.summary;
    
    const sentence = document.createElement('p');
    sentence.classList.add('real-time-interface__message', 'summary');
    sentence.innerText = chapter.headline;
    
    const short = document.createElement('p');
    short.classList.add('real-time-interface__message', 'summary');
    short.innerText = chapter.gist;
    
    const node = document.createElement('div');
    node.classList.add('summary-chapter');
    
    node.appendChild(title);
    node.appendChild(paragraph);
    node.appendChild(sentence);
    node.appendChild(short);

    summaryBoxEl.appendChild(node);
  });

  summarizeButtonEl.disabled = true;
}