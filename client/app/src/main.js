import express from 'express'
import { createServer as createViteServer } from 'vite'
import session from 'express-session'
import 'dotenv/config'
const app = express();
const PORT = process.env.PORT || 8888
import {OAuth2Client} from 'google-auth-library';
const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;
const googleClient = new OAuth2Client(googleClientId, googleClientSecret);
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(session({
  name: 'sarlink.sid',
  secret: process.env.SESSION_SECRET || 'sarlink-development-session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}))
app.post('/api/auth/google',async (req,res)=>{
  const { code } = req.body;
  if(!code){
    return res.status(400).json({
      error: 'missing_authorization_code',
      message: 'Google did not return an authorization code. Please try signing in again.',
    })
  }
  try{
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: 'postmessage',
    });
    if (!tokens.refresh_token || !tokens.id_token) {
      return res.status(401).json({
        error: 'google_reauth_required',
        message: 'Google did not issue a renewable session. Please sign in again and approve access.',
      });
    }
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload()

    const {sub: googleId,email,name,picture} = payload;
    const user = {googleId,email,name,picture}

    req.session.user = user;
    req.session.googleTokens = {
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    };
    req.session.save((error) => {
      if (error) {
        console.error('Failed to save login session:', error)
        return res.status(500).send('Unable to save login session')
      }
      return res.status(200).json({ user });
    })
  }catch(error){
    console.error('Google token verification failed:', error.message)
    const isExpired = error.message === 'invalid_grant' || error.code === 'invalid_grant';
    res.status(401).json({
      error: isExpired ? 'google_token_expired' : 'google_sign_in_failed',
      message: isExpired
        ? 'Your Google sign-in expired or was revoked. Please sign in again.'
        : 'Google could not complete sign-in. Please try again.',
    })

  }
})

app.get('/api/auth/session', (req, res) => {
  res.set('Cache-Control', 'no-store')
  if (!req.session.user || !req.session.googleTokens?.refresh_token) {
    return res.json({ user: null });
  }

  googleClient.setCredentials(req.session.googleTokens);
  googleClient.getAccessToken()
    .then(({ token }) => {
      if (!token) throw new Error('Google did not return an access token');
      res.json({ user: req.session.user });
    })
    .catch((error) => {
      console.error('Google session validation failed:', error.message);
      req.session.destroy(() => res.status(401).json({
        user: null,
        error: 'session_expired',
        message: 'Your Google session expired or was revoked. Please sign in again.',
      }));
    });
})

const clearSession = (req, res) => {
  req.session.user = null
  req.session.destroy((error) => {
    if (error) {
      console.error('Failed to destroy user session:', error)
      return res.status(500).json({ error: 'Unable to log out' })
    }

    res.clearCookie('sarlink.sid', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return req.method === 'GET' ? res.redirect('/') : res.sendStatus(204)
  })
}

app.get('/api/auth/logout', clearSession)
app.post('/api/auth/logout', clearSession)

const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'spa',
})

app.use(vite.middlewares)

app.listen(PORT, () => {
  console.log(`Server is running securely on port ${PORT}`);
});