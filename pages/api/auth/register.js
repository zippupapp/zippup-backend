import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// In-memory OTP storage (use Redis in production)
const otpStorage = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password, role = 'CUSTOMER' } = req.body;

    // Validation
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or phone' });
    }

    // Generate OTPs
    const emailOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTPs temporarily
    const sessionId = uuidv4();
    otpStorage.set(sessionId, {
      name,
      email: email.toLowerCase(),
      phone,
      password: password ? await bcrypt.hash(password, 12) : null,
      role,
      emailOTP,
      phoneOTP,
      timestamp: Date.now()
    });

    // For demo purposes, return OTPs in response
    // In production, send via email/SMS
    console.log(`Email OTP for ${email}: ${emailOTP}`);
    console.log(`Phone OTP for ${phone}: ${phoneOTP}`);

    res.status(200).json({
      success: true,
      message: 'Verification codes generated',
      sessionId,
      // Remove these in production
      emailOTP,
      phoneOTP,
      nextStep: 'verify'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Cleanup old OTPs every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, data] of otpStorage.entries()) {
    if (now - data.timestamp > 15 * 60 * 1000) {
      otpStorage.delete(sessionId);
    }
  }
}, 15 * 60 * 1000);
