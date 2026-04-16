# 3Agents Auth Backend — AWS Lambda Deployment Guide

## Architecture

- **Runtime**: Node.js 18.x
- **Platform**: AWS Lambda + API Gateway (HTTP API)
- **Framework**: Serverless Framework v3
- **Region**: eu-west-3 (Paris)
- **CI/CD**: GitHub Actions (auto-deploy on push to `main`)

## Live Endpoint

```
https://g1wymxzrle.execute-api.eu-west-3.amazonaws.com
```

## Project Structure (Deployment Files)

```
3agentswebsite_revamp_backend/
├── .github/workflows/prod.yml   # GitHub Actions CI/CD pipeline
├── .gitignore                   # Ignores node_modules, .env, .serverless
└── server/
    ├── index.js                 # Express app (exports app, skips listen in Lambda)
    ├── lambda.js                # Lambda entry point (wraps Express via serverless-http)
    ├── serverless.yml           # Serverless Framework configuration
    ├── package.json             # Dependencies (includes serverless-http)
    ├── routes/auth.js           # Auth API routes
    ├── models/User.js           # Mongoose User model
    └── utils/email.js           # Nodemailer OTP email utility
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check (root) |
| GET | `/health` | Health check |
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | User signup (sends OTP email) |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend verification OTP |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/auth/me` | Get current user (Bearer token) |

## Prerequisites

1. **Node.js** v18+
2. **AWS CLI** configured (`aws configure`)
3. **Serverless Framework v3**: `npm install -g serverless@3`

## Manual Deployment

Set env vars in PowerShell, then deploy:

```powershell
$env:MONGODB_URI="your-mongodb-uri"
$env:JWT_SECRET="your-jwt-secret"
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USER="your-email@gmail.com"
$env:SMTP_PASS="your-app-password"
$env:FRONTEND_URL="https://autonomiq.ae"

serverless deploy
```

## CI/CD (GitHub Actions)

Every push to `main` auto-deploys via `.github/workflows/prod.yml`.

### Required GitHub Secrets

| Secret Name | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `MONGODB_URI` | MongoDB connection string (no quotes) |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP email address |
| `SMTP_PASS` | SMTP app password |
| `FRONTEND_URL` | Production frontend URL |

> Paste raw values in GitHub Secrets — no quotes.

## Key Design Decisions

- **`index.js`** exports the Express `app` and a `connectDB()` function. It only calls `app.listen()` when NOT running in Lambda (detected via `LAMBDA_TASK_ROOT` env var).
- **`lambda.js`** wraps the Express app with `serverless-http` and ensures MongoDB connects before handling requests. The connection is reused across warm invocations.
- **`serverless.yml`** reads env vars from the shell at deploy time via `${env:VAR_NAME, ''}` syntax.
- **Timeout** is set to 29s (just under API Gateway's 30s limit).

## Useful Commands

```bash
# Deploy
serverless deploy

# View logs
serverless logs -f app

# Remove stack from AWS
serverless remove

# View deployment info
serverless info
```
