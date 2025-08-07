import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Import the OTP storage (in production, use Redis)
const otpStorage = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, emailOTP, phoneOTP } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get stored registration data
    const registrationData = otpStorage.get(sessionId);
    
    if (!registrationData) {
      return res.status(400).json({ error: 'Invalid or expired session' });
    }

    // Check if session has expired (10 minutes)
    if (Date.now() - registrationData.timestamp > 10 * 60 * 1000) {
      otpStorage.delete(sessionId);
      return res.status(400).json({ error: 'Verification codes have expired' });
    }

    // Verify at least one OTP
    const emailValid = emailOTP && emailOTP === registrationData.emailOTP;
    const phoneValid = phoneOTP && phoneOTP === registrationData.phoneOTP;

    if (!emailValid && !phoneValid) {
      return res.status(400).json({ error: 'Invalid verification code(s)' });
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone,
        password: registrationData.password,
        role: registrationData.role,
        isEmailVerified: emailValid,
        isPhoneVerified: phoneValid,
      }
    });

    // Create wallet for the user
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
      }
    });

    // Clean up OTP storage
    otpStorage.delete(sessionId);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userWithoutPassword,
      token,
      nextStep: user.role === 'CUSTOMER' ? 'complete_profile' : 'setup_provider_profile'
    });

  } catch (error) {
    console.error('Verification error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
