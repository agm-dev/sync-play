'use strict';

console.log('Init sync-play.js');

const generateCode = () => uuidv1();

document.addEventListener('DOMContentLoaded', function() {

  console.log('Content loaded');
  const generateCodeBtn = document.querySelector('#generate-code');
  const code = document.querySelector('#code');

  // Load code if there is one saved:
  if (typeof window.localStorage !== 'undefined' && typeof localStorage.getItem('sync-play-code') === 'string') {
     code.value = localStorage.getItem('sync-play-code');
     console.log('Loaded code from local storage');
  }

  // Generate code button:
  generateCodeBtn.addEventListener('click', function() {
    console.log('CLICK: Generate Code Button');
    code.value = generateCode();
    if (typeof window.localStorage !== 'undefined') {
       localStorage.setItem('sync-play-code', code.value);
       console.log('Saved code on local storage');
    }
    code.select();
  }, false);

}, true);