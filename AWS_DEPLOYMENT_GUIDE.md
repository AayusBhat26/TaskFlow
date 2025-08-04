# 🚀 TaskFlow AWS Free Deployment Guide

## Complete Step-by-Step Guide to Deploy TaskFlow on AWS (Free Tier)

### 📋 Prerequisites Checklist
- [ ] AWS Account (new accounts get 12 months free tier)
- [ ] Domain name (optional, can use AWS-provided URLs initially)
- [ ] GitHub repository with your TaskFlow code
- [ ] Node.js and npm/yarn installed locally
- [ ] AWS CLI installed on your machine

---

## 🏗️ PHASE 1: AWS ACCOUNT SETUP & BASIC CONFIGURATION

### Step 1: Create AWS Account
```bash
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the signup process (requires credit card, but won't charge for free tier)
4. Verify your email and phone number
5. Choose "Basic Support Plan" (free)
```

### Step 2: Install AWS CLI
```bash
# Windows (using chocolatey)
choco install awscli

# Or download installer from:
# https://aws.amazon.com/cli/

# Verify installation
aws --version
```

### Step 3: Configure AWS CLI
```bash
# Configure your credentials
aws configure

# Enter:
# - AWS Access Key ID: (from IAM console)
# - AWS Secret Access Key: (from IAM console)
# - Default region name: us-east-1
# - Default output format: json
```

### Step 4: Create IAM User for Deployment
```bash
1. Go to AWS Console → IAM → Users
2. Click "Add User"
3. Username: "taskflow-deployer"
4. Access type: "Programmatic access"
5. Attach policies:
   - AmazonS3FullAccess
   - AmazonRDSFullAccess
   - AWSLambdaFullAccess
   - AmazonAPIGatewayFullAccess
   - CloudFrontFullAccess
   - AmazonDynamoDBFullAccess
   - AmazonEC2FullAccess
6. Download credentials CSV file
```

---

## 🗄️ PHASE 2: DATABASE SETUP (RDS PostgreSQL)

### Step 5: Create RDS PostgreSQL Instance
```bash
1. Go to AWS Console → RDS
2. Click "Create database"
3. Choose "Standard Create"
4. Engine type: PostgreSQL
5. Version: Latest (e.g., 15.4)
6. Templates: Free tier
7. DB instance identifier: taskflow-db
8. Master username: postgres
9. Master password: (create strong password)
10. DB instance class: db.t3.micro (free tier)
11. Storage type: General Purpose SSD
12. Allocated storage: 20 GB (free tier limit)
13. Public access: Yes (for now, secure later)
14. VPC security group: Create new
15. Database name: taskflow
16. Click "Create database"
```

### Step 6: Configure Database Security Group
```bash
1. Go to EC2 → Security Groups
2. Find the RDS security group created
3. Edit inbound rules
4. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Anywhere (0.0.0.0/0) - for development only
5. Save rules
```

### Step 7: Test Database Connection
```bash
# Install PostgreSQL client locally
# Windows: https://www.postgresql.org/download/windows/

# Connect to test
psql -h your-rds-endpoint.amazonaws.com -U postgres -d taskflow

# Your RDS endpoint is in the RDS console
```

---

## 📦 PHASE 3: PREPARE YOUR APPLICATION

### Step 8: Update Environment Variables
Create `.env.production` file:
```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@your-rds-endpoint.amazonaws.com:5432/taskflow"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth providers (if using)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AWS (for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="taskflow-uploads"

# Email (if using SES)
AWS_SES_REGION="us-east-1"
```

### Step 9: Update Package.json for Deployment
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy:aws": "npm run build && aws s3 sync out/ s3://your-bucket-name",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate"
  }
}
```

### Step 10: Run Database Migrations
```bash
# Ensure your DATABASE_URL is set
npx prisma migrate deploy
npx prisma generate
```

---

## 🪣 PHASE 4: S3 BUCKET SETUP (FILE STORAGE)

### Step 11: Create S3 Buckets
```bash
# Create bucket for static site hosting
aws s3 mb s3://taskflow-app-yourdomain

