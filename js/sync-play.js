'use strict'
console.log('Sync-play Chrome Extension Script added :)');

// Variables and constants:

const PEER_API_KEY = 'ylmnk6r4bdibe29'
let state = {}
let peer
let connections = []
let video = document.querySelector('#player-container video')


// Functions:

const saveState = newState => {
  state = newState
  chrome.storage.local.set(newState, function() {
    if (chrome.runtime.lastError) return console.log('Error on set: '+ JSON.stringify(chrome.runtime.lastError))
    return console.log('Set chrome storage OK')
  })
}

const removePeer = () => {
  peer = null
  connections = []
}

const createPeer = id => {
  if (id) {
    peer = new Peer(id, { key: PEER_API_KEY })
  } else {
    peer = new Peer({ key: PEER_API_KEY })
  }

  peer.on('open', peerId => console.log(`Open peer with id: ${peerId}`))
  peer.on('error', err => console.log('Peer error: '+ JSON.stringify(err)))
  peer.on('connection', configConnection)
}

const configConnection = conn => {
  conn.on('data', data => {
    console.log('Received data from peer:'+ JSON.stringify(data))
    if (data && data.state && data.state === 'play' && video && video.paused) { // Then play our video!
      video.play()
    } else if (data && data.state && data.state === 'pause' && video && video.paused === false) {
      video.pause()
    }
  })
  connections.push(conn)
}

const sendSignal = signal => connections.map(conn => conn.send({ state: signal }))


// Listeners:

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (state[key] !== changes[key].newValue) {
      console.log(`Chrome Storage key ${key} in namespace ${namespace} has changed from ${changes[key].oldValue} to ${changes[key].newValue}`)
      if (key === 'action' && changes[key].newValue === 'connect') {
        chrome.storage.local.get('id', function(items) {
          if (chrome.runtime.lastError) return console.log('Error on get id: '+ JSON.stringify(chrome.runtime.lastError))
          createPeer(items.id)
          saveState({ connected: true })
        })
      } else if (key === 'action' && changes[key].newValue === 'disconnect') {
        removePeer()
        saveState({ connected: false })
      }
    }
  }
})

if (video) {
  video.addEventListener('pause', function() {
    if (peer && connections.length) {
      console.log('Sending pause signal...')
      sendSignal('pause')
    }
  }, false)

  video.addEventListener('play', function() {
    if (peer && connections.length) {
      console.log('Sending play signal...')
      sendSignal('play')
    }
  }, false)
}
