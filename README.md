# Law-Firm-Solutions-Server

> **Supreme Court Chamber Legal Litigation & Case Management REST API Server**  
> Built with Node.js, Express, TypeScript, Mongoose, MongoDB Atlas, and JSON Web Tokens (JWT) Authentication.

---

## 🏛️ Project Architecture

```
law-firm-solutions-server/
├── dist/                           # Compiled production JavaScript files
├── src/
│   ├── config/
│   │   ├── db.ts                   # MongoDB Atlas Mongoose connection
│   │   └── env.ts                  # Typed environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts      # Authentication & JWT token management
│   │   ├── case.controller.ts      # Litigation case records & status updates
│   │   ├── institution.controller.ts # Bank and corporate client management
│   │   ├── user.controller.ts      # Practitioners, RBAC & profile management
│   │   └── activityLog.controller.ts # Forensic audit trail logging
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # JWT verification & role authorization (admin/advocate/associate)
│   │   ├── error.middleware.ts     # Global exception handler & 404 handler
│   │   └── validate.middleware.ts  # Zod request validation
│   ├── models/
│   │   ├── User.model.ts           # Practitioner schema & bcrypt password hashing
│   │   ├── Case.model.ts           # Court case schema (Parties, Chamber File No, Dates)
│   │   ├── Institution.model.ts    # Financial institutions schema
│   │   ├── ActivityLog.model.ts    # Chamber activity audit trail
│   │   └── Setting.model.ts        # Chamber configuration
│   ├── routes/
│   │   ├── index.ts                # Root API router & Health check (/api/v1/health)
│   │   ├── auth.routes.ts          # /api/v1/auth
│   │   ├── case.routes.ts          # /api/v1/cases
│   │   ├── institution.routes.ts   # /api/v1/institutions
│   │   ├── user.routes.ts          # /api/v1/users
│   │   └── activityLog.routes.ts   # /api/v1/activity-logs
│   ├── types/
│   │   └── index.ts                # Express AuthenticatedRequest & JWT payload types
│   ├── utils/
│   │   ├── jwt.ts                  # Access & Refresh token signing & verification
│   │   └── response.ts             # Standardized API response builder
│   ├── app.ts                      # Express app setup, CORS, Helmet, Compression
│   └── server.ts                   # Server entry point & graceful shutdown
├── .env.example                    # Sample environment variables
├── .gitignore                      # Safe ignore list (ignores .env, node_modules, dist)
├── package.json                    # Dependencies & npm scripts
└── tsconfig.json                   # Strict TypeScript compiler options
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript (`tsc`, `tsx`, `ts-node-dev`)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JSON Web Token (JWT) with HTTP-Only Cookies & Bearer Headers
- **Security & Utilities**: BcryptJS, Helmet, CORS, Compression, Cookie-Parser, Morgan, Zod

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
cd law-firm-solutions-server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/law_firm_solutions?retryWrites=true&w=majority
JWT_TOKEN_SECRET=your_jwt_secret_token_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d
BCRYPT_SALT_ROUNDS=10
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛡️ License
Private and Confidential © Supreme Court Chamber Solutions.
