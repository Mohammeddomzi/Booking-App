# Aurora Chalet 🏊‍♂️

A comprehensive multi-tenant SaaS platform for managing private pool and chalet bookings. Built with Next.js 14, TypeScript, and modern web technologies with full Arabic (RTL) and English support.

## 🌟 Features

### Core Functionality

- **Multi-tenant Architecture**: Each organization has isolated data and subscriptions
- **Booking Management**: Create, update, and track bookings with conflict detection
- **Property Management**: Manage multiple properties (pools, chalets) with custom pricing
- **Availability Calendar**: Set property availability and time slots
- **Arabic-First UI**: Full RTL support with Arabic and English translations
- **Role-Based Access Control**: OWNER, MANAGER, and STAFF roles with different permissions

### Business Features

- **Stripe Integration**: Monthly subscriptions (Basic & Pro plans)
- **Payment Tracking**: Deposit and total amount management
- **Receipt Upload**: Store booking receipts via Supabase Storage
- **Email Notifications**: Automated booking confirmations in Arabic
- **Analytics Dashboard**: Revenue, bookings, and occupancy metrics (Pro plan)
- **Status Management**: PENDING, CONFIRMED, PAID, CANCELLED, NO_SHOW, COMPLETED

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Payments**: Stripe subscriptions and webhooks
- **Storage**: Supabase for file uploads
- **Email**: Resend for transactional emails
- **Internationalization**: next-intl (Arabic RTL + English)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database (Supabase recommended)
- Stripe account for payments
- Supabase account for file storage
- Resend account for emails (optional for dev)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd aurora-chalet
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:5432/aurora_chalet?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="receipts"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_BASIC_PRICE_ID="price_basic_monthly"
STRIPE_PRO_PRICE_ID="price_pro_monthly"

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Aurora Chalet <bookings@yourdomain.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_LOCALE="ar"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 4. Stripe Setup

1. Create products in Stripe Dashboard:

   - **Basic Plan**: 99 SAR/month
   - **Pro Plan**: 299 SAR/month

2. Copy the Price IDs to your `.env` file

3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Supabase Storage Setup

1. Create a bucket named `receipts` in Supabase Storage
2. Set bucket policies to allow authenticated uploads
3. Copy your project URL and keys to `.env`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/ar](http://localhost:3000/ar) for Arabic or [http://localhost:3000/en](http://localhost:3000/en) for English.

## 📁 Project Structure

```
aurora-chalet/
├── app/
│   ├── [locale]/
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Protected dashboard pages
│   │   │   ├── bookings/      # Booking management
│   │   │   ├── properties/    # Property management
│   │   │   ├── availability/  # Availability calendar
│   │   │   ├── analytics/     # Analytics dashboard
│   │   │   └── settings/      # Settings pages
│   │   ├── layout.tsx         # Root layout with i18n
│   │   └── page.tsx           # Home page
│   └── api/
│       ├── auth/              # NextAuth endpoints
│       ├── bookings/          # Booking CRUD APIs
│       ├── properties/        # Property CRUD APIs
│       ├── availability/      # Availability APIs
│       ├── stripe/            # Stripe webhooks
│       ├── upload/            # File upload APIs
│       └── organization/      # Organization APIs
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── bookings/              # Booking-related components
│   ├── properties/            # Property components
│   └── dashboard/             # Dashboard layout components
├── lib/
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # NextAuth configuration
│   ├── stripe.ts              # Stripe helpers
│   ├── supabase.ts            # Supabase client
│   ├── mail.ts                # Email templates
│   ├── validations.ts         # Zod schemas
│   └── utils.ts               # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── messages/
│   ├── ar.json                # Arabic translations
│   └── en.json                # English translations
└── middleware.ts              # Auth & i18n middleware
```

## 🔐 Authentication & Authorization

### User Roles

1. **OWNER**: Full access, billing management, org settings
2. **MANAGER**: Create/edit bookings, properties, availability
3. **STAFF**: Create bookings, view data (no delete/billing)

### Default Credentials

After signup, you can create users with different roles via the database or future admin panel.

## 💳 Subscription Plans

### Basic Plan - 99 SAR/month

- Up to 100 bookings/month
- Single property
- Email notifications
- Basic support

### Pro Plan - 299 SAR/month

- Unlimited bookings
- Multiple properties
- Email notifications
- Advanced analytics
- Payment processing
- Priority support

## 📧 Email Notifications

Automated Arabic emails are sent for:

- Booking confirmation
- Booking status changes
- (Future) Reminders and receipts

Configure `RESEND_FROM_EMAIL` with your verified domain.

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy!

```bash
vercel --prod
```

### Environment Variables on Vercel

Add all variables from `.env` in Vercel Dashboard → Settings → Environment Variables

### Post-Deployment

1. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
2. Update Stripe webhook URL
3. Test authentication and payments
4. Configure custom domain

## 🔧 Development

### Prisma Commands

```bash
# Create migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset

# Studio (GUI)
npx prisma studio

# Format schema
npx prisma format
```

### Code Quality

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## 📱 Key Features Guide

### Conflict-Free Bookings

The system automatically checks for overlapping bookings:

- Compares date + time slots
- Prevents double booking
- Returns clear error messages

### Multi-Tenant Isolation

- All queries scoped by `organizationId`
- Middleware enforces org-level access
- Separate data for each subscription

### Arabic RTL Support

- Automatic direction switching based on locale
- All UI components RTL-compatible
- Arabic-first translations with English fallback

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase connection pooler settings
- Use `?pgbouncer=true` for connection pooling

### Stripe Webhook Errors

- Verify webhook secret matches
- Check webhook endpoint is accessible
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Upload Errors

- Verify Supabase bucket exists and is public
- Check service role key has proper permissions
- Ensure file size limits are configured

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a PR

## 📞 Support

For issues or questions:

- Open a GitHub issue
- Contact: support@aurorachalet.com (configure this)

---

Built with ❤️ using Next.js, Prisma, Stripe, and Supabase
