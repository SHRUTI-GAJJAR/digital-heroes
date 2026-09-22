# ⛳ Digital Heroes

### **Play Golf. Make an Impact. Share the Reward.**

Digital Heroes is a charity-first golf rewards platform where active
subscribers can record their Stableford scores, participate in monthly
number draws, support a chosen charity, and potentially earn a share of
the monthly prize pool.

> **Live Demo:** https://digital-heroes-ashy-five.vercel.app/
> **Backend API:** https://digital-heroes-backend-wylf.onrender.com\
> **Repository:**
> https://github.com/SHRUTI-GAJJAR/digital-heroes/tree/digital-hero

------------------------------------------------------------------------

## ✨ Overview

Digital Heroes combines golf performance, monthly rewards,
subscriptions, and charitable giving into one web application.

The platform provides three main experiences:

-   🌱 **Public experience** --- discover the concept, charities, and
    monthly draw mechanics.
-   ⛳ **Member experience** --- subscribe, select a charity, manage
    Stableford scores, participate in draws, view winnings, and submit
    winner proof.
-   🛡️ **Admin experience** --- manage members, charities, draws,
    winners, verification, payouts, and reporting.

The application was designed with a modern, charity-first visual
direction rather than a traditional golf-club aesthetic.

------------------------------------------------------------------------

## 🎯 Core Features

### 👤 Authentication & Members

-   Member registration and login
-   JWT-based authentication
-   Protected member routes
-   Admin role support
-   Member profile and account information
-   Separate member and admin experiences

### ⛳ Golf Scores

-   Add Stableford scores from **1--45**
-   Required score date
-   Edit existing scores
-   Delete scores
-   Newest scores displayed first
-   Only the **latest 5 scores** are retained

### 💳 Subscription

-   Monthly and yearly plan options
-   Charity selection during subscription
-   Charity contribution support
-   Subscription status tracking
-   Start and renewal information
-   Cancellation handling
-   PayU TEST payment integration

> **Payment testing uses PayU sandbox/test mode. No real-money
> transaction is required for the demonstration.**

### 🎲 Monthly Draws

-   Monthly draw records
-   Published winning numbers
-   5 / 4 / 3-number matching tiers
-   Draw participation for active subscribers
-   Draw simulation and completion
-   Prize pool calculation
-   Jackpot rollover support
-   Winner generation after draw completion

### 🏆 Winner Verification

-   Winner records generated from completed draws
-   Match type and prize amount
-   Winner proof upload
-   JPG / PNG / WEBP / PDF support
-   Admin verification
-   Pending → Approved / Rejected workflow
-   Pending → Paid payout workflow

### ❤️ Charity

-   Charity directory
-   Charity categories
-   Search and filtering
-   Featured charities
-   Charity detail pages
-   Charity website links
-   Charity contribution tracking
-   Donation impact reporting

### 📊 Admin Dashboard

Administrators can manage:

-   👥 Members
-   ❤️ Charities
-   🎲 Monthly draws
-   🏆 Winners
-   📈 Reports
-   💰 Prize pools
-   ✅ Winner verification and payout status

### 📱 Responsive UI

The application is designed to work across:

-   Desktop
-   Tablet
-   Mobile

The interface includes responsive layouts, modern cards, status badges,
subtle interactions, and Lucide icons.

------------------------------------------------------------------------

## 🧭 Application Flow

``` text
Visitor
   │
   ├── Explore Digital Heroes
   ├── Explore Charities
   └── View Draw Concept
           │
           ▼
       Register / Login
           │
           ▼
     Select Charity + Plan
           │
           ▼
      PayU TEST Payment
           │
           ▼
    Active Subscription
           │
           ├── Add Golf Scores
           ├── View Charity Impact
           └── Participate in Monthly Draw
                       │
                       ▼
                 Draw Completed
                       │
                       ▼
                 Match Calculation
                       │
              ┌────────┴────────┐
              ▼                 ▼
          No Winner           Winner
                                  │
                                  ▼
                           Upload Proof
                                  │
                                  ▼
                           Admin Review
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                      Reject            Approve
                                           │
                                           ▼
                                         Paid
```

------------------------------------------------------------------------

## 🏅 Prize Matching

The monthly draw supports three matching tiers:

  Match       Reward Tier
  ----------- --------------------
  5 numbers   Highest prize tier
  4 numbers   Middle prize tier
  3 numbers   Entry prize tier

The prize pool is calculated according to the application rules,
including rollover handling where applicable.

------------------------------------------------------------------------

## ❤️ Charity Contribution

Digital Heroes is designed around a charity-first model.

Members choose a charity as part of their subscription experience. The
platform records the resulting charity contribution and exposes the
impact through member and admin reporting.

Example charity categories include:

-   Children
-   Education
-   Environment
-   Community
-   Animal Welfare
-   Healthcare

------------------------------------------------------------------------

## 🛠️ Technology Stack

### Frontend

-   **React**
-   **Vite**
-   **React Router**
-   **Axios**
-   **Lucide React**
-   Modern responsive CSS

### Backend

-   **Node.js**
-   **Express.js**
-   **JWT**
-   **bcryptjs**
-   **Multer**
-   **dotenv**
-   **CORS**

### Database

-   **Supabase**
-   **PostgreSQL**
-   Row Level Security
-   Relational data model

### Payments

