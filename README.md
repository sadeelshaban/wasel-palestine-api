# 🚀 Wasel Palestine - Smart Mobility Platform

**Advanced Software Engineering - Spring 2026**  
**Dr. Amjad AbuHassan**

A RESTful API-centric smart mobility platform designed to support Palestinians in navigating daily movement challenges by providing structured, reliable, and up-to-date mobility intelligence.

## 🎯 Project Overview

Wasel Palestine aggregates data related to road conditions, checkpoints, traffic incidents, and environmental factors, exposing this information through a well-defined backend API that can be consumed by mobile applications, web dashboards, or third-party systems.

## 🏗️ Technology Stack

- **Backend:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (Access + Refresh Tokens)
- **Containerization:** Docker & Docker Compose
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest + k6 (Performance Testing)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Setup
```bash
# Clone repository
git clone https://github.com/your-team/wasel-palestine-api.git
cd wasel-palestine-api

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Seed admin user
npm run db:seed

# Start development server
npm run dev
```

### Default Admin User
- Email: `admin@wasel.local`
- Password: `ChangeMeAdmin123!`

## 📚 API Documentation

- **Swagger UI:** `http://localhost:3000/api`
- **Production Endpoints:** `/api/v1/...`
- **Authentication:** Bearer Token (JWT)

## 👥 Team Structure & Responsibilities

### 🏛️ Member 1: Infrastructure & Users Lead ✅
**Completed Features:**
- ✅ NestJS architecture setup
- ✅ Docker + PostgreSQL integration
- ✅ Authentication system (5 endpoints)
- ✅ User management (6 endpoints)
- ✅ System utilities (2 endpoints)
- ✅ Audit logging system
- ✅ API documentation foundation

**Endpoints Delivered:**
- Authentication: Register, Login, Refresh, Change Password, Forgot/Reset Password
- Users: Profile (GET/PATCH), Admin Controls (CRUD), Block/Delete
- System: Health Check, Audit Logs

---

### 🛣️ Member 2: Road Incidents & Checkpoint Management
**Planned Features:**
- Checkpoint registry with status history
- Incident categorization (closure, delay, accident, weather)
- Authorized user moderation workflow
- Filtering, sorting, and pagination

**Endpoints to Implement:**
```
POST /api/v1/checkpoints
GET /api/v1/checkpoints (paginated, filtered)
PUT /api/v1/checkpoints/:id
DELETE /api/v1/checkpoints/:id
POST /api/v1/incidents
GET /api/v1/incidents
PUT /api/v1/incidents/:id
```

---

### 📢 Member 3: Crowdsourced Reporting System
**Planned Features:**
- Citizen report submission
- Geographic location & categorization
- Validation & abuse prevention
- Duplicate detection
- Community credibility scoring

**Endpoints to Implement:**
```
POST /api/v1/reports
GET /api/v1/reports
PUT /api/v1/reports/:id/moderate
GET /api/v1/reports/duplicates
```

---

### 🧠 Member 4: Route Intelligence & Alerts
**Planned Features:**
- Route estimation with metadata
- Constraint-based routing (avoid checkpoints/areas)
- Alert subscription system
- External API integration (OpenStreetMap, Weather)

**Endpoints to Implement:**
```
GET /api/v1/routes/estimate
POST /api/v1/alerts/subscribe
GET /api/v1/alerts/user/:userId
GET /api/v1/external/weather
GET /api/v1/external/geocoding
```

## 🗄️ Database Schema

### Core Models
- **User:** Authentication & role management
- **Checkpoint:** Geographic mobility points
- **Incident:** Road events & disruptions
- **Report:** Crowdsourced submissions
- **Alert:** User notification preferences
- **AuditLog:** System activity tracking

## 🔐 Authentication Flow

1. **Register:** Create account → Receive tokens
2. **Login:** Email/password → JWT access + refresh tokens
3. **Refresh:** Use refresh token → New access token
4. **Authorization:** Role-based access control (USER/ADMIN)

## 📊 Performance Testing

### Required Scenarios (k6)
- Read-heavy workloads (incident listing)
- Write-heavy workloads (report submissions)
- Mixed workloads
- Spike testing
- Sustained load (soak testing)

### Metrics to Track
- Average response time
- P95 latency
- Throughput
- Error rate
- Bottleneck identification

## 🔧 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes & commit
git add .
git commit -m "feat: add your feature description"

# Push & create PR
git push origin feature/your-feature-name
# Create Pull Request on GitHub
```

### Branch Naming Convention
- `feature/endpoint-name`
- `fix/bug-description`
- `docs/documentation-updates`
- `test/performance-tests`

## 📝 API Documentation Standards

### Required Documentation (API-Dog)
- Endpoint descriptions
- Authentication flows
- Request/response schemas
- Error formats
- Environment configurations

## 🚀 Deployment

### Docker Deployment
```bash
# Build production image
docker build -t wasel-api .

# Run with environment
docker run -p 3000:3000 --env-file .env wasel-api
```

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES_SECS=900
```

## 📋 Project Deliverables

### ✅ Completed
- [x] Infrastructure setup
- [x] Authentication system
- [x] User management
- [x] Database schema
- [x] API documentation foundation

### 🚧 In Progress
- [ ] Road incidents module
- [ ] Crowdsourcing system
- [ ] Route intelligence
- [ ] External API integrations
- [ ] Performance testing
- [ ] Complete documentation

## 📞 Support & Communication

### Team Communication
- **Code Reviews:** Required for all PRs
- **Standups:** Daily progress updates
- **Documentation:** Keep README and API docs updated

### Getting Help
1. Check `API_HANDOVER.md` for detailed API documentation
2. Review existing code patterns in `src/modules/`
3. Consult project requirements document
4. Contact Infrastructure Lead for authentication/database issues

---

**🎯 Deadline: April 17, 2026**

*Built with ❤️ by the Advanced Software Engineering Team*
