const processPolyfill = {
  env: {
    NODE_ENV: 'development',
    REACT_APP_API_URL: '/api'
  },
  nextTick: function(fn) {
    setTimeout(fn, 0);
  },
  browser: true,
  version: '',
  platform: 'browser'
};

if (typeof window !== 'undefined') {
  window.process = processPolyfill;
}

if (typeof global !== 'undefined') {
  global.process = processPolyfill;
}

module.exports = processPolyfill; 