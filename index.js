const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const ORIGIN = process.env.ORIGIN || 'https://mrbc2014.github.io';

app.get('/auth', (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user`
  );
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code },
      { headers: { Accept: 'application/json' } }
    );
    const token = response.data.access_token;
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

app.listen(PORT, () => console.log(`OAuth proxy running on port ${PORT}`));
