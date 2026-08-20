<div align="center" style="background-color: #0A0F1D; padding: 40px 20px; border-radius: 16px;">
  <img src="my-app/src/assets/light_trans_logo.png" width="180" alt="Capsule Tahawul Logo" />
  
  <h1 style="color: #ffffff; margin-top: 15px;">كبسولة تحول | Capsule Tahawul</h1>
  
  <p style="color: #94A3B8; font-weight: 500;">
    منصة تدريبية إلكترونية متكاملة ثنائية اللغة تجمع بين الطلاب، المدربين، والشركات<br />
    A comprehensive bilingual digital training platform connecting Students, Trainers, and Enterprise Clients.
  </p>

  <p>
    <a href="https://skillicons.dev"><img src="https://skillicons.dev/icons?i=react,ts,nodejs,express,postgres,prisma,tailwind,vite" alt="Technologies" /></a>
  </p>
</div>

---

## عن المشروع | About the Project

**كبسولة تحول (Capsule Tahawul)** هي منصة تعليمية رقمية متطورة توفر مسارات تعليمية ودورات تدريبية متخصصة في مجالات الهندسة والذكاء الاصطناعي والتكنولوجيا. توفر المنصة نظام إدارة صلاحيات متكامل (طلاب، مدربين، شركات، وأدمن)، مع دعم كامل للدفع الإلكتروني وتوليد الشهادات وإدارة اشتراكات الشركات B2B.

---

## المميزات الرئيسية | Core Features

- **دعم كامل للغتين (العربية والإنجليزية)**: واجهات ديناميكية متجاوبة بالكامل RTL/LTR.
- **نظام مصادقة وأمان متكامل (JWT Auth & Role-Based Access)**: أدوار مخصصة لكل من الطالب، المدرب، الشركة، والأدمن.
- **سلة تسوق ونظام طلبات (Order Management & Moyasar Payment)**: ربط كامل مع بوابة ميسر للدفع الإلكتروني وإدارة صلاحيات الوصول للدورات (120 يوماً).
- **لوحة التحكم للشركات (B2B Company Dashboard)**: طلب برامج تدريبية مخصصة وإدارة عقود التدريب المؤسسي.
- **مساعد الذكاء الاصطناعي للدورات (AI Course Assistant)**: الإجابة التفاعلية على استفسارات الطلاب حول الدورات والمناهج.
- **لوحة تحكم الأدمن (Admin Panel)**: إدارة الحسابات، الموافقة على الدورات، وتتبع العمليات المالية.

---

## التقنيات المستخدمة | Tech Stack

### Frontend (`my-app`)
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Heroicons
- **State & Context**: Context API (Auth, Language, Theme)
- **Routing**: React Router v6

### Backend (`backend`)
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js (v5)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM (v6)
- **Validation & Auth**: Zod, JWT, Bcrypt
- **Testing**: Vitest

---

## الهيكل التنظيمي للمشروع | Project Structure

```text
team_c/
├── backend/                  # السيرفر والـ API
│   ├── prisma/               # مخطط قاعدة البيانات والنشر المبدئي (Schema & Seed)
│   ├── src/
│   │   ├── controllers/      # معالجات الطلبات (Auth, Orders, Admin, Courses, Payment)
│   │   ├── middleware/       # مصادقة وإدارة الأخطاء (JWT Auth, Role Gate, Error Handler)
│   │   ├── repositories/     # الطبقة الخاصة بقاعدة البيانات (Prisma Repositories)
│   │   ├── services/         # المنطق البرمجي للخدمات (Order, Access, Email, Payment)
│   │   └── tests/            # الاختبارات الآلية (Vitest Unit Tests)
│   └── package.json
│
├── my-app/                   # تطبيق الواجهة الأمامية (React + Vite)
│   ├── src/
│   │   ├── components/       # المكونات المكررة والواجهات (Navbars, Footer, Modals)
│   │   ├── context/          # سياق البيانات (AuthContext, LanguageContext)
│   │   ├── pages/            # صفحات التطبيق (Landing, Dashboards, Cart, Payment, etc.)
│   │   ├── services/         # استدعاءات API موحدة (api.ts)
│   │   └── types/            # تعريفات TypeScript
│   └── package.json
│
└── README.md
```

---

## تشغيل المشروع محلياً | Local Setup Guide

### 1. إعداد السيرفر (Backend Setup)

```bash
cd backend
npm install

# إعداد متغيرات البيئة (.env)
# DATABASE_URL="postgresql://user:password@localhost:5432/capsule_db"
# JWT_SECRET="your_jwt_secret"

# تطبيق الهجرة وإضافة البيانات الابتدائية لقاعدة البيانات
npx prisma migrate dev
npx prisma db seed

# تشغيل السيرفر في وضع التطوير
npm run dev
```

### 2. إعداد الواجهة الأمامية (Frontend Setup)

```bash
cd my-app
npm install

# تشغيل السيرفر المحلي
npm run dev
```

### 3. تشغيل الاختبارات الآلية (Running Unit Tests)

```bash
cd backend
npm test
```

---

## فريق العمل | Team Members

- [**Reem AbuAziz**](https://github.com/reemabuaziz)
- [**Ali Al-Taleb**](https://github.com/kimiiine)
- [**Mohammed Al-Qaffas**](https://github.com/Ma16q)
- [**Lana Al-Qahtani**](https://github.com/lana2std)
- [**Youmna Abu-Deeb**](https://github.com/yomna-cs)

