# 🚀 ZippUp Backend API

ZippUp Platform Backend - Full-stack on-demand service platform API

## 🎯 Features

- ✅ User Authentication (JWT + OTP)
- ✅ Service Management
- ✅ Booking System
- ✅ Payment Integration
- ✅ Emergency Services
- ✅ Real-time Features
- ✅ Provider Verification
- ✅ Admin Dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL + Prisma
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **Real-time**: Socket.IO
- **Hosting**: Vercel

## 🚀 Deployment

1. **Database**: Set up PostgreSQL (Supabase recommended)
2. **Environment**: Configure all environment variables
3. **Deploy**: Push to Vercel

## 📚 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - OTP verification
- `POST /api/auth/login` - User login
- `GET /api/services` - List services
- `GET /api/health` - Health check

## 🔑 Environment Variables

Required environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `STRIPE_SECRET_KEY`

## 📄 License

MIT License
