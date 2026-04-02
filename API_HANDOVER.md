# 🚀 Wasel Palestine API - Handover Document

## 📋 Overview
**Role:** Infrastructure & Users Module Leader  
**Status:** ✅ COMPLETE - Ready for Team Development  

All foundational infrastructure, authentication, and user management systems are operational. The API is ready for the rest of the team to build upon (parcels, couriers, notifications).

---

## 🏗️ Infrastructure Setup

### ✅ Docker + PostgreSQL
```bash
# Start database
docker-compose up -d

# Database runs on: localhost:15432
# Database name: wasel_palestine_new
# Default credentials: postgres/MyNewPassword
```

### ✅ Prisma Integration
- Schema: `prisma/schema.prisma` 
- Models: User, RefreshToken, PasswordResetToken, AuditLog
- Ready for migrations: `npx prisma migrate dev`

### ✅ Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
# Edit .env with your JWT_SECRET and database settings
```

---

## 🔐 Authentication Endpoints (5/5 ✅)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Create new user account |
| POST | `/auth/login` | Public | Get access + refresh tokens |
| POST | `/auth/refresh` | Authenticated | Rotate access token |
| PATCH | `/auth/password` | Authenticated | Change password (requires current) |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Public | Complete password reset |
| POST | `/auth/logout` | Authenticated | Revoke refresh token |

**Bonus Endpoints:**
- POST `/auth/refresh-token` (alias for refresh)
- GET `/auth/me` (current user info)

---

## 👥 User Management Endpoints (8/8 ✅)

### Profile Management
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users/profile` | Authenticated | Get my profile |
| PATCH | `/users/profile` | Authenticated | Update my profile |

### Admin Controls
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/users` | Admin | List users with pagination & filters |
| GET | `/users/:id` | Admin | Get specific user |
| PUT | `/users/:id` | Admin | Update user (admin) |
| PATCH | `/users/:id/block` | Admin | Block/unblock user |
| DELETE | `/users/:id` | Admin | Delete user permanently |

### System Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | System health check |
| GET | `/admin/audit-logs` | Admin | Audit trail (who did what) |

---

## 🔍 Pagination & Filtering

### Users List (`GET /users`)
```typescript
// Query Parameters
skip?: number      // Default: 0 (pagination offset)
take?: number      // Default: 20, Max: 100
role?: 'USER' | 'ADMIN'  // Filter by role
isBlocked?: boolean      // Filter by block status
search?: string          // Search email, firstName, lastName (case-insensitive)
```

**Example:**
```
GET /users?skip=0&take=50&role=USER&isBlocked=false&search=ahmed
```

### Audit Logs (`GET /admin/audit-logs`)
```typescript
// Query Parameters
skip?: number      // Default: 0
take?: number      // Default: 50, Max: 200
```

---

## 🎯 Admin Seed System

### ✅ Ready to Use
```bash
# After setting up .env, run:
npm run db:seed
```

**Default Admin (if no env vars set):**
- Email: `admin@wasel.local`
- Password: `ChangeMeAdmin123!`

**Custom Admin (recommended):**
```bash
# In .env:
ADMIN_SEED_EMAIL=your-admin@company.com
ADMIN_SEED_PASSWORD=YourSecurePassword123!
```

---

## 🔧 Quick Start for Team

### 1. Environment Setup
```bash
# Clone and install
git clone <repo>
cd wasel-palestine-api
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Start database
docker-compose up -d

# Run migrations (if any)
npx prisma migrate dev

# Seed admin user
npm run db:seed
```

### 2. Start Development
```bash
npm run dev
# API runs on http://localhost:3000
# Swagger docs: http://localhost:3000/api
```

### 3. Test Authentication
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Password123!","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wasel.local","password":"ChangeMeAdmin123!"}'
```

---

## 📊 Database Schema Highlights

### User Model
```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  phone?: string
  address?: string
  role: 'USER' | 'ADMIN'
  isBlocked: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Security Features
- Password hashing with bcrypt (10 rounds)
- JWT access tokens (15 min default)
- Refresh tokens (30 days, rotatable)
- Password reset tokens (time-limited)
- Audit logging for admin actions
- Role-based access control

---

## 🎮 Next Steps for Team

### ✅ What's Ready
- [x] Complete authentication system
- [x] User management (CRUD + admin)
- [x] Role-based permissions
- [x] Audit logging
- [x] Database infrastructure
- [x] Admin seed user
- [x] Health checks
- [x] Swagger documentation

### 🚀 What Team Can Build Now
1. **Parcels Module** - Link parcels to users via `userId`
2. **Couriers Module** - Use existing user authentication
3. **Notifications Module** - Reference users for notifications
4. **Business Logic** - All user data and permissions ready

### 🔐 How to Use Authentication
```typescript
// In any new controller
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Get('my-endpoint')
async myEndpoint(@CurrentUser() user: JwtPayloadUser) {
  // user.userId, user.email, user.role available
}
```

### 🛡️ How to Use Admin Permissions
```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Get('admin-only')
async adminEndpoint() {
  // Only accessible by ADMIN role users
}
```

---

## 📞 Support & Reference

### 📚 Key Files to Reference
- `src/modules/users/` - User management logic
- `src/modules/auth/` - Authentication implementation  
- `src/modules/admin/` - Admin controls & audit
- `prisma/schema.prisma` - Database structure
- `.env.example` - Environment variables

### 🔍 Debugging Tips
- Check `/health` endpoint for system status
- Review `/admin/audit-logs` for admin actions
- Use Swagger UI at `/api` for testing endpoints
- All authentication errors include clear messages

---

## ✅ Handover Complete

**Status:** 🎉 **READY FOR TEAM DEVELOPMENT**

The foundation is solid, tested, and documented. The rest of the team can now confidently build the business modules knowing that authentication, user management, and infrastructure are fully operational.

*Built with ❤️ by the Infrastructure & Users Module Leader*
