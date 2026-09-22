# Digital Heroes

Digital Heroes is a charity-first, subscription-based golf rewards platform that combines golf performance, monthly prize draws, and charitable giving.

Members can subscribe to a plan, select a charity, contribute a percentage of their subscription fee, submit Stableford golf scores, participate in monthly draws, and track winnings. Administrators can manage users, subscriptions, charities, draws, winners, and reports.

## Features

### Public
- Charity-first landing page
- Charity directory
- Charity search and filtering
- Featured charities
- Charity detail pages
- Responsive design

### Members
- Registration and login
- JWT authentication
- Monthly and yearly subscription plans
- Charity selection
- Minimum 10% charity contribution
- Stableford golf score management
- Latest five scores
- Monthly draw participation
- Winner results
- Winner proof submission
- Donation/contribution history
- Subscription status

### Admin
- Admin dashboard
- User management
- Charity CRUD
- Featured/active charity controls
- Draw creation and management
- Draw simulation and publication
- Winner management
- Winner proof verification
- Reports and statistics

### Payments
- PayU TEST mode integration
- Server-side SHA-512 payment hashing
- Payment response validation
- PayU transaction verification
- Payment-gated subscription activation
- Idempotent charity contribution creation
- Hosted payment checkout
- Failed/cancelled payments do not activate subscriptions

> Automatic recurring subscription mandate billing is not currently implemented. The current payment flow is a verified one-time TEST payment for subscription activation.

## Draw System

The monthly draw uses eligible member golf scores and supports three matching tiers:

| Match Tier | Prize Pool Share |
|---|---:|
| 5 Matches | 40% |
| 4 Matches | 35% |
| 3 Matches | 25% |

The 5-match jackpot can include rollover from previous draws. If multiple winners exist in a tier, the applicable prize amount is divided among eligible winners.

## Charity Model

Members select a charity and choose a contribution percentage of their subscription fee.

The minimum contribution is 10%, and members can contribute more.

Example:

```text
Subscription: ₹499
Contribution: 10%
Charity contribution: ₹49.90
```

A charity contribution is recorded only after successful payment verification.

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend
- Node.js
- Express.js
- JWT
- bcryptjs
- dotenv
- CORS
- Multer

### Database
- Supabase
- PostgreSQL

### Payment
- PayU TEST environment
- SHA-512 hashing
- Payment verification
- Webhook/callback handling

### Deployment
- GitHub
- Vercel
- Supabase

## Project Structure

```text
digital-heroes/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── test/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Database

Main Supabase/PostgreSQL entities:

```text
users
charities
subscriptions
scores
draws
draw_entries
winners
winner_proofs
donations
payments
```

Relationship overview:

```text
User
 ├── Subscriptions
 │    └── Charity
 ├── Scores
 ├── Draw Entries
 ├── Winners
 │    └── Winner Proof
 └── Donations

Subscription
 └── Payment
```

## Authentication

Authentication uses JSON Web Tokens.

```text
Login
  ↓
Validate credentials
  ↓
Generate JWT
  ↓
Return token
  ↓
Protected API requests use JWT
```

Passwords are hashed with bcryptjs. Admin routes additionally require administrator authorization.

## API Structure

Base API:

```text
/api
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users

```text
GET /api/users
GET /api/users/:id
```

### Charities

```text
GET    /api/charities
GET    /api/charities/:id
POST   /api/charities
PUT    /api/charities/:id
DELETE /api/charities/:id
```

### Scores

```text
GET    /api/scores
POST   /api/scores
PUT    /api/scores/:id
DELETE /api/scores/:id
```

### Subscriptions

```text
GET  /api/subscriptions
POST /api/subscriptions
```

### Payments

```text
POST /api/payments/payu/initiate
POST /api/payments/payu/success
POST /api/payments/payu/failure
POST /api/payments/payu/cancel
POST /api/payments/payu/webhook
```

### Draws

```text
GET  /api/draws
GET  /api/draws/:id
POST /api/draws
POST /api/draws/:id/simulate
POST /api/draws/:id/publish
POST /api/draws/:id/complete
```

### Draw Entries

```text
GET /api/draw-entries
```

### Winners

```text
GET /api/winners
GET /api/winners/:id
POST /api/winners/:id/proof
PUT /api/winners/:id/verify
```

### Donations

```text
GET /api/donations
```

### Reports

```text
GET /api/reports/users
GET /api/reports/subscriptions
GET /api/reports/donations
GET /api/reports/draws
GET /api/reports/winners
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

ADMIN_SETUP_KEY=your_admin_setup_key
FRONTEND_URL=http://localhost:5173

PAYU_MERCHANT_KEY=your_payu_test_key
PAYU_MERCHANT_SALT=your_payu_test_salt
PAYU_PAYMENT_URL=https://test.payu.in/_payment
PAYU_VERIFY_URL=https://test.payu.in/merchant/postservice.php?form=2

PAYU_SUCCESS_URL=https://your-backend-domain/api/payments/payu/success
PAYU_FAILURE_URL=https://your-backend-domain/api/payments/payu/failure
PAYU_CANCEL_URL=https://your-backend-domain/api/payments/payu/cancel
PAYU_WEBHOOK_URL=https://your-backend-domain/api/payments/payu/webhook
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files or credentials.

Do not expose:
- Supabase service role keys
- JWT secrets
- PayU merchant salt
- PayU merchant credentials
- Admin setup keys
- Passwords or API keys

## Installation

### Requirements

- Node.js
- npm
- Git
- Supabase account
- PayU TEST account for payment testing

### Backend

```bash
cd backend
npm install
npm start
```

Backend:

```text
http://localhost:5000
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Testing

