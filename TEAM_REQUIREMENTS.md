# 🚀 Team Requirements & Setup Guide

## 📋 **متطلبات التشغيل الأساسية**

### 🔧 **Prerequisites (مطلوب قبل البدء):**
```bash
# 1. Node.js 18+
node --version

# 2. Docker & Docker Compose
docker --version
docker-compose --version

# 3. Git
git --version
```

---

## 🐳 **Docker Setup (قاعدة البيانات):**

### **ملف docker-compose.yml جاهز:**
```yaml
services:
  db:
    image: postgres:16-bookworm
    container_name: wasel_db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: MyNewPassword
      POSTGRES_DB: wasel_palestine_new
    ports:
      - "15432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### **أوامر Docker:**
```bash
# 1. تشغيل قاعدة البيانات
docker-compose up -d

# 2. التحقق من الحالة
docker-compose ps

# 3. إيقاف قاعدة البيانات
docker-compose down

# 4. إعادة تشغيل مع حذف البيانات (إذا لزم)
docker-compose down -v
docker-compose up -d
```

---

## 🗄️ **Database Configuration:**

### **معلومات الاتصال:**
- **Type:** PostgreSQL 16
- **Host:** localhost
- **Port:** 15432
- **Database:** wasel_palestine_new
- **User:** postgres
- **Password:** MyNewPassword

### **Connection String:**
```bash
postgresql://postgres:MyNewPassword@localhost:15432/wasel_palestine_new?schema=public
```

---

## 📝 **Environment Setup (.env):**

### **إنشاء ملف .env:**
```bash
# 1. نسخ المثال
cp .env.example .env

# 2. تعديل القيم
notepad .env
```

### **المتغيرات المطلوبة:**
```bash
# قاعدة البيانات
DATABASE_URL="postgresql://postgres:MyNewPassword@localhost:15432/wasel_palestine_new?schema=public"

# المصادقة
JWT_SECRET="your-secret-key-here-minimum-32-characters"
JWT_ACCESS_EXPIRES_SECS=900

# مستخدم الأدمن (اختياري)
ADMIN_SEED_EMAIL=admin@wasel.local
ADMIN_SEED_PASSWORD=ChangeMeAdmin123!

# البيئة
NODE_ENV=development
PORT=3000
```

---

## 🚀 **خطوات التشغيل الكاملة:**

### **الخطوة 1: نسخ الريبو:**
```bash
git clone https://github.com/sadeelshaban/wasel-palestine-api.git
cd wasel-palestine-api
```

### **الخطوة 2: تثبيت الاعتماديات:**
```bash
npm install
```

### **الخطوة 3: إعداد البيئة:**
```bash
cp .env.example .env
# حرر الملف وأضف JWT_SECRET
```

### **الخطوة 4: تشغيل قاعدة البيانات:**
```bash
docker-compose up -d
```

### **الخطوة 5: تهيئة قاعدة البيانات:**
```bash
# 1. إنشاء الجداول
npx prisma migrate dev

# 2. إنشاء مستخدم أدمن
npm run db:seed
```

### **الخطوة 6: تشغيل المشروع:**
```bash
npm run dev
```

---

## 🔍 **التحقق من كل شيء:**

### **1. التحقق من قاعدة البيانات:**
```bash
# التحقق من حاوية Docker
docker ps | grep wasel_db

# التحقق من الاتصال
npx prisma db pull
```

### **2. التحقق من المشروع:**
```bash
# Health Check
curl http://localhost:3000/health

# Swagger Documentation
# افتح المتصفح على: http://localhost:3000/api
```

### **3. اختبار تسجيل الدخول:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wasel.local","password":"ChangeMeAdmin123!"}'
```

---

## 🛠️ **حل المشاكل الشائعة:**

### **مشكلة Docker:**
```bash
# إذا لم يعمل Docker
docker-compose down -v
docker-compose up -d

# إذا كان البورت مشغول
netstat -ano | findstr :15432
```

### **مشكلة npm:**
```bash
# تنظيف الـ cache
npm cache clean --force
npm install
```

### **مشكلة قاعدة البيانات:**
```bash
# إعادة تهيئة قاعدة البيانات
npx prisma migrate reset
npm run db:seed
```

### **مشكلة البورت 3000:**
```bash
# البحث عن العملية التي تستخدم البورت
netstat -ano | findstr :3000

# إيقاف العملية
taskkill /PID [PID] /F
```

---

## 📱 **معلومات هامة للفريق:**

### **Default Admin User:**
- **Email:** admin@wasel.local
- **Password:** ChangeMeAdmin123!
- **Role:** ADMIN

### **API Endpoints:**
- **Swagger:** http://localhost:3000/api
- **Health:** http://localhost:3000/health
- **Base URL:** http://localhost:3000/api/v1

### **Database Access:**
- **Host:** localhost:15432
- **Database:** wasel_palestine_new
- **Tool:** pgAdmin, DBeaver, أو أي PostgreSQL client

---

## 🎯 **نصائح هامة:**

### **🔐 الأمان:**
- لا تشارك ملف .env أبداً
- استخدم JWT_SECRET قوية
- غير كلمة مرور الأدمن في الإنتاج

### **📊 الأداء:**
- استخدم npm run dev للتطوير
- استخدم npm run build للإنتاج
- راقب استخدام الذاكرة والمعالج

### **🔄 التطوير:**
- استخدم feature branches
- عمل code reviews
- اتبع conventional commits

---

## 📞 **للمساعدة:**

### **لأي مشكلة:**
1. شوف `QUICK_START.md`
2. جرب `GET /health`
3. تأكد من `.env` settings
4. تحقق من Docker status

### **للتواصل:**
- **GitHub Issues:** للـ bugs
- **WhatsApp Group:** للأسئلة السريعة
- **Infrastructure Lead:** لمشاكل الـ Auth + Database

---

## ✅ **Checklist قبل البدء:**

- [ ] Node.js 18+ مثبت
- [ ] Docker شغال
- [ ] الريبو منسوخة
- [ ] npm install تم
- [ ] .env معدل
- [ ] Docker container شغال
- [ ] Database migrated
- [ ] Admin seed تم
- [ ] Project يشتغل على localhost:3000
- [ ] Login شغال

---

**🎉 عندما كل شي علامة ✅، أنت جاهز تبدأ التطوير!**
