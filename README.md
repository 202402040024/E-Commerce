# ShopHub - Full-Stack E-Commerce Application

A production-ready E-Commerce application built with **Next.js 15**, **TypeScript**, **MongoDB Atlas**, **NextAuth.js**, and **Tailwind CSS**.

## 🚀 Features

### User Features
- ✅ User Registration & Login with JWT authentication
- ✅ Password strength indicator & show/hide password
- ✅ Role-based access control (User / Admin)
- ✅ Shopping Cart (persisted with Zustand)
- ✅ Wishlist management
- ✅ Product search & filters (category, price, rating)
- ✅ Product detail page with image gallery
- ✅ Checkout with address & payment method
- ✅ Order history
- ✅ User profile management & password change
- ✅ Dark mode support

### Admin Features
- ✅ Admin dashboard with analytics charts
- ✅ Product management (CRUD)
- ✅ User management (block/unblock/delete)
- ✅ Order management with status updates
- ✅ Reviews management
- ✅ Analytics with Recharts (Revenue, User Growth, Top Products)

### UI/UX
- ✅ Responsive (mobile-first)
- ✅ Dark/Light mode
- ✅ Framer Motion animations
- ✅ Skeleton loaders
- ✅ Toast notifications
- ✅ Glassmorphism effects
- ✅ Professional navbar with sticky scroll

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| State Management | Zustand (cart), React Hook Form |
| Validation | Zod |
| Database | MongoDB Atlas + Mongoose |
| Authentication | NextAuth.js v5 (Auth.js) + JWT |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Password Hashing | bcryptjs |

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/           # User-facing pages with Navbar + Footer
│   │   ├── page.tsx      # Home page
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── products/     # Products listing & detail
│   │   ├── cart/         # Shopping cart
│   │   ├── checkout/     # Checkout
│   │   ├── orders/       # Order history
│   │   ├── profile/      # User profile
│   │   ├── wishlist/     # Wishlist
│   │   ├── mens/         # Men's category
│   │   ├── womens/       # Women's category
│   │   ├── kids/         # Kids category
│   │   └── about/        # About page
│   ├── admin/            # Admin panel (dark theme)
│   │   ├── login/        # Admin login
│   │   └── (panel)/      # Admin pages with sidebar
│   │       ├── dashboard/
│   │       ├── products/ (list, add, edit/[id])
│   │       ├── users/    (list, [id])
│   │       ├── orders/
│   │       ├── reviews/
│   │       ├── analytics/
│   │       └── settings/
│   └── api/              # API Routes
│       ├── auth/         # NextAuth + register
│       ├── products/     # CRUD
│       ├── cart/         # Cart operations
│       ├── wishlist/     # Wishlist
│       ├── orders/       # Orders
│       ├── users/        # User management
│       └── admin/        # Admin-only APIs
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── home/             # Hero, Categories, etc.
│   ├── products/         # ProductCard, CategoryPage, StarRating
│   ├── admin/            # AdminSidebar
│   ├── providers/        # Auth, Theme providers
│   └── ui/               # Button, Input, Badge, Card, Skeleton
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # MongoDB connection
│   ├── seeder.ts         # Admin + product seeder
│   └── utils.ts          # Helper functions
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Cart.ts
│   ├── Order.ts
│   └── Wishlist.ts
├── hooks/
│   └── useCart.ts        # Zustand cart store
├── middleware.ts          # Route protection
└── types/                # TypeScript types
```

## ⚙️ Setup Instructions

### 1. Clone & Install

```bash
cd ecommerce
npm install
```

### 2. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get your connection string
4. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecommerce
```

### 3. Configure Environment Variables

Update `.env.local` with your values:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_32_char_secret
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Admin Panel

Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Default credentials:**
- Email: `admin@example.com`
- Password: `Admin@123`

> The admin account and sample products are **auto-seeded** on first API call.

## 🗄️ Database Models

### User
```typescript
{ name, email, password (hashed), role: 'user'|'admin', isBlocked, createdAt }
```

### Product
```typescript
{ name, description, price, discountPrice, images[], category, subcategory, brand, stock, rating, reviews[], featured, isActive }
```

### Cart
```typescript
{ userId, products: [{ productId, quantity }] }
```

### Order
```typescript
{ userId, products[], totalAmount, shippingAddress, paymentStatus, paymentMethod, orderStatus }
```

### Wishlist
```typescript
{ userId, products: [productId] }
```

## 🔐 Security Features

- bcrypt password hashing (12 rounds)
- JWT session tokens
- Role-based route protection via middleware
- Zod input validation on all API routes
- Admin-only API endpoints enforced server-side

## 🏗️ Build for Production

```bash
npm run build
npm start
```

---

Built with ❤️ using Next.js 15 + MongoDB Atlas
