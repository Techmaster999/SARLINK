import express from 'express'
import { createServer as createViteServer } from 'vite'
import session from 'express-session'
const app = express();
const PORT = process.env.PORT || 8888
import {OAuth2Client} from 'google-auth-library';
import 'dotenv/config'
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
const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/api/auth/google',async (req,res)=>{
  const token = req.body.token || req.body.credential
  if(!token){
    return res.sendStatus(400)
  }
  try{
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    })

    const payload = ticket.getPayload()

    const {sub: googleId,email,name,picture} = payload;
    const user = {googleId,email,name,picture}

    if (req.body.credential) {
      req.session.user = user
      return req.session.save((error) => {
        if (error) {
          console.error('Failed to save login session:', error)
          return res.status(500).send('Unable to save login session')
        }

        return res.redirect('/home')
      })
    }

    res.status(200).json({
      message: ' auth success',
      user
    })


  }catch(error){
    console.error('Google token verification failed:', error.message)
    res.status(401).json({
      error: 'invalid token'
    })

  }
})

app.get('/api/auth/session', (req, res) => {
  res.set('Cache-Control', 'no-store')
  res.json({ user: req.session.user || null })
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