Backend tests use Node.js's built-in test runner.

```bash
cd backend
npm test
```

The automated tests cover:

- PayU checkout hash generation
- PayU salt exclusion
- Response hash validation
- Tampered response rejection
- Payment amount verification
- Payment status handling
- Payment-gated subscription activation
- Donation idempotency
- Authentication middleware
- Admin authorization
- API route contracts

## Frontend Build

```bash
cd frontend
npm run build
```

The production build is generated in:

```text
frontend/dist/
```

## Payment Flow

```text
Member
  ↓
Select subscription
  ↓
Select charity
  ↓
Choose contribution %
  ↓
Enter phone number
  ↓
Create pending subscription
  ↓
Create pending payment
  ↓
PayU TEST checkout
  ↓
Validate payment response
  ↓
Verify transaction with PayU
  ↓
Activate subscription
  ↓
Create charity contribution
```

The application does not store card numbers, CVV, or UPI PIN.

PayU callbacks require a publicly accessible HTTPS backend URL. `localhost` cannot receive external PayU callbacks.

## Winner Verification Flow

```text
Draw completed
  ↓
Winner generated
  ↓
Winner views result
  ↓
Winner uploads proof
  ↓
Admin reviews proof
  ↓
Approved / Rejected
  ↓
Approved
  ↓
Paid
```

## Draw Lifecycle

```text
Draft
  ↓
Simulated
  ↓
Published
  ↓
Completed
```

A completed draw contains winning numbers, match results, prize pool information, winners, and prize distribution.

## Application Routes

### Public

```text
/
/login
/register
/charities
/charities/:id
```

### Member

```text
/dashboard
/scores
/subscription
/donations
/draws
/draws/:id
/winners
/winners/:id
```

### Admin

```text
/admin
/admin/users
/admin/charities
/admin/draws
/admin/winners
/admin/reports
```

## User Roles

### Member

Members can:
- Manage their account
- Subscribe
- Select charities
- Submit golf scores
- View draws
- View winnings
- Submit winner proof
- View donations

### Admin

Admins can:
- Manage users
- Manage charities
- Manage draws
- Manage winners
- Review winner proof
- View reports
- Manage platform operations

## Security

The application uses:

- bcrypt password hashing
- JWT authentication
- Role-based authorization
- Server-side PayU hash generation
- Server-side payment verification
- Payment idempotency
- Environment variable protection
- Supabase service-role key kept server-side
- PayU credentials kept server-side
- Hosted payment checkout

## Responsive UI

The interface is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

The application includes responsive navigation, forms, dashboards, cards, tables, and admin screens.

## UI / UX

Digital Heroes uses a modern charity-first visual direction focused on:

- Trust
- Community
- Charity
- Rewards
- Clear actions
- Simple navigation
- Accessible information hierarchy
- Subtle motion and micro-interactions

Lucide icons are used for interface elements.

## Development Principles

- Separation of frontend and backend concerns
- REST API architecture
- Reusable React components
- Service-based backend logic
- Protected API routes
- Server-side payment processing
- Environment-based configuration
- Database-backed application state
- Idempotent payment fulfillment
- Clear error handling
- Responsive design
- Maintainable project structure

## Deployment

### Frontend

The frontend can be deployed to Vercel.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Production frontend environment:

```env
VITE_API_URL=https://your-backend-domain/api
```

### Backend

The backend requires a Node.js-compatible hosting environment with HTTPS.

Configure all production environment variables on the hosting platform.

PayU callback URLs must point to the deployed backend:

```text
https://your-backend-domain/api/payments/payu/success
https://your-backend-domain/api/payments/payu/failure
https://your-backend-domain/api/payments/payu/cancel
https://your-backend-domain/api/payments/payu/webhook
```

## Current Status

- [x] Authentication
- [x] Member registration
- [x] Member login
- [x] JWT authentication
- [x] Charity directory
- [x] Charity management
- [x] Subscription management
- [x] Charity contribution tracking
- [x] Golf score management
- [x] Latest five score handling
- [x] Monthly draw management
- [x] Draw simulation
- [x] Winner generation
- [x] Winner proof submission
- [x] Winner verification
- [x] Donation tracking
- [x] Admin dashboard
- [x] User management
- [x] Reports
- [x] PayU TEST payment integration
- [x] Payment verification
- [x] Payment idempotency
- [x] Responsive UI
- [x] Automated backend tests
- [x] Production frontend build

## Future Improvements

- Automatic recurring subscription mandates
- Production payment configuration
- Email notifications
- SMS notifications
- Automated scheduled monthly draws
- Automated subscription renewal
- Advanced analytics
- Payment reconciliation
- Automated winner payouts
- Expanded charity event features

## GitHub

Repository:

https://github.com/SHRUTI-GAJJAR/digital-heroes

## Important Notes

This project is currently configured for development/testing and PayU TEST mode.

Before production deployment:

1. Configure production payment credentials.
2. Configure production HTTPS callback URLs.
3. Configure production Supabase settings.
4. Review authentication and authorization.
5. Configure production environment variables.
6. Remove development-only setup functionality.
7. Verify payment webhooks.
8. Test the complete subscription and payment lifecycle.
9. Review database security policies.
10. Never commit secrets to GitHub.

## License

This project was created as a technical assignment/project demonstration.
