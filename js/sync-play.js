console.log('Sync-play Chrome Extension Script added :)');

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
      if (key === 'action' && changes[key].newValue === 'connect') {
        saveState({ connected: false })
        saveState({ connected: true })
      }
    }
  }
})

const video = document.querySelector('#player-container video')
if (video) {
  video.addEventListener('pause', function() {
    // TODO: send state by peer
  }, false)
}
