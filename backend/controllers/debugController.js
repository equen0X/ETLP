const fs = require('fs');

exports.saKeyInfo = (req, res) => {
  const keyB64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64;
  const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyB64 && !keyRaw) {
    return res.status(200).json({ present: false, message: 'No SA key in env' });
  }

  try {
    const keyJson = keyRaw || Buffer.from(keyB64, 'base64').toString('utf8');
    const key = typeof keyJson === 'string' ? JSON.parse(keyJson) : keyJson;
    return res.status(200).json({ present: true, client_email: key.client_email || null, has_private_key: !!key.private_key });
  } catch (e) {
    return res.status(200).json({ present: true, parsed: false, error: e.message });
  }
};
