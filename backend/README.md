# Dikshant IAS Backend - Quick Start Guide

## 🚀 Complete Setup in 10 Minutes

### Step 1: Clone and Navigate
```bash
cd Dikshant/backend
```

### Step 2: Run Automated Setup
```bash
# Make setup script executable
chmod +x setup.sh

# Run setup (installs everything)
./setup.sh
```

This script will:
- ✅ Start Docker services (MongoDB, RabbitMQ, Redis)
- ✅ Create all directory structures
- ✅ Install dependencies for all services
- ✅ Create configuration files

### Step 3: Configure Environment Variables

Copy the provided `.env.example` to `.env` in each service and update:

**Priority Environment Variables to Update:**

```bash
# Auth Service (.env)
FAST2SMS_API_KEY=your-actual-key
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Course Service (.env)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=dikshant-videos

# Payment Service (.env)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Notification Service (.env)
FCM_SERVER_KEY=your-fcm-key
```

### Step 4: Start All Services

**Option A: Development Mode (Recommended for testing)**
```bash
npm run dev
```

**Option B: Using separate terminals**
```bash
./start-dev.sh
```

**Option C: Production Mode with PM2**
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 logs
```

### Step 5: Verify Services

Check if all services are running:
```bash
# API Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/health

# Course Service
curl http://localhost:3002/health

# Test Service
curl http://localhost:3003/health

# Payment Service
curl http://localhost:3005/health

# Check RabbitMQ Management
open http://localhost:15672  # Login: admin/admin123
```

## 🧪 Testing the System

### 1. Register a New User

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "9876543210",
    "type": "mobile",
    "purpose": "registration"
  }'

# Verify OTP (check console for OTP code)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "9876543210",
    "type": "mobile",
    "otp": "123456"
  }'

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "mobile": "9876543210",
    "password": "Test@123",
    "batch": "2024-PRELIMS"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "student@test.com",
    "password": "Test@123"
  }'
```

**Save the accessToken from response for further API calls**

### 3. Create a Course (Admin)

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "UPSC Prelims 2025",
    "description": "Complete course for UPSC Prelims",
    "category": "CATEGORY_ID",
    "price": 5000,
    "duration": 120,
    "level": "intermediate",
    "instructor": "Dr. Sharma"
  }'
```

### 4. Get Dashboard Data

```bash
curl -X GET http://localhost:3000/api/users/dashboard \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Monitoring Services

### View Logs

**All services:**
```bash
pm2 logs
```

**Specific service:**
```bash
pm2 logs auth-service
pm2 logs course-service
```

**Docker services:**
```bash
docker-compose logs -f rabbitmq
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### RabbitMQ Management UI
- URL: http://localhost:15672
- Username: admin
- Password: admin123
- Check queues, exchanges, and message flow

### MongoDB
```bash
# Connect to MongoDB
mongosh mongodb://admin:admin123@localhost:27017

# Use database
use dikshant-auth

# Check collections
show collections

# View users
db.users.find().pretty()
```

### Redis
```bash
# Connect to Redis
redis-cli

# Check keys
KEYS *

# View specific key
GET "key_name"
```

## 🔧 Common Commands

### Docker Services

```bash
# Start infrastructure
docker-compose up -d

# Stop infrastructure
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart mongodb
docker-compose restart rabbitmq
```

### PM2 Commands

```bash
# Start services
pm2 start ecosystem.config.js

# Stop all
pm2 stop all

# Restart all
pm2 restart all

# Delete all
pm2 delete all

# Monitor
pm2 monit

# View logs
pm2 logs

# Service status
pm2 status
```

### Development

```bash
# Install dependencies for all services
npm run install:all

# Start in development mode
npm run dev

# Start individual service
cd services/auth-service && npm run dev
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 PID
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker-compose logs mongodb
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ status
docker ps | grep rabbitmq

# Access management UI
open http://localhost:15672

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Service Not Starting

```bash
# Check logs
npm run dev  # Will show errors

# Or with PM2
pm2 logs service-name

# Check environment variables
cat services/auth-service/.env
```

## 📁 Project Structure

```
backend/
├── api-gateway/              # Port 3000
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── server.js
│   └── package.json
├── services/
│   ├── auth-service/         # Port 3001
│   ├── course-service/       # Port 3002
│   ├── test-service/         # Port 3003
│   ├── notification-service/ # Port 3004
│   ├── payment-service/      # Port 3005
│   ├── user-service/         # Port 3006
│   ├── scholarship-service/  # Port 3007
│   └── content-service/      # Port 3008
├── shared/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── models/
├── docker-compose.yml
├── ecosystem.config.js
├── setup.sh
└── package.json
```

## 🎯 Next Steps

1. **Configure AWS S3** for video storage
2. **Setup Firebase** for push notifications
3. **Configure Razorpay** for payments
4. **Setup SMS Gateway** (Fast2SMS/Twilio)
5. **Configure Email** (SMTP)
6. **Add SSL certificates** for production
7. **Setup CI/CD** pipeline
8. **Configure monitoring** (PM2 Plus, New Relic)
9. **Setup log aggregation** (ELK Stack)
10. **Create admin panel** frontend

## 📝 API Endpoints Summary

### Authentication
- POST `/api/auth/send-otp` - Send OTP
- POST `/api/auth/verify-otp` - Verify OTP  
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile
- PUT `/api/auth/change-password` - Change password

### Courses
- GET `/api/courses` - List courses
- GET `/api/courses/:id` - Get course
- POST `/api/courses/:id/enroll` - Enroll
- GET `/api/courses/my-courses` - My courses

### Tests
- GET `/api/tests` - List tests
- POST `/api/tests/:id/start` - Start test
- POST `/api/tests/:id/submit` - Submit test
- GET `/api/tests/:id/result` - Get result

### Payments
- POST `/api/payments/create-order` - Create order
- POST `/api/payments/verify` - Verify payment
- GET `/api/payments/history` - Payment history

### Users
- GET `/api/users/dashboard` - Dashboard data
- GET `/api/users/my-progress` - Learning progress

## 🔐 Security Best Practices

1. Always use HTTPS in production
2. Keep JWT_SECRET secure and random
3. Rotate secrets regularly
4. Enable rate limiting
5. Validate all inputs
6. Use parameterized queries
7. Enable CORS properly
8. Keep dependencies updated
9. Enable security headers
10. Regular security audits

## 📞 Support

For issues or questions:
- Check logs: `pm2 logs`
- Review documentation
- Check Docker services status
- Verify environment variables
- Test API endpoints with Postman

---

**Ready to scale?** This microservices architecture is production-ready and can handle thousands of concurrent users!

First run npm install 

Then run -> docker-compose up --build


Service kor un krne ke liye 
docker build -t base-service -f base.Dockerfile .


For making a image
docker build -t base-service -f base.Dockerfile .

docker stop auth-service

docker compose up -d --build auth-service
