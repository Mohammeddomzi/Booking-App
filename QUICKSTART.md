# Quick Start Guide - Aurora Chalet

Get Aurora Chalet running locally in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- A code editor (VS Code recommended)
- Terminal/Command Line

## Step 1: Install Dependencies (2 min)

```bash
npm install
```

## Step 2: Setup Environment (3 min)

Create `.env` file:

```bash
# Copy example
cp .env.example .env

# Generate NextAuth secret
openssl rand -base64 32
# or use: https://generate-secret.vercel.app/32
```

### Minimum Required Variables for Local Dev

```env
# Database - Use local PostgreSQL or free Supabase
DATABASE_URL="postgresql://postgres:password@localhost:5432/aurora_chalet"

# NextAuth - Paste the generated secret above
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Supabase - Create free account at supabase.com
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
SUPABASE_STORAGE_BUCKET="receipts"

# Stripe - Use test keys from stripe.com/test
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_BASIC_PRICE_ID="price_xxx"
STRIPE_PRO_PRICE_ID="price_xxx"

# Resend - Optional for dev, get free key at resend.com
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="Aurora Chalet <onboarding@resend.dev>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_LOCALE="ar"
```

## Step 3: Setup Database (2 min)

### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy connection string from Settings → Database
3. Add to `.env` as `DATABASE_URL`

### Option B: Local PostgreSQL

```bash
# Install PostgreSQL, then:
createdb aurora_chalet
```

### Run Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

## Step 4: Setup Stripe Test Mode (2 min)

1. Go to [stripe.com/test](https://dashboard.stripe.com/test/dashboard)
2. Get API keys: Developers → API keys
3. Create products: Products → Add Product

**Basic Plan**

- Name: Basic
- Price: 99 (any currency)
- Recurring: Monthly
- Copy Price ID

**Pro Plan**

- Name: Pro
- Price: 299
- Recurring: Monthly
- Copy Price ID

4. Add keys to `.env`

## Step 5: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000/ar](http://localhost:3000/ar) 🎉

## First Steps

### 1. Create Account

1. Go to [http://localhost:3000/ar/auth/signup](http://localhost:3000/ar/auth/signup)
2. Fill in:
   - Your name
   - Email
   - Password (min 8 chars)
   - Organization name (e.g., "My Chalet")
   - Organization slug (e.g., "my-chalet")
3. Click "إنشاء حساب" (Create Account)

### 2. Sign In

1. Go to [http://localhost:3000/ar/auth/signin](http://localhost:3000/ar/auth/signin)
2. Use credentials from step 1
3. You're now in the dashboard!

### 3. Create Your First Property

1. Navigate to "العقارات" (Properties)
2. Click "+ عقار جديد" (New Property)
3. Fill in:
   - Name: "Main Pool"
   - Type: "POOL"
   - Default Price: 500
   - Slot Duration: 60 (minutes)
4. Save

### 4. Create Your First Booking

1. Navigate to "الحجوزات" (Bookings)
2. Click "+ حجز جديد" (New Booking)
3. Fill in the form:
   - Property: Select your property
   - Date: Today
   - Time: Current time
   - Customer Name: "Test Customer"
   - Customer Phone: "0501234567"
   - Total Amount: 500
   - Deposit: 100
4. Save

✅ You now have a working booking system!

## Testing Features

### Test Conflict Detection

1. Create a booking for 2:00 PM - 3:00 PM
2. Try to create another booking for 2:30 PM - 3:30 PM
3. You should see an error: "Time slot conflict"

### Test File Upload

1. Edit a booking
2. Click "رفع صورة الإيصال" (Upload Receipt)
3. Select an image
4. Upload completes and shows "View" link

### Test Stripe Subscription

1. Go to Settings → Billing
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete checkout
6. You're now on Pro plan!

### Test Webhooks Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Test with real events!
```

## Switch Language

- Arabic: [http://localhost:3000/ar](http://localhost:3000/ar)
- English: [http://localhost:3000/en](http://localhost:3000/en)

Or click the globe icon in the header.

## Common Issues

### "Cannot find module @prisma/client"

```bash
npx prisma generate
```

### "Database connection failed"

- Check PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Try with Supabase instead

### "Stripe error: Invalid API key"

- Ensure you're using **test** keys (start with `sk_test_`)
- Copy directly from Stripe Dashboard

### "Upload failed"

- Create `receipts` bucket in Supabase
- Make bucket public
- Verify service role key

## Next Steps

1. **Customize Branding**

   - Update `messages/ar.json` and `messages/en.json`
   - Change colors in `app/globals.css`

2. **Add More Properties**

   - Create different types (pools, chalets, rooms)
   - Set different prices

3. **Configure Availability**

   - Go to "التوافر" (Availability)
   - Set open/close times for specific dates

4. **View Analytics**

   - Upgrade to Pro plan
   - Go to "التحليلات" (Analytics)

5. **Deploy to Production**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Development Commands

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check types
npx tsc --noEmit

# Lint code
npm run lint

# Database studio
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Reset database
npx prisma migrate reset
```

## Need Help?

- Check [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Open an issue on GitHub

---

Happy booking! 🏊‍♂️🏡