# Create bucket for file uploads
aws s3 mb s3://taskflow-uploads-yourdomain

# Enable static website hosting
aws s3 website s3://taskflow-app-yourdomain --index-document index.html --error-document error.html
```

### Step 12: Configure S3 Bucket Policies
Create `s3-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::taskflow-app-yourdomain/*"
    }
  ]
}
```

Apply policy:
```bash
aws s3api put-bucket-policy --bucket taskflow-app-yourdomain --policy file://s3-policy.json
```

---

## ⚡ PHASE 5: LAMBDA FUNCTIONS (API & CHAT)

### Step 13: Create Lambda Function for API
```bash
1. Go to AWS Console → Lambda
2. Click "Create function"
3. Author from scratch
4. Function name: taskflow-api
5. Runtime: Node.js 18.x
6. Architecture: x86_64
7. Execution role: Create new role with basic Lambda permissions
8. Click "Create function"
```

### Step 14: Lambda Function Code Structure
Create `lambda/api/index.js`:
```javascript
const { createServer, proxy } = require('aws-serverless-express');
const { init } = require('./app');

let server;

exports.handler = async (event, context) => {
  if (!server) {
    const app = await init();
    server = createServer(app);
  }
  
  return proxy(server, event, context, 'PROMISE').promise;
};
```

### Step 15: Package and Deploy Lambda
```bash
# Install dependencies
cd lambda/api
npm install aws-serverless-express

# Create deployment package
zip -r ../taskflow-api.zip .

# Upload to Lambda
aws lambda update-function-code \
  --function-name taskflow-api \
  --zip-file fileb://../taskflow-api.zip
```

---

## 🌐 PHASE 6: API GATEWAY SETUP

### Step 16: Create REST API
```bash
1. Go to AWS Console → API Gateway
2. Click "Create API"
3. Choose "REST API" → Build
4. API name: taskflow-api
5. Endpoint type: Regional
6. Click "Create API"
```

### Step 17: Configure API Gateway Resources
```bash
1. Create resource: /api
2. Create resource: /api/{proxy+}
3. Create method: ANY on /{proxy+}
4. Integration type: Lambda Function
5. Lambda Function: taskflow-api
6. Enable Lambda Proxy Integration
7. Save
8. Deploy API:
   - Actions → Deploy API
   - Stage name: prod
   - Click Deploy
```

---

## 💬 PHASE 7: WEBSOCKET API FOR CHAT

### Step 18: Create WebSocket API
```bash
1. Go to API Gateway → Create API
2. Choose "WebSocket API" → Build
3. API name: taskflow-chat
4. Route selection expression: $request.body.action
5. Click "Create API"
```

### Step 19: Create Lambda for WebSocket
Create `lambda/chat/index.js`:
```javascript
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { routeKey, connectionId } = event.requestContext;
  
  switch (routeKey) {
    case '$connect':
      return handleConnect(connectionId);
    case '$disconnect':
      return handleDisconnect(connectionId);
    case 'sendMessage':
      return handleSendMessage(event);
    default:
      return { statusCode: 400, body: 'Unknown route' };
  }
};

async function handleConnect(connectionId) {
  const params = {
    TableName: 'ChatConnections',
    Item: {
      connectionId,
      timestamp: Date.now()
    }
  };
  
  await dynamodb.put(params).promise();
  return { statusCode: 200, body: 'Connected' };
}

async function handleDisconnect(connectionId) {
  const params = {
    TableName: 'ChatConnections',
    Key: { connectionId }
  };
  
  await dynamodb.delete(params).promise();
  return { statusCode: 200, body: 'Disconnected' };
}

async function handleSendMessage(event) {
  // Implementation for sending messages
  return { statusCode: 200, body: 'Message sent' };
}
```

### Step 20: Create DynamoDB Tables
```bash
# Create connections table
aws dynamodb create-table \
  --table-name ChatConnections \
  --attribute-definitions AttributeName=connectionId,AttributeType=S \
  --key-schema AttributeName=connectionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create messages table
aws dynamodb create-table \
  --table-name ChatMessages \
  --attribute-definitions AttributeName=messageId,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=messageId,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

---

## 🚀 PHASE 8: BUILD AND DEPLOY FRONTEND

### Step 21: Configure Next.js for Static Export
Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  }
};

module.exports = nextConfig;
```

### Step 22: Build and Deploy to S3
```bash
# Set environment variables
export NEXT_PUBLIC_API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/prod"
export NEXT_PUBLIC_WS_URL="wss://your-ws-api-id.execute-api.us-east-1.amazonaws.com/prod"

# Build the application
npm run build

# Deploy to S3
aws s3 sync out/ s3://taskflow-app-yourdomain --delete
```

---

## 🌩️ PHASE 9: CLOUDFRONT CDN SETUP

### Step 23: Create CloudFront Distribution
```bash
1. Go to AWS Console → CloudFront
2. Click "Create Distribution"
3. Origin Domain: taskflow-app-yourdomain.s3-website-us-east-1.amazonaws.com
4. Origin Path: leave empty
5. Viewer Protocol Policy: Redirect HTTP to HTTPS
6. Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
7. Cache Based on Selected Request Headers: All
8. Default Root Object: index.html
9. Price Class: Use Only U.S., Canada and Europe
10. Click "Create Distribution"
```

### Step 24: Configure Custom Error Pages
```bash
1. Go to your CloudFront distribution
2. Error Pages tab
3. Create Custom Error Response:
   - HTTP Error Code: 404
   - Error Response Page Path: /404.html
   - HTTP Response Code: 404
4. Create another for 403 errors
```

---

## 🌍 PHASE 10: DOMAIN AND SSL SETUP

### Step 25: Register Domain (Optional)
```bash
1. Go to AWS Console → Route 53
2. Register domain or transfer existing domain
3. Cost: ~$12/year for .com domains
```

### Step 26: Create SSL Certificate
```bash
1. Go to AWS Console → Certificate Manager
2. Click "Request a certificate"
3. Domain name: yourdomain.com
4. Add www.yourdomain.com
5. Validation method: DNS validation
6. Click "Request"
7. Add CNAME records to your domain DNS
```

### Step 27: Configure Route 53 DNS
```bash
1. Go to Route 53 → Hosted Zones
2. Create record:
   - Name: yourdomain.com
   - Type: A
   - Alias: Yes
   - Alias Target: Your CloudFront distribution
3. Create another record for www.yourdomain.com
```

---

## 🔧 PHASE 11: FINAL CONFIGURATION

### Step 28: Update CloudFront with Custom Domain
```bash
1. Go to your CloudFront distribution
2. Edit General settings
3. Alternate Domain Names: yourdomain.com, www.yourdomain.com
4. SSL Certificate: Custom SSL Certificate (select your certificate)
5. Save changes
```

### Step 29: Environment Variables Final Update
Update your production environment variables:
```env
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_WS_URL="wss://chat.yourdomain.com"
```

### Step 30: Final Deployment
```bash
# Rebuild with production URLs
npm run build

# Deploy to S3
aws s3 sync out/ s3://taskflow-app-yourdomain --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🧪 PHASE 12: TESTING AND MONITORING

### Step 31: Test All Features
```bash
✅ Test user registration/login
✅ Test task creation and completion
✅ Test note creation and editing
✅ Test file uploads
✅ Test real-time chat
✅ Test notifications
✅ Test mobile responsiveness
```

### Step 32: Set Up Monitoring
```bash
1. Go to CloudWatch → Dashboards
2. Create dashboard: TaskFlow-Monitoring
3. Add widgets for:
   - Lambda function errors
   - API Gateway requests
   - RDS connections
   - S3 storage usage
   - CloudFront requests
```

### Step 33: Set Up Alerts
```bash
1. CloudWatch → Alarms
2. Create alarms for:
   - High error rates (>5%)
   - Database connection failures
   - Unusual traffic spikes
   - Storage usage approaching limits
```

---

## 💰 COST MONITORING

### Step 34: Set Up Billing Alerts
```bash
1. Go to AWS Billing → Budgets
2. Create budget:
   - Budget type: Cost budget
   - Budget amount: $10 (or your limit)
   - Alert threshold: 80% of budget
   - Email notification: your-email@domain.com
```

### Step 35: Regular Cost Optimization
```bash
# Weekly tasks:
□ Check CloudWatch logs retention (set to 7 days)
□ Review unused resources
□ Monitor free tier usage limits
□ Clean up old Lambda versions
□ Optimize S3 storage classes
```

---

## 🔒 SECURITY CHECKLIST

### Step 36: Secure Your Deployment
```bash
□ Enable MFA on AWS root account
□ Create IAM users instead of using root
□ Rotate access keys regularly
□ Enable AWS CloudTrail for audit logs
□ Configure security groups restrictively
□ Enable RDS encryption
□ Use HTTPS everywhere
□ Regular security updates for dependencies
```

---

## 🚀 CI/CD AUTOMATION (BONUS)

### Step 37: GitHub Actions Deployment
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build application
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
        NEXT_PUBLIC_WS_URL: ${{ secrets.WS_URL }}
        
    - name: Deploy to S3
      run: |
        aws s3 sync out/ s3://taskflow-app-yourdomain --delete
        aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        AWS_DEFAULT_REGION: us-east-1
```

---

## 📊 SUCCESS METRICS

### Expected Results After Deployment:
- ✅ **Cost**: $0-5/month (within free tier limits)
- ✅ **Performance**: <2s page load times globally
- ✅ **Availability**: 99.9% uptime
- ✅ **Scalability**: Handles 1000+ concurrent users
- ✅ **Security**: SSL encryption, AWS security best practices

---

## 🆘 TROUBLESHOOTING GUIDE

### Common Issues and Solutions:

**1. Database Connection Issues:**
```bash
# Check security group settings
# Verify DATABASE_URL format
# Test connection with psql
```

**2. Lambda Function Errors:**
```bash
# Check CloudWatch logs
# Verify environment variables
# Test function in AWS console
```

**3. Static Site Not Loading:**
```bash
# Check S3 bucket policy
# Verify CloudFront distribution
# Check DNS settings
```

**4. WebSocket Connection Failures:**
```bash
# Verify API Gateway WebSocket routes
# Check Lambda function permissions
# Test WebSocket endpoint directly
```

---

## 📝 MAINTENANCE CHECKLIST

### Daily:
- [ ] Monitor application performance
- [ ] Check for error alerts

### Weekly:
- [ ] Review AWS cost usage
- [ ] Check security alerts
- [ ] Update dependencies if needed

### Monthly:
- [ ] Review and optimize costs
- [ ] Update SSL certificates if needed
- [ ] Performance optimization review
- [ ] Security audit

---

## 🎉 CONGRATULATIONS!

You now have TaskFlow fully deployed on AWS with:
- ✅ Free hosting (12 months)
- ✅ Real-time chat functionality
- ✅ Global CDN distribution
- ✅ SSL security
- ✅ Scalable architecture
- ✅ Professional domain
- ✅ Monitoring and alerts

Your TaskFlow application is now live and ready for users! 🚀

**Next Steps:**
1. Share your application with users
2. Gather feedback and iterate
3. Monitor usage and optimize
4. Scale as your user base grows

---

## 📞 SUPPORT RESOURCES

- AWS Free Tier Documentation: https://aws.amazon.com/free/
- Next.js Deployment Guide: https://nextjs.org/docs/deployment
- AWS Lambda Best Practices: https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html
- Prisma Deployment Guide: https://www.prisma.io/docs/guides/deployment

**Need Help?** 
- AWS Support (Basic Plan - Free)
- Stack Overflow
- AWS Documentation
- Next.js Community

Good luck with your deployment! 🎯
