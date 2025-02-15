import { startEmailListener } from './utils/emailListener.js';

// ... övrig serverkod ...

try {
  // Starta email-lyssnaren
  const stopEmailListener = startEmailListener();
  
  // Hantera graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing email listener...');
    stopEmailListener();
  });
  
  console.log('Email listener started successfully');
} catch (error) {
  console.error('Failed to start email listener:', error);
} 