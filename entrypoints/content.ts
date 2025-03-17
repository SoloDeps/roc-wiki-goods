export default defineContentScript({
  matches: ['*://*.google.com/*'],
  // '*://*.riseofcultures.wiki.gg/*'
  main() {
    console.log('Hello content.');
  },
});
