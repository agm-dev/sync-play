'use strict';

console.log('Init sync-play.js');

const generateCode = () => uuidv1();

const stateConnected = () => {
  const state = document.querySelector('#state');
  state.classList.remove('disconnected');
  state.classList.add('connected');
  state.innerHTML = 'Connected';
}

const stateDisconnected = () => {
  const state = document.querySelector('#state');
  state.classList.remove('connected');
  state.classList.add('disconnected');
  state.innerHTML = 'Disconnected';
}

document.addEventListener('DOMContentLoaded', function() {

  console.log('Content loaded');
  const generateCodeBtn = document.querySelector('#generate-code');
  const useCodeBtn = document.querySelector('#use-code');
  const code = document.querySelector('#code');

  // Load code if there is one saved:
  if (typeof window.localStorage !== 'undefined' && typeof localStorage.getItem('sync-play-code') === 'string') {
     code.value = localStorage.getItem('sync-play-code');
     console.log('Loaded code from local storage');
  }

  // Generate code button:
  generateCodeBtn.addEventListener('click', function() {
    console.log('CLICK: Generate Code Button');
    stateDisconnected();
    code.value = generateCode();
    if (typeof window.localStorage !== 'undefined') {
       localStorage.setItem('sync-play-code', code.value);
       console.log('Saved code on local storage');
    }
    code.select();
    const peer = new Peer(code.value, { key: 'ylmnk6r4bdibe29' });
    console.log(`Configuring new peer: ${code.value}`);
    peer.on('connection', conn => {
      console.log(`Someone has connected to our peer: ${conn}`);
      conn.on('data', data => {
        console.log(`Received data: ${data}`);
      });
      conn.send('Welcome to our connection, dude!');
    });
    peer.on('open', id => {
      console.log(`Open peer connection with ID: ${id}`);
      stateConnected();
    });
  }, false);

  // Use code button:
  useCodeBtn.addEventListener('click', function() {
    console.log('CLICK: Use Code Button');
    stateDisconnected();
    const peerId = code.value || '';
    if (code.value.length <= 0) return console.log('ERROR: Generate a code before click on use code button');
    const peer = new Peer({ key: 'ylmnk6r4bdibe29' });
    const conn = peer.connect(code.value);
    conn.on('open', () => {
      console.log(`Connected to peer with ID: ${code.value}`);
      stateConnected();
      conn.on('data', data => {
        console.log(`Received data: ${data}`);
      });
      conn.send('Hi, i am the new guy!');
    });
  }, false);

}, true);