'use strict';

const User = require.main.require('./src/user');
const db = require.main.require('./src/database');

const Library = {};

Library.activateAnon = async function (req, res) {
  if (!req.uid) {
    return res.status(403).json({ error: 'User not logged in' });
  }

  try {
    const uid = req.uid;
    const anonExists = await db.getObjectField(`user:${uid}`, 'anon:uid');
    if (anonExists) {
      return res.json({ message: 'Anonymous identity already exists.' });
    }

    const anonUsername = `anon-${uid}-${Date.now()}`;
    const anonUid = await User.create({
      username: anonUsername,
      email: `anon-${uid}@example.com`,
      password: require('crypto').randomBytes(16).toString('hex'),
    });

    await db.setObjectField(`user:${uid}`, 'anon:uid', anonUid);
    await db.setObjectField(`user:${anonUid}`, 'anon:mainUid', uid);

    res.json({ message: `Anonymous user created: ${anonUsername}` });
  } catch (err) {
    console.error('[anon-linked-user] Activation error:', err);
    res.status(500).json({ error: 'Failed to create anonymous identity' });
  }
};

module.exports = Library;
