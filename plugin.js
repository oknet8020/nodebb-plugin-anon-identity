'use strict';

const db = require.main.require('./src/database');
const user = require.main.require('./src/user');

const plugin = {};

plugin.init = async function (params) {
  const { router, middleware } = params;

  router.get('/user/:userslug/anon-settings', middleware.buildHeader, async (req, res) => {
    console.log('[plugin-anon-identity] GET /user/:userslug/anon-settings accessed');
    const anonName = await db.getObjectField(`user:${req.uid}`, 'anon:name');
    const anonPic = await db.getObjectField(`user:${req.uid}`, 'anon:picture');

    res.locals.anonName = anonName || '';
res.locals.anonPic = anonPic || '';
res.render('anon-identity/anon-settings');

  });

  router.post('/api/user/anon-settings', async (req, res) => {
    const { anonName, anonPic } = req.body;
    if (!req.uid) return res.status(403).json({ error: 'Not logged in' });

    await db.setObjectField(`user:${req.uid}`, 'anon:name', anonName || '');
    await db.setObjectField(`user:${req.uid}`, 'anon:picture', anonPic || '');
    res.json({ status: 'saved' });
  });
};

plugin.filterPostGet = async function (hookData) {
  const post = hookData.postData;
  if (post && post.isAnonymous) {
    const anonName = await db.getObjectField(`user:${post.uid}`, 'anon:name');
    const anonPic = await db.getObjectField(`user:${post.uid}`, 'anon:picture');

    if (anonName) post.user.username = anonName;
    if (anonPic) post.user.picture = anonPic;

    post.user.userslug = null;
    post.user.profileUrl = null;
  }

  return hookData;
};

module.exports = plugin;
