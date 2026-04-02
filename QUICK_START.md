# 🚀 Quick Start Guide for Team

## 📋 الأوامر الفورية للبدء

### 1. نسخ الريبو
```bash
git clone https://github.com/your-username/wasel-palestine-api.git
cd wasel-palestine-api
```

### 2. إعداد المشروع
```bash
# تثبيت الاعتماديات
npm install

# إعداد البيئة
cp .env.example .env
# حرر .env وأضف JWT_SECRET

# تشغيل قاعدة البيانات
docker-compose up -d

# تهيئة قاعدة البيانات
npx prisma migrate dev

# إنشاء مستخدم أدمن
npm run db:seed
```

### 3. تشغيل المشروع
```bash
npm run dev
# يشتغل على http://localhost:3000
```

### 4. تجربة الـ API
```bash
# Swagger Documentation
# http://localhost:3000/api

# Health Check
curl http://localhost:3000/health

# تسجيل الدخول (أدمن)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wasel.local","password":"ChangeMeAdmin123!"}'
```

## 👥 توزيع المهام

### 🏛️ Member 1: Infrastructure & Users ✅
- **Completed:** 13 endpoints
- **Files:** `src/modules/auth/`, `src/modules/users/`, `src/modules/admin/`

### 🛣️ Member 2: Road Incidents & Checkpoints
```bash
# سيعمل على:
src/modules/checkpoints/
src/modules/incidents/
# + دمج الـ endpoints القديمة
```

### 📢 Member 3: Crowdsourced Reporting
```bash
# سيعمل على:
src/modules/reports/
# + دمج الـ endpoints القديمة
```

### 🧠 Member 4: Route Intelligence & Alerts
```bash
# سيعمل على:
src/modules/routes/
src/modules/alerts/
# + دمج الـ endpoints القديمة
```

## 🔧 كيفية إضافة Module جديد

```bash
# 1. إنشاء المجلد
mkdir src/modules/your-module

# 2. إنشاء الملفات
touch src/modules/your-module/your-module.controller.ts
touch src/modules/your-module/your-module.service.ts
touch src/modules/your-module/your-module.module.ts
touch src/modules/your-module/dto/

# 3. إضافة الموديول لـ app.module.ts
# 4. إضافة الـ endpoints في Swagger
```

## 📞 المساعدة

### إذا واجهت مشكلة:
1. شوف `API_HANDOVER.md` للتفاصيل
2. جرب `GET /health` للتأكد من قاعدة البيانات
3. جرب تسجيل الدخول بالأدمن
4. اسأل في المجموعة

### للتواصل:
- **GitHub Issues:** للـ bugs
- **Discord/WhatsApp:** للأسئلة السريعة
- **Infrastructure Lead:** لمشاكل الـ Auth + Database

---

**🎯 Deadline: April 17, 2026**

*Let's build this! 🚀*
