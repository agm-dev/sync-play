'use strict';

console.log('Init sync-play.js');

// Storage stuff (state, save, events)
let state = {}

const saveState = newState => {
  state = newState
  chrome.storage.local.set(newState, function() {
    if (chrome.runtime.lastError) return console.log('Error on set: '+ JSON.stringify(chrome.runtime.lastError))
    return console.log('Set chrome storage OK')
  })
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (state[key] !== changes[key].newValue) {
      console.log(`Chrome Storage key ${key} in namespace ${namespace} has changed from ${changes[key].oldValue} to ${changes[key].newValue}`)
      if (key === 'connected') handleConection(changes[key].newValue) // updates connection status
    }
  }
})

// General functions:
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

const handleConection = connected => {
  if (connected) {
    stateConnected()
  } else {
    stateDisconnected()
  }
}

document.addEventListener('DOMContentLoaded', function() {

  console.log('Content loaded');
  const generateCodeBtn = document.querySelector('#generate-code');
  const useCodeBtn = document.querySelector('#use-code');
  const code = document.querySelector('#code');

  // Generate code button:
  generateCodeBtn.addEventListener('click', function() {
    console.log('CLICK: Generate Code Button');
    code.value = generateCode();
    saveState({ id: code.value });
    code.select();
  }, false);

  // Use code button:
  useCodeBtn.addEventListener('click', function() {
    console.log('CLICK: Use Code Button');
    saveState({ action: 'disconnect' })
    saveState({ id: code.value, action: 'connect' })
  }, false);

}, false);
