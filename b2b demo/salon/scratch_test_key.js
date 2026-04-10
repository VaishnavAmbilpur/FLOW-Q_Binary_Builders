const idBase64 = "NjljZmJiOGU3ODQ0NTgyYjZmOTQ5YmZh";
const keyId = Buffer.from(idBase64, 'base64').toString('utf8');
console.log("ID:", keyId);
console.log("Length:", keyId.length);
