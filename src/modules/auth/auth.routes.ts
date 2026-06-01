import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, refreshToken } from './auth.controller';
import '../../config/passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Google OAuth — Step 1: Redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth — Step 2: Callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    try {
      const user = req.user as any;
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '365d') as any,
      });

      // Redirect to frontend callback page with token + user info as query params
      const params = new URLSearchParams({
        token,
        id: user._id.toString(),
        name: user.name || '',
        email: user.email || '',
        image: user.image || '',
        role: user.role || 'USER',
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }
  }
);

export default router;
