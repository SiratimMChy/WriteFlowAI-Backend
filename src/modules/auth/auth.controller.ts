import { Request, Response } from 'express';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { OAuth2Client } from 'google-auth-library';

import { User, IUser } from '../user/user.model';



const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



const generateToken = (id: string, expiresIn: string = process.env.JWT_EXPIRES_IN || '7d') => {

  return jwt.sign({ id }, process.env.JWT_SECRET as string, { expiresIn: expiresIn as any });

};



export const register = async (req: Request, res: Response): Promise<void> => {

  try {

    const { name, email, password } = req.body;



    const userExists = await User.findOne({ email });



    if (userExists) {

      res.status(400).json({ success: false, message: 'User already exists' });

      return;

    }



    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);



    const user = await User.create({

      name,

      email,

      password: hashedPassword,

    });



    if (user) {

      res.status(201).json({

        success: true,

        message: 'User registered successfully',

        data: {

          _id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,

          image: user.image,

          token: generateToken(user._id.toString()),

        },

      });

    } else {

      res.status(400).json({ success: false, message: 'Invalid user data' });

    }

  } catch (error: any) {

    res.status(500).json({ success: false, message: error.message });

  }

};



export const login = async (req: Request, res: Response): Promise<void> => {

  try {

    const { email, password } = req.body;



    const user = await User.findOne({ email }).select('+password');



    if (user && (await bcrypt.compare(password, user.password as string))) {

      res.json({

        success: true,

        message: 'Login successful',

        data: {

          _id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,

          image: user.image,

          token: generateToken(user._id.toString()),

        },

      });

    } else {

      res.status(401).json({ success: false, message: 'Invalid email or password' });

    }

  } catch (error: any) {

    res.status(500).json({ success: false, message: error.message });

  }

};



export const refreshToken = async (req: Request, res: Response): Promise<void> => {

  try {

    const { token } = req.body;

    if (!token) {

      res.status(400).json({ success: false, message: 'Token is required' });

      return;

    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, { ignoreExpiration: true }) as { id: string };

    const user = await User.findById(decoded.id);



    if (!user) {

      res.status(404).json({ success: false, message: 'User not found' });

      return;

    }



    const newToken = generateToken(user._id.toString());

    res.json({ success: true, message: 'Token refreshed', data: { token: newToken } });

  } catch (error: any) {

    res.status(401).json({ success: false, message: 'Invalid token' });

  }

};



export const googleLogin = async (req: Request, res: Response): Promise<void> => {

  try {

    const { credential } = req.body;



    if (!credential) {

      res.status(400).json({ success: false, message: 'Google credential is required' });

      return;

    }



    // Verify the Google ID token

    const ticket = await googleClient.verifyIdToken({

      idToken: credential,

      audience: process.env.GOOGLE_CLIENT_ID,

    });



    const payload = ticket.getPayload();

    if (!payload || !payload.email) {

      res.status(400).json({ success: false, message: 'Invalid Google token' });

      return;

    }



    const { sub: googleId, email, name, picture } = payload;



    // Find existing user or create a new one

    let user = await User.findOne({ email });



    if (user) {

      // Link Google account if not already linked

      if (!user.googleId) {

        await User.findByIdAndUpdate(user._id, { googleId });

      }

    } else {

      // Create a new user from Google data

      user = await User.create({

        name: name || email.split('@')[0],

        email,

        googleId,

        image: picture,

      });

    }



    res.json({

      success: true,

      message: 'Google login successful',

      data: {

        _id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        image: user.image || picture,

        token: generateToken(user._id.toString()),

      },

    });

  } catch (error: any) {

    res.status(500).json({ success: false, message: error.message });

  }

};