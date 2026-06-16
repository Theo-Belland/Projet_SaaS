import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Message from '../models/Message.js';

const buildImapConfig = () => ({
  user: process.env.IMAP_USER,
  password: process.env.IMAP_PASS,
  host: process.env.IMAP_HOST,
  port: Number(process.env.IMAP_PORT) || 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

const parseMessageBody = (msg) =>
  new Promise((resolve, reject) => {
    let buffer = '';
    msg.on('body', (stream) => {
      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });
    });
    msg.once('end', () => resolve(buffer));
    msg.once('error', reject);
  });

export const syncEmails = async () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(buildImapConfig());

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => {
        if (err) {
          console.error('Erreur IMAP openBox:', err);
          imap.end();
          return reject(err);
        }

        imap.search(['ALL'], (err, results) => {
          if (err) {
            console.error('Erreur IMAP search:', err);
            imap.end();
            return reject(err);
          }

          if (!results || results.length === 0) {
            console.log('IMAP: aucune réponse trouvée');
            imap.end();
            return resolve();
          }

          const recentResults = results.slice(-50);
          console.log(`IMAP: ${results.length} email(s) trouvés, lecture des ${recentResults.length} derniers`);
          const fetcher = imap.fetch(recentResults, { bodies: '' });
          let processed = 0;

          fetcher.on('message', (msg) => {
            parseMessageBody(msg)
              .then((raw) => simpleParser(raw))
              .then(async (parsed) => {
                const senderEmail = parsed.from?.value?.[0]?.address;
                const subject = parsed.subject || '';
                const text = parsed.text || '';

                if (!senderEmail) {
                  console.log('IMAP: expéditeur introuvable');
                  return;
                }

                console.log(`IMAP: email de ${senderEmail}, sujet: ${subject}`);

                const originalMessage = await Message.findOne({
                  email: senderEmail,
                });

                if (!originalMessage) {
                  console.log(`IMAP: aucun message d'origine pour ${senderEmail}`);
                  return;
                }

                const replyExists = originalMessage.replies?.some(
                  (r) => r.text === text
                );

                if (!replyExists) {
                  originalMessage.replies.push({
                    text,
                    sentAt: parsed.date || new Date(),
                  });                  originalMessage.read = true;                  await originalMessage.save();
                  console.log(`✅ Réponse sync: ${senderEmail} - ${subject}`);
                }
              })
              .catch((error) => {
                console.error('Erreur parsing email:', error);
              })
              .finally(() => {
                processed += 1;
                if (processed === results.length) {
                  imap.end();
                  resolve();
                }
              });
          });

          fetcher.once('error', (err) => {
            console.error('Erreur fetch IMAP:', err);
            imap.end();
            reject(err);
          });

          fetcher.once('end', () => {
            if (processed === 0) {
              imap.end();
              resolve();
            }
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('Connexion IMAP erreur:', err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('Connexion IMAP fermée');
    });

    imap.connect();
  });
};

export const startImapSync = () => {
  console.log('🔄 IMAP Sync démarré (toutes les 5 min)');

  syncEmails().catch((err) =>
    console.error('Sync initial erreur:', err)
  );

  setInterval(() => {
    syncEmails().catch((err) =>
      console.error('Sync périodique erreur:', err)
    );
  }, 5 * 60 * 1000);
};
