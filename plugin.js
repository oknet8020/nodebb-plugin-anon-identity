'use strict';

const db = require.main.require('./src/database');

const plugin = {};

plugin.init = async function (params) {
  const { router, middleware } = params;

  // ניתוב בדיקה בסיסי לבדיקה שהתוסף בכלל טוען
  router.get('/test-anon', middleware.buildHeader, (req, res) => {
    res.render('anon-identity/test');
  });

  // ניתוב לדף ההגדרות האנונימיות
  router.get('/user/:userslug/anon-settings', middleware.buildHeader, async (req, res) => {
    console.log('[plugin-anon-identity] GET /user/:userslug/anon-settings accessed');

    try {
      const anonName = await db.getObjectField(`user:${req.uid}`, 'anon:name');
      const anonPic = await db.getObjectField(`user:${req.uid}`, 'anon:picture');

      res.render('anon-identity/anon-settings', {
        anonName: anonName || '',
        anonPic: anonPic || '',
      });
    } catch (err) {
      console.error('[plugin-anon-identity] Failed to load anon settings page:', err);
      res.status(500).render('500', { error: err });
    }
  });

  // שמירת ההגדרות דרך POST
  router.post('/api/user/anon-settings', async (req, res) => {
    const { anonName, anonPic } = req.body;

    if (!req.uid) {
      return res.status(403).json({ error: 'Not logged in' });
    }

    try {
      await db.setObjectField(`user:${req.uid}`, 'anon:name', anonName || '');
      await db.setObjectField(`user:${req.uid}`, 'anon:picture', anonPic || '');
      res.json({ status: 'saved' });
    } catch (err) {
      console.error('[plugin-anon-identity] Failed to save anon settings:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });
};

// שינוי המידע שמוצג בפוסט אנונימי
plugin.filterPostGet = async function (hookData) {
  const post = hookData.postData;

  if (post && post.isAnonymous) {
    try {
      const anonName = await db.getObjectField(`user:${post.uid}`, 'anon:name');
      const anonPic = await db.getObjectField(`user:${post.uid}`, 'anon:picture');

      if (anonName) post.user.username = anonName;
      if (anonPic) post.user.picture = anonPic;

      post.user.userslug = null;
      post.user.profileUrl = null;
    } catch (err) {
      console.error('[plugin-anon-identity] Failed to override anonymous identity:', err);
    }
  }

  return hookData;
};

module.exports = plugin;
