const express = require('express');
const simpleOauth2 = require('simple-oauth2');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const ORIGIN = process.env.ORIGIN || 'https://mrbc2014.github.io';

const oauth2 = simpleOauth2.create({
  client: { id: CLIENT_ID, secret: CLIENT_SECRET },
  auth: {
    tokenHost: 'https://github.com',
    tokenPath: '/login/oauth/access_token',
    authorizePath: '/login/oauth/authorize',
  },
});

app.get('/auth', (req, res) => {
  const url = oauth2.authorizationCode.authorizeURL({
    scope: 'repo,user',
  });
  res.redirect(url);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const result = await oauth2.authorizationCode.getToken({ code });
    const token = result.access_token;
    res.send(`
      <script>
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          '${ORIGIN}'
        );
        window.close();
      </script>
    `);
  } catch (err) {
    res.status(500).send('Auth failed: ' + err.message);
  }
});

app.listen(PORT, () => console.log('OAuth proxy running on port ' + PORT));
