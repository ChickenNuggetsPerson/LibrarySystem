

const crypto = require('crypto');

function encrypt(text, password) {
    const salt = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return salt.toString('hex') + iv.toString('hex') + encrypted + authTag;
}

function decrypt(encryptedText, password) {
    const salt = Buffer.from(encryptedText.slice(0, 32), 'hex');
    const iv = Buffer.from(encryptedText.slice(32, 64), 'hex');
    const encrypted = encryptedText.slice(64, -32);
    const authTag = Buffer.from(encryptedText.slice(-32), 'hex');
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

console.log(decrypt(encrypt("YEET", "test"), "test"))