-   **PayU TEST / Sandbox**

### Deployment

-   **Vercel** --- Frontend
-   **Render** --- Backend
-   **Supabase** --- Database

------------------------------------------------------------------------

## 🗂️ Project Structure

``` text
digital-heroes/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

------------------------------------------------------------------------

## 🔐 Security & Configuration

Sensitive configuration is kept outside the repository using environment
variables.

Important environment values include:

``` env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_SETUP_KEY=your_admin_setup_key
FRONTEND_URL=your_frontend_url
```

Frontend configuration uses:

``` env
VITE_API_URL=your_backend_api_url
```

> **Never commit `.env` files, service-role keys, JWT secrets, payment
> secrets, or other credentials to GitHub.**

------------------------------------------------------------------------

## 💳 PayU TEST Mode

The project uses PayU TEST mode for payment demonstration.

The payment flow is designed so that a subscription becomes active only
after successful server-side payment confirmation.

### Payment flow

``` text
Subscription Request
        ↓
Create Inactive Subscription
        ↓
Create Pending Payment
        ↓
PayU TEST Checkout
        ↓
PayU Callback / Verification
        ↓
Server-side Transaction Validation
        ↓
Activate Subscription
        ↓
Create Charity Contribution
```

Failed, cancelled, or unverified transactions do not activate the
subscription.

> **No real-money payment is required for the project demonstration.**

------------------------------------------------------------------------

## 🧪 Tested Functionality

The following major flows were tested during development:

-   [x] Registration
-   [x] Login
-   [x] Protected routes
-   [x] Admin access
-   [x] Charity browsing
-   [x] Charity selection
-   [x] Subscription creation
-   [x] PayU TEST payment
-   [x] Subscription activation
-   [x] Charity contribution
-   [x] Add score
-   [x] Edit score
-   [x] Delete score
-   [x] Latest-five score retention
-   [x] Monthly draw participation
-   [x] Draw completion
-   [x] Winning number matching
-   [x] Winner creation
-   [x] Winner proof workflow
-   [x] Admin winner approval
-   [x] Winner payout status
-   [x] Admin reports
-   [x] Responsive layout
-   [x] Production frontend deployment
-   [x] Production backend deployment

------------------------------------------------------------------------

## 🚀 Local Development

### 1. Clone the repository

``` bash
git clone -b digital-hero https://github.com/SHRUTI-GAJJAR/digital-heroes.git
cd digital-heroes
```

### 2. Backend

``` bash
cd backend
npm install
```

Create a `.env` file with the required backend configuration.

Then start the server:

``` bash
npm run dev
```

The backend runs on:

``` text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

``` bash
cd frontend
npm install
```

Create a `.env` file:

``` env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

``` bash
npm run dev
```

The Vite development server normally runs on:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

## 🌐 Production

### Frontend

**Vercel**

https://digital-heroes-ashy-five.vercel.app/

### Backend

**Render**

https://digital-heroes-backend-wylf.onrender.com

### Database

**Supabase**

The production backend connects to the configured Supabase PostgreSQL
database using server-side credentials.

------------------------------------------------------------------------

## 🧑‍💻 Demo Credentials

For evaluation, use the test credentials supplied separately with the
assignment submission.

### Member

``` text
Email: <YOUR_MEMBER_EMAIL>
Password: <YOUR_MEMBER_PASSWORD>
```

### Admin

``` text
Email: <YOUR_ADMIN_EMAIL>
Password: <YOUR_ADMIN_PASSWORD>
```

> Replace the placeholders above with the credentials you provide to the
> evaluator. Do not commit passwords or secrets to GitHub.

------------------------------------------------------------------------

## 📌 Important Demo Notes

-   Payment is configured for **PayU TEST/Sandbox mode**.
-   No real money should be used for evaluation.
-   The monthly draw and winner lifecycle can be demonstrated from the
    admin dashboard.
-   Winner proof is intended for winner verification.
-   Admin functionality requires an account with the admin role.
-   Production secrets are stored in deployment environment variables
    rather than the repository.

------------------------------------------------------------------------

## 🎨 Design Direction

The UI follows a modern, clean, charity-first visual system:

-   Soft neutral backgrounds
-   Deep teal primary branding
-   Green charity accents
-   Rounded cards
-   Clear status badges
-   Strong typography hierarchy
-   Responsive layouts
-   Lucide iconography
-   Subtle motion and micro-interactions
-   Prominent subscription and charity calls-to-action

The goal is to make the platform feel like a modern impact-focused
rewards product rather than a traditional golf website.

------------------------------------------------------------------------

## 📈 Future Improvements

Potential future production enhancements include:

-   Automated recurring subscription billing
-   Full payment mandate/recurring-payment support
-   Email notifications for subscription and winner events
-   More advanced draw analytics
-   Automated winner notifications
-   Additional charity events and campaigns
-   Expanded reporting and export tools
-   More comprehensive automated test coverage

------------------------------------------------------------------------

## 👩‍💻 Author

**Shruti Ujeniya**

Full-Stack Web Developer

Built with:

**React • Node.js • Express.js • Supabase • PostgreSQL • PayU • Vercel •
Render**

------------------------------------------------------------------------

## 📄 License

This project was created as a technical assignment and demonstration
project.

Unless otherwise stated, the source code and project assets are intended
for evaluation and demonstration purposes.
