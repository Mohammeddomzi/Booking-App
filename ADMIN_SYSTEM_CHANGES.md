# Admin System Changes - Billing Removed

## Summary
Removed the billing/subscription system and replaced it with an admin-based user management system.

## Database Changes

### Schema Updates (`prisma/schema.prisma`)
1. **Added ADMIN role** to the Role enum
2. **Added `isActive` field** to User model (default: true)
3. **Added `isActive` field** to Organization model (default: true)
4. **Removed all billing fields** from Organization:
   - `plan` (SubscriptionPlan enum)
   - `stripeCustomerId`
   - `stripeSubscriptionId`
   - `subscriptionStatus`
   - `currentPeriodEnd`
5. **Removed SubscriptionPlan enum** entirely

### Migration
Run the migration to apply changes:
```bash
npx prisma migrate deploy
# or
npx prisma db push
```

The migration file is at: `prisma/migrations/20251103_remove_billing_add_admin/migration.sql`

## Files Deleted
1. `app/[locale]/dashboard/settings/billing/page.tsx` - Billing settings page
2. `app/api/stripe/create-checkout/route.ts` - Stripe checkout API
3. `app/api/stripe/create-portal/route.ts` - Stripe portal API  
4. `app/api/stripe/webhook/route.ts` - Stripe webhook handler
5. `lib/stripe.ts` - Stripe configuration

## Files Created

### Admin Dashboard
- **`app/[locale]/dashboard/admin/page.tsx`** - Main admin dashboard
  - View all users and organizations
  - Freeze/Activate users
  - Freeze/Activate organizations
  - Only accessible to users with ADMIN role

### Admin API Routes
- **`app/api/admin/users/route.ts`** - GET all users (admin only)
- **`app/api/admin/users/[id]/route.ts`** - PATCH user to toggle isActive status
- **`app/api/admin/organizations/[id]/route.ts`** - PATCH organization to toggle isActive status

## Files Modified

### Navigation
- **`components/dashboard/nav.tsx`**
  - Removed billing link
  - Added admin link (only visible to ADMIN users)
  - Shows ShieldCheck icon for admin

### Settings
- **`app/[locale]/dashboard/settings/layout.tsx`**
  - Removed billing tab

### Authentication
- **`lib/auth.ts`**
  - Added check for `user.isActive` - blocks frozen users from logging in
  - Added check for `organization.isActive` - blocks users from frozen organizations
  - Admin users bypass organization freeze check

### Translations
- **`messages/en.json`** & **`messages/ar.json`**
  - Changed `"billing"` to `"admin"` in nav section
  - Billing translations remain but are unused

## How to Use the Admin System

### Creating an Admin User
You need to manually set a user's role to ADMIN in the database:

```sql
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';
```

### Admin Capabilities
1. **View all users** - See every user in the system with their organization
2. **Freeze users** - Set `isActive` to false to prevent login
3. **Activate users** - Set `isActive` to true to allow login
4. **Freeze organizations** - Prevent all users in an organization from logging in (except admins)
5. **Activate organizations** - Allow organization users to login again

### Access Control
- Admin dashboard: Only accessible to users with `role = 'ADMIN'`
- Admin API routes: Check for ADMIN role before allowing actions
- Frozen user cannot login (shows error message)
- User in frozen organization cannot login (shows error message)
- Admin users can always login, even if their organization is frozen

## Features
✅ Admin dashboard with full user management
✅ Freeze/unfreeze individual users
✅ Freeze/unfreeze entire organizations
✅ Login blocks for frozen users/organizations
✅ Admin users immune to organization freeze
✅ Clean UI with status badges
✅ Bilingual support (English/Arabic)

## Next Steps
1. Apply the database migration
2. Create your first admin user via SQL
3. Login as admin and access the Admin page from the navigation
4. Manage users and organizations as needed



