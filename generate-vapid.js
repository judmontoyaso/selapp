const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('========================================');
console.log('NUEVAS CLAVES VAPID PARA VERCEL');
console.log('========================================');
console.log('');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
console.log(keys.publicKey);
console.log('');
console.log('VAPID_PRIVATE_KEY');
console.log(keys.privateKey);
console.log('');
console.log('========================================');
console.log('COPIA ESTAS CLAVES A VERCEL:');
console.log('Settings → Environment Variables');
console.log('Reemplaza las claves existentes');
console.log('========================================');
