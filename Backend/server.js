import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startImapSync } from './services/imapService.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    // Démarre la synchronisation IMAP uniquement si la base est joignable
    if (process.env.IMAP_USER && process.env.IMAP_PASS) {
      startImapSync();
    }

    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
  } catch (error) {
    console.error('Impossible de démarrer le backend:', error.message);
    process.exit(1);
  }
};

startServer();