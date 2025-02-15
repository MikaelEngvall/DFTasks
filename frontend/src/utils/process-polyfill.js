if (typeof process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV
    }
  };
} 