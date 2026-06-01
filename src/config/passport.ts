import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../modules/user/user.model';


const backendUrl = process.env.NODE_ENV === 'production' 
  ? 'https://writeflowai-backend.onrender.com' 
  : `http://localhost:${process.env.PORT || 5000}`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${backendUrl}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const image = profile.photos?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error('No email from Google profile'), undefined);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name,
            email,
            image,
            role: 'USER',
            plan: 'free',
            status: 'active',
          });
        } else {
          if (image && user.image !== image) {
            user.image = image;
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  ) 
);

export default passport;