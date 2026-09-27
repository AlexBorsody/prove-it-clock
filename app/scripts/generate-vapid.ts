/**
 * Generate a VAPID key pair for Web Push.
 * Usage: node --import tsx scripts/generate-vapid.ts
 * Put the output in the server environment (NOT in the repo):
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
 * The public key also goes to NEXT_PUBLIC_VAPID_PUBLIC_KEY (client-safe).
 */
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:you@example.com  # change to a real contact');
console.log('');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey + '  # client-safe, same value');
