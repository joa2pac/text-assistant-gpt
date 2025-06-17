# Carrier VTEX Service

**Klaviyo-VTEX Integration**\
This project is a backend integration that connects VTEX (e-commerce platform) with Klaviyo (email marketing and automation platform), enabling two-way data synchronization between the two platforms.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Environment Variables](#environment-variables)
- [Installing Dependencies](#installing-dependencies)
- [Docker Compose (Development)](#docker-compose-development)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Flow Diagrams](#flow-diagrams)
- [Middleware and Validations](#middleware-and-validations)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Lint and Prettier](#lint-and-prettier)

---

## Tech Stack

**Server:**

- **Node.js** (v18, as per Dockerfile)
- **Express.js** (Web framework)
- **TypeScript** (Programming language)
- **MongoDB** (Mongoose as ODM)

---

## Environment Variables

Configure the following variables in your environment (`.env`):

```bash
PORT=5420
NODE_ENV=development

API_URL="https://localhost:$PORT"
FRONTEND_URL="https://localhost:3000"
KLAVIYO_API_URL=https://a.klaviyo.com/api

CRYPTOJS_SECRET_KEY=123456

MONGODB_URL=mongodb://127.0.0.1:27017/carrier-vtex

JWT_SECRET=myVerySecretString

NUMBER_OF_BATCH_FOR_ORDERS_CRON=20
NUMBER_OF_BATCH_FOR_PRODUCTS_CRON=100
```

---

## Installing Dependencies

To install all dependencies, run:

```bash
yarn install-all
```

---

## Docker Compose (Development)

To run the project locally, you'll need **MongoDB** and **Redis**. Below is an example `docker-compose.yml` for your local setup:

> 📝 This file is not included in the repository. You can create it manually based on your configuration.

```yaml
version: '3.9'

networks:
  klaviyovtex:
    driver: overlay

services:
  mongodb:
    image: mongo:latest
    ports:
      - '27017:27017'
    volumes:
      - ./data/db:/data/db

  redis:
    image: redis:latest
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  app:
    image: IMAGE_URI
    working_dir: /opt/app
    networks:
      - klaviyovtex
    ports:
      - "9001:3000"

volumes:
  redis_data:
    driver: local
```

---

## Running the Project

Start the servers in development mode:

```bash
npm run start-dev
```

---

## Project Structure

```
.
├── src/                              # Source files
│   ├── config/                       # Configuration files
│   ├── constants/                    # Constants
│   ├── controllers/                  # Controllers
│   ├── docs/                         # Documentation
│   ├── enums/                        # TypeScript enums
│   ├── interfaces/                   # TypeScript interfaces
│   ├── jobs/                         # Background jobs and cron tasks
│   ├── lib/                          # Core libraries and utilities
│   ├── middlewares/                  # Express middlewares
│   ├── models/                       # Mongoose models
│   ├── routes/                       # API routes
│   ├── services/                     # Business logic services
│   ├── tests/                        # Test files
│   ├── utils/                        # Utility functions
│   ├── validations/                  # Validation schemas
│   ├── app.ts                        # Express app configuration
│   └── index.ts                      # Application entry point
├── deployment/                       # Deployment configurations
│   └── docker-compose.yml            # Production docker-compose
├── dist/                             # Compiled JavaScript files
├── .github/                          # GitHub configurations
├── .husky/                           # Git hooks
├── docker-compose.yml                # Development docker-compose
├── Dockerfile                        # Docker configuration
├── jest.config.cjs                   # Jest testing configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc.json                  # Prettier configuration
└── README.md                         # Project documentation
```

---

## API Endpoints

List of available routes (base path: `/api/v1`):

### Auth Routes:

- `POST /auth/login` – User authentication
- `POST /auth/refresh-token` – Refresh authentication token

### Onboarding Routes:

- `POST /onboarding/vtex` – VTEX integration setup
- `GET /onboarding/vtex/sales-channel` – Get VTEX sales channels
- `POST /onboarding/vtex/sales-channel` – Set VTEX sales channel
- `GET /onboarding/timezone` – Get available timezones
- `POST /onboarding/auth` – Authentication setup
- `GET /onboarding/sync` – Get sync status
- `POST /onboarding/resync` – Retry synchronization

### Webhooks Routes:

- `POST /webhooks/vtex/orders` – Handle VTEX order webhooks
- `POST /webhooks/vtex/products` – Handle VTEX product webhooks

### Support Routes:

- `GET /support/account-status` – Get account status

### Jobs Routes:

- `GET /jobs` – Get jobs status

### Vitals Routes:

- `GET /` – Health check endpoint

---

*Generated following the example format to ensure consistency across documentation.*

