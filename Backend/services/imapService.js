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

const extractThreadId = (subject = '') => {
  const match = subject.match(/\[PM-ID:([0-9a-fA-F]{24})\]/);
  return match ? match[1] : null;
};

const normalizeSubject = (subject = '') => {
  return subject
    .replace(/\[PM-ID:[0-9a-fA-F]{24}\]/gi, '')
    .replace(/^(re[\s\u00A0]*[:\-–—\s]*)+/i, '')
    .trim()
    .toLowerCase();
};

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

        imap.search(['UNSEEN'], (err, results) => {
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
          const fetcher = imap.fetch(recentResults, { bodies: '', struct: true });
          let processed = 0;
          fetcher.on('message', (msg, seqno) => {
            let uid = null;
            msg.on('attributes', (attrs) => {
              uid = attrs.uid;
            });
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

                // try to extract thread id from subject, inReplyTo or references
                let threadId = extractThreadId(subject);
                if (!threadId && parsed.inReplyTo) {
                  threadId = extractThreadId(parsed.inReplyTo);
                }
                if (!threadId && parsed.references) {
                  const refs = Array.isArray(parsed.references) ? parsed.references.join(' ') : String(parsed.references);
                  threadId = extractThreadId(refs);
                }
                let originalMessage = null;
                if (threadId) {
                  originalMessage = await Message.findById(threadId);
                  if (originalMessage) console.log(`IMAP: trouvé par PM-ID -> ${originalMessage._id}`);
                }
                if (!originalMessage) {
                  const normalized = normalizeSubject(subject);
                  originalMessage = await Message.findOne({
                    email: senderEmail,
                    $or: [
                      { normalizedSubject: normalized },
                      { subject: { $regex: `^${normalized.replace(/[.*+?^${}()|[\\]\\]/g, '\\\$&')}$`, $options: 'i' } },
                    ],
                  });
                  if (originalMessage) console.log(`IMAP: trouvé par sujet normalisé -> ${originalMessage._id}`);
                }

                if (!originalMessage) {
                  console.log(`IMAP: aucun message d'origine pour ${senderEmail} / sujet ${subject}`);
                } else {
                  const replyExists = originalMessage.replies?.some(
                    (r) => r.text === text
                  );

                  if (!replyExists) {
                    originalMessage.replies.push({
                      text,
                      sentAt: parsed.date || new Date(),
                    });
                    originalMessage.read = true;
                    await originalMessage.save();
                    console.log(`✅ Réponse sync: ${senderEmail} - ${subject}`);
                  }
                }

                // marque le message comme lu pour éviter retraitements
                if (uid) {
                  imap.addFlags(uid, '\\Seen', (err) => {
                    if (err) console.error('Erreur addFlags:', err);
                  });
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
