'use strict'
console.log('Sync-play Chrome Extension Script added :)');

// Variables and constants:

const PEER_SERVER_HOST = 'agm-dev-peerjs-server.herokuapp.com'
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

const createPeer = (id, action) => {
  if (id && action && action === 'create') {
    peer = new Peer(id, { host: PEER_SERVER_HOST, secure: true, port: 443, key: 'peerjs' })
    peer.on('open', peerId => console.log(`Open peer with id: ${peerId}`))
    peer.on('error', err => console.log('Peer error: '+ JSON.stringify(err)))
    peer.on('connection', configConnection)
  } else if (id && action && action === 'connect') {
    peer = new Peer({ host: PEER_SERVER_HOST, secure: true, port: 443, key: 'peerjs' })
    let conn = peer.connect(id)
    configConnection(conn)
  }
}

const configConnection = conn => {
  conn.on('open', function() {
    console.log('open connection')
    saveState({ connected: true })
    conn.on('data', data => {
      console.log('Received data from peer:'+ JSON.stringify(data))
      if (data && data.state && data.state === 'play' && video && video.paused) { // Then play our video!
        console.log('resume the video!')
        video.play()
      } else if (data && data.state && data.state === 'pause' && video && video.paused === false) {
        console.log('pause the video!')
        video.pause()
      }
    })
  })
  connections.push(conn)
}

const sendSignal = signal => connections.map(conn => {
  console.log(`sending signal: ${signal}`)
  conn.send({ state: signal })
})

const setVideoListeners = v => {
  v.addEventListener('pause', function() {
    if (peer && connections.length) {
      sendSignal('pause')
    }
  }, false)

  v.addEventListener('play', function() {
    if (peer && connections.length) {
      sendSignal('play')
    }
  }, false)
}


// Listeners:

let interval = setInterval(() => {
  if (video) {
    setVideoListeners(video)
    clearInterval(interval)
    console.log('success on setVideoListeners')
  } else {
    video = document.querySelector('#player-container video')
  }
}, 200)

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    if (state[key] !== changes[key].newValue) {
      console.log(`Chrome Storage key ${key} in namespace ${namespace} has changed from ${changes[key].oldValue} to ${changes[key].newValue}`)
      if (key === 'action' && changes[key].newValue === 'connect') {
        chrome.storage.local.get('id', function(items) {
          if (chrome.runtime.lastError) return console.log('Error on get id: '+ JSON.stringify(chrome.runtime.lastError))
          createPeer(items.id, 'connect')
        })
      } else if (key === 'action' && changes[key].newValue === 'create') {
        chrome.storage.local.get('id', function(items) {
          if (chrome.runtime.lastError) return console.log('Error on get id: '+ JSON.stringify(chrome.runtime.lastError))
          createPeer(items.id, 'create')
        })
      } else if (key === 'action' && changes[key].newValue === 'disconnect') {
        removePeer()
        saveState({ connected: false })
      }
    }
  }
})
