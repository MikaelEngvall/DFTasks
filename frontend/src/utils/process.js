if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}

export default global.process; 