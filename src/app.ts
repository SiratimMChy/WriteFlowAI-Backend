import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env vars FIRST before any module that reads them (e.g. passport)
dotenv.config();

import passport from 'passport';
import './config/passport';
import jwt from 'jsonwebtoken';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      /^http:\/\/localhost:\d+$/.test(origin);
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import itemRoutes from './modules/item/item.routes';
import reviewRoutes from './modules/review/review.routes';
import bookingRoutes from './modules/booking/booking.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import aiRoutes from './modules/ai/ai.routes';
import settingsRoutes from './modules/settings/settings.routes';
import documentRoutes from './modules/document/document.routes';

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Google OAuth redirect routes (passport-based flow)
app.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`, session: false }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '365d') as any,
    });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&role=${user.role}&image=${encodeURIComponent(user.image || '')}&id=${user._id}`);
  }
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
// Alias for legacy/deployed frontend that expects AI endpoints directly under /api
app.use('/api', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/documents', documentRoutes);

export default app;
