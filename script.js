console.log('Sync-play Chrome Extension Script added :)');
const syncVideo = document.querySelector('#player-container video');
if (syncVideo) {
  syncVideo.addEventListener('play', function() {
    console.log('Sync-play: Video state play');
    // TODO: communicate with peer to send play status
  }, false);
  syncVideo.addEventListener('pause', function() {
    console.log('Sync-play: Video state pause');
    // TODO: communicate with peer to send pause status
  }, false);
}